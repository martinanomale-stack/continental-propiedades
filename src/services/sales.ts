// services/sales.ts
import { createClient } from '@/lib/supabase/client'
import type { Sale } from '@/types'

const supabase = createClient()

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*, vendor:profiles!sales_vendor_id_fkey(id, nombre, foto_url)')
    .order('fecha', { ascending: false })
  if (error) throw new Error(error.message)
  return data as Sale[]
}

export async function createManualSale(payload: Omit<Sale, 'id' | 'created_at' | 'tipo'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('sales')
    .insert({ ...payload, tipo: 'manual', created_by: user.id })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Sale
}

export async function updateHonorarios(id: string, tipo: 'auto' | 'manual', honorarios: number) {
  if (tipo === 'auto') {
    // auto sales live in the properties table
    const { error } = await supabase
      .from('properties')
      .update({ honorarios })
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('sales')
      .update({ honorarios })
      .eq('id', id)
    if (error) throw new Error(error.message)
  }
}

export async function deleteManualSale(id: string) {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
