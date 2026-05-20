// services/properties.ts — All property CRUD operations
import { createClient } from '@/lib/supabase/client'
import type { Property, PropertyStatus, PropertyType } from '@/types'

const supabase = createClient()

export interface PropertyFilters {
  search?: string
  estado?: PropertyStatus | ''
  tipo?: PropertyType | ''
  credito?: 'si' | 'no' | ''
  precioMin?: number
  precioMax?: number
  orden?: 'reciente' | 'precio-asc' | 'precio-desc' | 'm2'
}

// ── READ ──────────────────────────────────────────────────────
export async function getProperties(filters: PropertyFilters = {}) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      vendedor:profiles!properties_vendedor_id_fkey(id, nombre, foto_url)
    `)

  if (filters.estado)    query = query.eq('estado', filters.estado)
  if (filters.tipo)      query = query.eq('tipo', filters.tipo)
  if (filters.credito)   query = query.eq('credito', filters.credito)
  if (filters.precioMin) query = query.gte('precio', filters.precioMin)
  if (filters.precioMax) query = query.lte('precio', filters.precioMax)

  if (filters.search) {
    const q = filters.search.toLowerCase()
    query = query.or(`dir.ilike.%${q}%,barrio.ilike.%${q}%,notas.ilike.%${q}%`)
  }

  switch (filters.orden) {
    case 'precio-asc':  query = query.order('precio', { ascending: true }); break
    case 'precio-desc': query = query.order('precio', { ascending: false }); break
    case 'm2':          query = query.order('m2t', { ascending: false }); break
    default:            query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Property[]
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*, vendedor:profiles!properties_vendedor_id_fkey(id, nombre, foto_url)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as Property
}

// ── CREATE ────────────────────────────────────────────────────
export async function createProperty(payload: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('properties')
    .insert({ ...payload, created_by: user.id })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Property
}

// ── UPDATE ────────────────────────────────────────────────────
export async function updateProperty(id: string, payload: Partial<Property>) {
  const { data, error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Property
}

// ── DELETE ────────────────────────────────────────────────────
export async function deleteProperty(id: string) {
  // First delete images from storage
  const { data: prop } = await supabase
    .from('properties')
    .select('imagenes')
    .eq('id', id)
    .single()

  if (prop?.imagenes?.length) {
    const paths = prop.imagenes.map((url: string) => {
      const parts = url.split('/property-images/')
      return parts[1] || url
    })
    await supabase.storage.from('property-images').remove(paths)
  }

  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── IMAGES ───────────────────────────────────────────────────
export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${propertyId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('property-images')
    .upload(path, file, { upsert: false })
  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(path)

  return publicUrl
}

export async function deletePropertyImage(url: string) {
  const path = url.split('/property-images/')[1]
  if (!path) return
  await supabase.storage.from('property-images').remove([path])
}

// ── STATS ────────────────────────────────────────────────────
export async function getPropertyStats() {
  const { data, error } = await supabase
    .from('properties')
    .select('estado')
  if (error) throw new Error(error.message)

  return {
    total:      data.length,
    disponible: data.filter(p => p.estado === 'Disponible').length,
    reservada:  data.filter(p => p.estado === 'Reservada').length,
    consulta:   data.filter(p => p.estado === 'En consulta').length,
    vendida:    data.filter(p => p.estado === 'Vendida').length,
  }
}
