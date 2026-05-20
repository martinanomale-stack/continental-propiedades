// services/auth.ts — Authentication operations
import { createClient } from '@/lib/supabase/client'
import type { AppUser, Role } from '@/types'

const supabase = createClient()

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser(): Promise<AppUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as AppUser | null
}

export async function resetPasswordForEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  })
  if (error) throw new Error(error.message)
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

// Register vendor via invitation
export async function registerVendorFromInvite(
  token: string,
  nombre: string,
  email: string,
  password: string,
  fotoFile?: File
) {
  // Validate invitation
  const { data: invite, error: invErr } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (invErr || !invite) throw new Error('Invitación inválida o expirada.')
  if (invite.used) throw new Error('Este link ya fue utilizado.')
  if (new Date(invite.expires_at) < new Date()) throw new Error('Este link expiró.')

  // Sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, role: 'vendor' as Role },
    },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Error al crear la cuenta.')

  // Upload photo if provided
  let foto_url: string | null = null
  if (fotoFile) {
    try {
      const path = `${data.user.id}/profile.jpg`
      await supabase.storage.from('vendor-photos').upload(path, fotoFile, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('vendor-photos').getPublicUrl(path)
      foto_url = publicUrl

      await supabase.from('profiles').update({ foto_url }).eq('id', data.user.id)
    } catch {}
  }

  // Mark invitation used
  await supabase
    .from('invitations')
    .update({ used: true, used_by: data.user.id })
    .eq('token', token)

  return data
}

// Create invitation link (admin only)
export async function createInvitation(email: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const payload = { email, createdAt: Date.now(), nonce: Math.random().toString(36).slice(2, 10) }
  const token = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const { data, error } = await supabase
    .from('invitations')
    .insert({ token, email, created_by: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return { ...data, link: `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}` }
}
