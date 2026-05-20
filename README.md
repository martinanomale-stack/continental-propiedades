# Continental Propiedades — SaaS Inmobiliario

Sistema de gestión inmobiliaria profesional. Migración desde HTML single-file a aplicación web full-stack real.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14, TypeScript, React 18 |
| Estilos | CSS Modules + Variables CSS originales (sin romper diseño) |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (broadcast + postgres_changes) |
| Hosting | Vercel |
| Mapas | Leaflet.js |

---

## Arquitectura

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fonts, CSS vars)
│   ├── globals.css             # Design tokens — NO TOCAR
│   ├── login/page.tsx          # Login + recuperar contraseña
│   ├── invite/page.tsx         # Registro vendedor por link
│   ├── guest/page.tsx          # Vista invitado (solo lectura)
│   ├── dashboard/page.tsx      # App shell principal
│   └── api/                    # Route Handlers (server-side)
│       ├── auth/               # Callbacks OAuth
│       ├── properties/         # CRUD propiedades
│       ├── vendors/            # Gestión vendedores
│       ├── visits/             # Visitas
│       ├── sales/              # Ventas y honorarios
│       ├── matching/           # Clientes matching
│       └── preventa/           # Checklists pre-venta
│
├── components/
│   ├── layout/                 # Topbar, AppShell
│   ├── ui/                     # Modal, Toast, Button, Badge (reutilizables)
│   ├── properties/             # PropertyGrid, PropertyCard, PropertyModal, DetailModal
│   ├── matching/               # MatchingModal, MatchingCard, MatchingForm
│   ├── visits/                 # VisitasSidebar, VisitaCard, NuevaVisitaModal
│   ├── sales/                  # VentasSidebar, VentasModal
│   ├── preventa/               # PreventaModal, ChecklistItem
│   ├── auth/                   # LoginForm, VendorRegistration, WelcomeOverlay
│   └── notifications/          # SaleNotification, MatchNotification
│
├── hooks/
│   ├── useAuth.ts              # Sesión + perfil del usuario
│   ├── useRealtime.ts          # Subscripciones Supabase Realtime
│   └── useSiteConfig.ts        # Branding + CSS vars dinámicos
│
├── services/                   # Capa de acceso a datos (Supabase client)
│   ├── auth.ts                 # signIn, signOut, register, invite
│   ├── properties.ts           # CRUD + upload imágenes
│   ├── vendors.ts              # Perfiles + fotos
│   ├── visits.ts               # CRUD visitas + llaves
│   ├── sales.ts                # Ventas + honorarios
│   ├── matching.ts             # CRUD matching + algoritmo de match
│   └── config.ts               # SiteConfig CRUD
│
├── types/index.ts              # Todos los tipos TypeScript del dominio
├── utils/format.ts             # Helpers: fmtPrecio, fmtM2, compressImage, sounds
└── lib/supabase/
    ├── client.ts               # Browser client
    └── server.ts               # Server Component client + admin client

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Schema completo + RLS + Storage
```

---

## Instalación local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-org/continental-propiedades.git
cd continental-propiedades
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar `.env.example` → `.env.local`
3. Completar las variables con los datos del proyecto:

```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo server-side
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Ejecutar la migración de base de datos

**Opción A — Supabase CLI:**
```bash
npx supabase link --project-ref tu-project-id
npx supabase db push
```

**Opción B — SQL Editor:**
1. Ir a Supabase Dashboard → SQL Editor
2. Pegar el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecutar

### 4. Crear el primer usuario admin

En Supabase Dashboard → Authentication → Users → "Add user":
- Email: `admin@tuinmobiliaria.com`
- Password: tu contraseña segura

Luego en SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@tuinmobiliaria.com';
```

### 5. Correr el servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

### 1. Conectar repositorio

```bash
npx vercel --prod
```

O via [vercel.com/dashboard](https://vercel.com/dashboard) → Import Git Repository.

### 2. Variables de entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables, agregar:

```
NEXT_PUBLIC_SUPABASE_URL        = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...   (marcar como Sensitive)
NEXT_PUBLIC_APP_URL             = https://tu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME            = Continental Propiedades
NEXT_PUBLIC_APP_SUBTITLE        = · Río Cuarto
```

### 3. Configurar URL en Supabase

En Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://tu-dominio.vercel.app`
- Redirect URLs: `https://tu-dominio.vercel.app/**`

---

## Base de datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Usuarios (extiende `auth.users`) |
| `site_config` | Branding, colores, configuración |
| `properties` | Propiedades inmobiliarias |
| `visits` | Visitas agendadas |
| `sales` | Ventas externas/manuales |
| `matching_clients` | Clientes del sistema de matching |
| `preventa_checklists` | Checklists pre-venta por propiedad |
| `invitations` | Links de invitación para vendedores |
| `access_logs` | Historial de accesos |

### Row Level Security (RLS)

Cada tabla tiene políticas RLS que garantizan:
- **Admin**: acceso total a todo
- **Vendor**: solo ve sus propias visitas, puede crear matching/pedidos, actualizar su perfil
- **Guest**: solo lectura de propiedades
- **Anónimo**: sin acceso (redirige a login)

### Realtime

Las tablas `properties`, `visits`, `sales` y `matching_clients` tienen Realtime habilitado. Los cambios se propagan automáticamente a todos los usuarios conectados sin recargar la página.

---

## Funcionalidades

### ✅ Implementadas (migradas del HTML)
- Listado de propiedades (grid + lista)
- Filtros: estado, tipo, crédito, precio, orden
- Modal detalle de propiedad con galería
- CRUD completo de propiedades (admin)
- Upload de imágenes con compresión
- Sistema de visitas con control de llaves
- Sistema de ventas y honorarios
- Módulo de matching de clientes (pedidos)
- Checklist pre-venta con semáforo
- Notificación de venta (sonido + animación)
- Notificación de match (sonido + animación)
- Gestión de vendedores + foto carnet
- Links de invitación para nuevos vendedores
- Panel del vendedor (stats propias, visitas, perfil)
- Configuración de apariencia (colores, logo, fuente)
- Historial de accesos
- Pantalla de bienvenida pixel art (nuevo vendedor)
- Modo invitado (solo lectura)

### 🔧 Preparado para crecer
- CRM de clientes (estructura en matching_clients)
- Pipeline de ventas (estados de properties + sales)
- Integración WhatsApp (campo `tel` en matching)
- Calendario (visits → Google Calendar API)
- Comisiones avanzadas (honorarios en sales)
- Reportes (queries sobre properties + sales)
- IA (análisis de matching, descripción automática)

---

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (pública) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (privada) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL del frontend | ✅ |
| `NEXT_PUBLIC_APP_NAME` | Nombre del sitio | ❌ |
| `NEXT_PUBLIC_APP_SUBTITLE` | Subtítulo del sitio | ❌ |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API key | ❌ |

---

## Comandos útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run type-check   # Verificar tipos TypeScript
npm run lint         # Lint
npx supabase db push # Aplicar migraciones
npx supabase gen types typescript --project-id tu-id > src/types/supabase.ts  # Generar tipos desde DB
```

---

## Notas de migración

El proyecto fue migrado desde un único archivo HTML de ~5900 líneas a esta arquitectura. Se preservaron:
- **100% de las funcionalidades** originales
- **Exactamente el mismo diseño visual** (colores, tipografías, layout, componentes)
- **Toda la lógica de negocio** (matching, pre-venta, llaves, honorarios, etc.)

Lo que cambió es la infraestructura: localStorage → Supabase PostgreSQL, sincronización entre dispositivos, autenticación real, y código organizado en componentes reutilizables.
