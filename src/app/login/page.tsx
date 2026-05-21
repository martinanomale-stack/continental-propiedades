'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) throw error
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '2rem', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 48, height: 48, background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22 }}>Continental Propiedades</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Ingresá con tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', outline: 'none' }} />
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 13, background: 'var(--danger-light)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ padding: '10px', border: 'none', borderRadius: 'var(--radius)', background: loading ? 'var(--text3)' : 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <button type="button" onClick={() => window.location.href = '/guest'}
            style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Ver propiedades como invitado
          </button>
        </form>
      </div>
    </div>
  )
}
