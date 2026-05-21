'use client'
export const dynamic = 'force-dynamic'
// app/login/page.tsx
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/services/auth'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)

  // If already logged in, redirect
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim().toLowerCase(), password)
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.replace(redirectTo)
    } catch (err: any) {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2rem',
        width: '100%',
        maxWidth: '380px',
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 48, height: 48,
            background: 'var(--accent)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--text)' }}>
            Continental Propiedades
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            Ingresá con tu cuenta
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              style={{
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontFamily: 'DM Sans, sans-serif',
                color: 'var(--text)',
                background: 'var(--bg)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif',
                  color: 'var(--text)',
                  background: 'var(--bg)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 13, background: 'var(--danger-light)', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--radius)',
              background: loading ? 'var(--text3)' : 'var(--accent)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'background 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/guest')}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'none',
              color: 'var(--text2)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Ver propiedades como invitado
          </button>

          <button
            type="button"
            onClick={() => router.push('/login/recover')}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'center' }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </div>
  )
}
