'use client'
// components/layout/Topbar.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/services/auth'
import type { AppUser, SiteConfig } from '@/types'

interface Props {
  user: AppUser
  config: SiteConfig
}

export default function Topbar({ user, config }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const isAdmin  = user.role === 'admin'
  const isVendor = user.role === 'vendor'
  const isGuest  = user.role === 'guest'

  async function handleLogout() {
    if (!confirm('¿Cerrar sesión?')) return
    setLoggingOut(true)
    await signOut()
    router.replace('/login')
  }

  const roleBadgeStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, padding: '3px 9px',
    borderRadius: 100, letterSpacing: '0.04em',
    background: isGuest  ? 'rgba(212,160,18,0.3)'  :
                isVendor ? 'rgba(26,74,122,0.35)'   : 'rgba(255,255,255,0.2)',
    border: isGuest  ? '1px solid rgba(212,160,18,0.5)' :
            isVendor ? '1px solid rgba(26,74,122,0.5)'  : '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
  }

  return (
    <div className="topbar" id="topbar">
      {/* Logo */}
      <div className="topbar-logo" id="topbarLogo">
        {config.logo_url ? (
          <img src={config.logo_url} className="logo-img" alt="logo" />
        ) : (
          <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
            <path d="M9 21V12h6v9"/>
          </svg>
        )}
        <span>{config.nombre || 'Inmobiliaria'}</span>
        {config.subtitulo && <span className="sub">{config.subtitulo}</span>}
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        <span style={roleBadgeStyle}>
          {isAdmin ? 'ADMIN' : isVendor ? 'VENDEDOR' : 'INVITADO'}
        </span>

        {/* Matching button — admin + vendor */}
        {(isAdmin || isVendor) && (
          <button
            className="btn-topbar"
            onClick={() => router.push('/dashboard?modal=matching')}
            title="Matching de clientes"
            style={{ background: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            💞 Matching
          </button>
        )}

        {/* Share guest link — admin only */}
        {isAdmin && (
          <button className="btn-topbar" onClick={() => router.push('/dashboard?modal=share')} title="Compartir acceso">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Compartir
          </button>
        )}

        {/* Logout */}
        <button className="btn-topbar" onClick={handleLogout} disabled={loggingOut} title="Cerrar sesión">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>

        {/* Config — admin only */}
        {isAdmin && (
          <button className="btn-topbar" onClick={() => router.push('/dashboard?modal=config')} title="Configuración">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        )}

        {/* Vendor management — admin only */}
        {isAdmin && (
          <button className="btn-topbar" onClick={() => router.push('/dashboard?modal=vendors')} title="Gestionar vendedores">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </button>
        )}

        {/* New property — admin only */}
        {isAdmin && (
          <button className="btn-new" onClick={() => router.push('/dashboard?modal=newProperty')}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nueva propiedad
          </button>
        )}

        {/* Vendor panel button — added dynamically in aplicarRol in original */}
        {isVendor && (
          <button className="btn-topbar" onClick={() => router.push('/dashboard?modal=vendorPanel')}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Mi panel
          </button>
        )}
      </div>
    </div>
  )
}
