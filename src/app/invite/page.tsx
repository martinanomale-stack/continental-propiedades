'use client'
// app/invite/page.tsx — Vendor registration via invitation link
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { registerVendorFromInvite } from '@/services/auth'
import { createClient } from '@/lib/supabase/client'
import { compressCropSquare } from '@/utils/format'

export default function InvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''

  const [nombre,  setNombre]  = useState('')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [pass2,   setPass2]   = useState('')
  const [foto,    setFoto]    = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    if (!token) { setError('Link inválido.'); setValidating(false); return }
    const supabase = createClient()
    supabase.from('invitations')
      .select('email, used, expires_at')
      .eq('token', token)
      .single()
      .then(({ data, error: e }) => {
        if (e || !data) { setError('Invitación inválida o expirada.') }
        else if (data.used) { setError('Este link ya fue utilizado.') }
        else if (new Date(data.expires_at) < new Date()) { setError('Este link expiró (válido 72 hs).') }
        else { setInviteEmail(data.email); setEmail(data.email) }
        setValidating(false)
      })
  }, [token])

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressCropSquare(file)
      setFoto(compressed)
      setPreview(URL.createObjectURL(compressed))
    } catch { setFoto(file); setPreview(URL.createObjectURL(file)) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) { setError('Ingresá tu nombre.'); return }
    if (!pass || pass.length < 6) { setError('Contraseña de al menos 6 caracteres.'); return }
    if (pass !== pass2) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      await registerVendorFromInvite(token, nombre.trim(), email.trim().toLowerCase(), pass, foto || undefined)
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const box: React.CSSProperties = {
    minHeight: '100vh', background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  }
  const card: React.CSSProperties = {
    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)', padding: '2rem', width: '100%', maxWidth: '400px',
  }

  if (validating) return <div style={box}><div style={card}><p style={{ color: 'var(--text3)', textAlign: 'center' }}>Verificando invitación...</p></div></div>

  if (error && !inviteEmail) return (
    <div style={box}>
      <div style={card}>
        <div style={{ textAlign: 'center', color: 'var(--danger)', fontSize: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          {error}
          <br />
          <a href="/login" style={{ color: 'var(--accent)', marginTop: 12, display: 'block' }}>Ir al login</a>
        </div>
      </div>
    </div>
  )

  return (
    <div style={box}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, marginBottom: 4 }}>🎉 Crear tu cuenta</div>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>Fuiste invitado/a como vendedor. Completá tus datos.</p>
        </div>

        {/* Photo upload */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <label style={{
            width: 80, height: 80, borderRadius: '50%', border: '2px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 8px', cursor: 'pointer', overflow: 'hidden',
          }}>
            {preview ? (
              <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
            ) : (
              <svg width="28" height="28" fill="none" stroke="var(--text3)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Foto carnet (opcional)</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Nombre completo *', value: nombre, onChange: setNombre, placeholder: 'Tu nombre', type: 'text' },
            { label: 'Email', value: email, onChange: setEmail, placeholder: 'tu@email.com', type: 'email', disabled: !!inviteEmail },
            { label: 'Contraseña *', value: pass, onChange: setPass, placeholder: '••••••••', type: 'password' },
            { label: 'Confirmar contraseña *', value: pass2, onChange: setPass2, placeholder: '••••••••', type: 'password' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input
                type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder} disabled={f.disabled} required={!f.disabled}
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
                  background: f.disabled ? 'var(--surface2)' : 'var(--bg)', color: 'var(--text)', outline: 'none',
                }}
              />
            </div>
          ))}

          {error && <div style={{ color: 'var(--danger)', fontSize: 13, background: 'var(--danger-light)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            padding: '10px', border: 'none', borderRadius: 'var(--radius)',
            background: loading ? 'var(--text3)' : 'var(--accent)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', marginTop: 4,
          }}>
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
