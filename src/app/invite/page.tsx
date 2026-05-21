'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InvitePage() {
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [pass,     setPass]     = useState('')
  const [pass2,    setPass2]    = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const token = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('token') || ''
    : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    if (pass.length < 6) { setError('Contraseña de al menos 6 caracteres.'); return }
    if (pass !== pass2) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: pass,
        options: { data: { nombre: nombre.trim(), role: 'vendor' } }
      })
      if (error) throw error
      await supabase.from('invitations').update({ used: true }).eq('token', token)
      setSuccess(true)
      setTimeout(() => window.location.href = '/dashboard', 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22 }}>¡Cuenta creada!</div>
        <div style={{ color: 'var(--text3)', marginTop: 8 }}>Redirigiendo...</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, marginBottom: 4 }}>🎉 Crear tu cuenta</div>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>Fuiste invitado/a como vendedor.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Nombre completo *', value: nombre, onChange: setNombre, placeholder: 'Tu nombre', type: 'text' },
            { label: 'Email *', value: email, onChange: setEmail, placeholder: 'tu@email.com', type: 'email' },
            { label: 'Contraseña *', value: pass, onChange: setPass, placeholder: '••••••••', type: 'password' },
            { label: 'Confirmar contraseña *', value: pass2, onChange: setPass2, placeholder: '••••••••', type: 'password' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', outline: 'none' }} />
            </div>
          ))}

          {error && <div style={{ color: 'var(--danger)', fontSize: 13, background: 'var(--danger-light)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{ padding: '10px', border: 'none', borderRadius: 'var(--radius)', background: loading ? 'var(--text3)' : 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
