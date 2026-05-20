// services/matching.ts
import { createClient } from '@/lib/supabase/client'
import type { MatchingClient, MatchPair } from '@/types'

const supabase = createClient()

export async function getMatchingClients(): Promise<MatchingClient[]> {
  const { data, error } = await supabase
    .from('matching_clients')
    .select('*, vendor:profiles!matching_clients_vendor_id_fkey(id, nombre)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data as MatchingClient[]
}

export async function createMatchingClient(payload: Omit<MatchingClient, 'id' | 'created_at' | 'updated_at' | 'vendor'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('matching_clients')
    .insert({ ...payload, created_by: user.id })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as MatchingClient
}

export async function updateMatchingClient(id: string, payload: Partial<MatchingClient>) {
  const { data, error } = await supabase
    .from('matching_clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as MatchingClient
}

export async function deleteMatchingClient(id: string) {
  const { error } = await supabase.from('matching_clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Pure client-side matching logic (no DB call needed)
export function calcularMatches(clientes: MatchingClient[]): MatchPair[] {
  const buscadores    = clientes.filter(c => c.tipo === 'Busca comprar')
  const vendedores    = clientes.filter(c => c.tipo === 'Vende / permuta')
  const financiadores = clientes.filter(c => c.tipo === 'Puede financiar')

  const zonaMatch = (zA?: string, zB?: string) => {
    if (!zA || !zB) return false
    const a = zA.toLowerCase(); const b = zB.toLowerCase()
    return a.split(',').some(p => b.includes(p.trim())) || b.split(',').some(p => a.includes(p.trim()))
  }
  const arrMatch = (a?: string[], b?: string[]) => a?.some(x => b?.includes(x)) ?? false

  const matches: MatchPair[] = []

  buscadores.forEach(b => {
    vendedores.forEach(v => {
      let score = 0; const razones: string[] = []
      if (b.presupuesto && v.presupuesto) {
        if (+b.presupuesto >= +v.presupuesto)             { score += 3; razones.push('Presupuesto compatible') }
        else if (+b.presupuesto >= +v.presupuesto * 0.85) { score += 2; razones.push('Presupuesto aproximado') }
        else if (+b.presupuesto >= +v.presupuesto * 0.70) { score += 1; razones.push('Presupuesto cercano') }
      }
      if (zonaMatch(b.zona, v.zona))                      { score += 2; razones.push('Misma zona') }
      if (arrMatch(b.tipos_prop, v.tipos_prop))            { score += 2; razones.push('Mismo tipo de propiedad') }
      if (arrMatch(b.entrega, v.recibe))                   { score += 3; razones.push('Permuta compatible') }
      if (b.credito)                                       { score += 1; razones.push('Opera con crédito') }
      if (score > 0) matches.push({ a: b, b: v, score, razones, tipo: 'compra-venta' })
    })

    financiadores.forEach(f => {
      let score = 0; const razones: string[] = []
      if (f.presupuesto && b.presupuesto) {
        if (+f.presupuesto >= +b.presupuesto * 0.5) { score += 3; razones.push('Financiamiento suficiente') }
        else if (+f.presupuesto > 0)                { score += 1; razones.push('Financiamiento parcial') }
      }
      if (zonaMatch(b.zona, f.zona))                 { score += 2; razones.push('Misma zona') }
      if (arrMatch(b.tipos_prop, f.tipos_prop))       { score += 2; razones.push('Mismo tipo de propiedad') }
      if (score > 0) matches.push({ a: b, b: f, score, razones, tipo: 'financiamiento' })
    })
  })

  vendedores.forEach(v => {
    financiadores.forEach(f => {
      let score = 0; const razones: string[] = []
      if (v.presupuesto && f.presupuesto && +f.presupuesto >= +v.presupuesto * 0.7) { score += 3; razones.push('Financiamiento cubre precio') }
      if (zonaMatch(v.zona, f.zona))              { score += 2; razones.push('Misma zona') }
      if (arrMatch(v.tipos_prop, f.tipos_prop))   { score += 2; razones.push('Tipo de propiedad buscado') }
      if (score > 0) matches.push({ a: v, b: f, score, razones, tipo: 'inversion' })
    })
  })

  return matches.sort((a, b) => b.score - a.score)
}

// ── Preventa ──────────────────────────────────────────────────
export async function getOrCreatePreventa(propertyId: string) {
  const { data, error } = await supabase
    .from('preventa_checklists')
    .select('*')
    .eq('property_id', propertyId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (data) return data

  const { data: created, error: createErr } = await supabase
    .from('preventa_checklists')
    .insert({ property_id: propertyId })
    .select()
    .single()
  if (createErr) throw new Error(createErr.message)
  return created
}

export async function updatePreventa(propertyId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('preventa_checklists')
    .upsert({ property_id: propertyId, ...payload })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
