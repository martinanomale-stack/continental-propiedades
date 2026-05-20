// services/visits.ts
import { createClient } from '@/lib/supabase/client'
import type { Visit } from '@/types'

const supabase = createClient()

export async function getVisits(vendorId?: string): Promise<Visit[]> {
  let query = supabase
    .from('visits')
    .select(`
      *,
      property:properties(id, dir, barrio, tipo),
      vendor:profiles!visits_vendor_id_fkey(id, nombre)
    `)
    .order('fecha', { ascending: true })

  if (vendorId) query = query.eq('vendor_id', vendorId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Visit[]
}

export async function createVisit(payload: {
  property_id: string
  vendor_id: string | null
  cliente: string
  nota: string
  fecha: string
  llave_retirada: boolean
  llave_devuelta: boolean
  agendado_por_admin: boolean
}) {
  const { data, error } = await supabase.from('visits').insert(payload).select().single()
  if (error) throw new Error(error.message)
  return data as Visit
}

export async function updateVisit(id: string, payload: Partial<Visit>) {
  const { data, error } = await supabase.from('visits').update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data as Visit
}

export async function deleteVisit(id: string) {
  const { error } = await supabase.from('visits').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markKeyReturned(id: string) {
  return updateVisit(id, { llave_devuelta: true })
}
