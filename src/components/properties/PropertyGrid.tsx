'use client'
import { useState, useEffect, useCallback } from 'react'
import { getProperties, deleteProperty } from '@/services/properties'
import { toast } from '@/components/ui/Toast'

interface Props {
  user: any
  isAdmin: boolean
  isVendor: boolean
  config: any
  onSaleNotif: (p: any, v: any) => void
  openModal?: string | null
  onModalClose?: () => void
}

export default function PropertyGrid({ user, isAdmin, openModal, onModalClose }: Props) {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProperties({ search })
      setProperties(data)
    } catch (e: any) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (openModal) onModalClose?.() }, [openModal])

  return (
    <div style={{ padding: '1.5rem' }}>
      <input
        placeholder="🔍 Buscar dirección, barrio..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 400, padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, marginBottom: '1.5rem', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
      />
      {loading ? (
        <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '3rem' }}>Cargando propiedades...</div>
      ) : properties.length === 0 ? (
        <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
          No hay propiedades cargadas todavía.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 18 }}>
          {properties.map(p => (
            <div key={p.id} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' }}>
              {p.imagenes?.[0] && <img src={p.imagenes[0]} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} alt={p.dir} />}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{p.tipo}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{p.dir}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{p.barrio}</div>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--accent)', marginTop: 8 }}>
                  U$D {Number(p.precio).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
