// services/vendors.ts
import { createClient } from '@/lib/supabase/client'
import type { Vendor } from '@/types'

const supabase = createClient()

export async function getVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'guest')
    .order('created_at')
  if (error) throw new Error(error.message)
  return data as Vendor[]
}

export async function toggleVendorActive(id: string, activo: boolean) {
  const { error } = await supabase.from('profiles').update({ activo }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteVendor(id: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateVendorProfile(id: string, payload: { nombre?: string; email?: string }) {
  const { error } = await supabase.from('profiles').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function uploadVendorPhoto(userId: string, file: File): Promise<string> {
  const path = `${userId}/profile.jpg`
  const { error } = await supabase.storage
    .from('vendor-photos')
    .upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = supabase.storage.from('vendor-photos').getPublicUrl(path)
  await supabase.from('profiles').update({ foto_url: publicUrl }).eq('id', userId)
  return publicUrl
}

export async function getInvitations() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function revokeInvitation(token: string) {
  const { error } = await supabase.from('invitations').delete().eq('token', token)
  if (error) throw new Error(error.message)
}
