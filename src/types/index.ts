// ── Property filters ─────────────────────────────────────────
export interface PropertyFilters {
  search?: string
  estado?: PropertyStatus | ''
  tipo?: PropertyType | ''
  credito?: 'si' | 'no' | ''
  precioMin?: number
  precioMax?: number
  orden?: 'reciente' | 'precio-asc' | 'precio-desc' | 'm2'
}
