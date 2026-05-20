// ─────────────────────────────────────────────────────────────
//  DOMAIN TYPES  — mirrors database schema exactly
//  All optional DB fields are typed as | null for Supabase compat
// ─────────────────────────────────────────────────────────────

// ── Roles ────────────────────────────────────────────────────
export type Role = 'admin' | 'vendor' | 'guest'

export interface AppUser {
  id: string
  email: string
  nombre: string
  role: Role
  activo: boolean
  foto_url: string | null
  created_at: string
  updated_at: string
}

// ── Properties ───────────────────────────────────────────────
export type PropertyStatus = 'Disponible' | 'Reservada' | 'En consulta' | 'Vendida'
export type PropertyType   = 'Casa' | 'Departamento' | 'PH' | 'Lote' | 'Local' | 'Campo' | 'Oficina' | 'Cochera'
export type CreditStatus   = 'si' | 'no'

export interface PropertyServices {
  agua:      boolean
  luz:       boolean
  gas:       boolean
  cloacas:   boolean
  pavimento: boolean
}

export interface Property {
  id: string
  dir: string
  barrio: string
  tipo: PropertyType
  precio: number
  estado: PropertyStatus
  m2t: number
  m2c: number
  amb: number
  dorm: number
  banos: number
  antig: string
  cont: string
  notas: string
  desc: string
  fuente: string
  lat: number | null
  lng: number | null
  credito: CreditStatus
  llave_prop: boolean
  servicios: PropertyServices
  imagenes: string[]           // Supabase Storage URLs
  vendedor_id: string | null   // FK → profiles.id
  honorarios: number | null
  fecha_venta: string | null
  created_at: string
  updated_at: string
  created_by: string           // FK → profiles.id
}

// ── Vendors / Users ──────────────────────────────────────────
export interface Vendor {
  id: string
  nombre: string
  email: string
  role: Role
  activo: boolean
  foto_url: string | null
  created_at: string
}

// ── Site Config ──────────────────────────────────────────────
export interface SiteConfig {
  id: string
  nombre: string
  subtitulo: string
  logo_url: string | null
  accent: string
  accent2: string
  bg: string
  surface: string
  border: string
  text_color: string
  fuente: string
  show_stats: boolean
  bold_shadow: boolean
  round_cards: boolean
  pin: string | null
  recovery_email: string | null
  updated_at: string
}

// ── Visits ───────────────────────────────────────────────────
export interface Visit {
  id: string
  property_id: string
  vendor_id: string | null
  cliente: string
  nota: string
  fecha: string               // ISO timestamp
  llave_retirada: boolean
  llave_devuelta: boolean
  agendado_por_admin: boolean
  created_at: string
  // Joined
  property?: Pick<Property, 'id' | 'dir' | 'barrio' | 'tipo'>
  vendor?: Pick<Vendor, 'id' | 'nombre'>
}

// ── Sales / Honorarios ───────────────────────────────────────
export type SaleType = 'auto' | 'manual'

export interface Sale {
  id: string
  tipo: SaleType
  dir: string
  barrio: string
  precio: number
  honorarios: number | null
  fecha: string
  vendor_id: string | null
  vendor_nombre: string | null
  property_id: string | null
  created_by: string
  created_at: string
}

// ── Matching ─────────────────────────────────────────────────
export type MatchingRole = 'Busca comprar' | 'Vende / permuta' | 'Puede financiar'

export interface MatchingClient {
  id: string
  tipo: MatchingRole
  nombre: string
  tel: string
  desc: string
  presupuesto: number
  zona: string
  tipos_prop: string[]
  entrega: string[]
  recibe: string[]
  dorm_min: number
  dorm_max: number
  m2_min: number
  credito: boolean
  vendor_id: string | null
  created_by: string
  created_at: string
  // Joined
  vendor?: Pick<Vendor, 'id' | 'nombre'>
}

export interface MatchPair {
  a: MatchingClient
  b: MatchingClient
  score: number
  razones: string[]
  tipo: 'compra-venta' | 'financiamiento' | 'inversion'
}

// ── Pre-venta checklist ──────────────────────────────────────
export type ChecklistStatus = 0 | 1 | 2 | 3  // vacio | completo | faltan | critico

export interface PreventaItem {
  id: string
  property_id: string
  escritura:   ChecklistStatus
  impuestos:   ChecklistStatus
  plano:       ChecklistStatus
  reglamento:  ChecklistStatus
  dni:         ChecklistStatus
  boleto:      ChecklistStatus
  locacion:    ChecklistStatus
  inhibicion:  ChecklistStatus
  hipoteca:    ChecklistStatus
  cit:         ChecklistStatus
  deadline_escritura: string | null
  deadline_senia:     string | null
  deadline_credito:   string | null
  deadline_otro:      string | null
  deadline_otro_label: string | null
  updated_at: string
}

// ── Invitations ──────────────────────────────────────────────
export interface Invitation {
  id: string
  token: string
  email: string
  used: boolean
  used_by: string | null
  expires_at: string
  created_by: string
  created_at: string
}

// ── Access Log ───────────────────────────────────────────────
export interface AccessLog {
  id: string
  accion: string
  user_id: string | null
  ip: string | null
  created_at: string
}

// ── Realtime payload ─────────────────────────────────────────
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: Partial<T>
  table: string
}

// ── API response wrapper ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// ── Notifications ────────────────────────────────────────────
export type NotifType = 'sale' | 'match'

export interface SaleNotification {
  type: 'sale'
  property: Property
  vendor: Vendor | null
}

export interface MatchNotification {
  type: 'match'
  matches: MatchPair[]
  newCount: number
}

export type AppNotification = SaleNotification | MatchNotification
