'use client'
// components/properties/PropertyGrid.tsx
import { useState, useEffect, useCallback } from 'react'
import PropertyCard from './PropertyCard'
import PropertyModal from './PropertyModal'
import PropertyDetail from './PropertyDetail'
import PreventaModal from '@/components/preventa/PreventaModal'
import MatchingModal from '@/components/matching/MatchingModal'
import VendorManagementModal from '@/components/vendors/VendorManagementModal'
import ConfigModal from '@/components/config/ConfigModal'
import VentasModal from '@/components/sales/VentasModal'
import { getProperties, deleteProperty } from '@/services/properties'
import { toast } from '@/components/ui/Toast'
import { broadcastSale } from '@/hooks/useRealtime'
import type { Property, AppUser, SiteConfig, PropertyFilters } from '@/types'
import styles from './PropertyGrid.module.css'

interface Props {
  user: AppUser
  isAdmin: boolean
  isVendor: boolean
  config: SiteConfig
  onSaleNotif: (p: Property, v: any) => void
  // Modal triggers from URL params or topbar
  openModal?: string | null
  onModalClose?: () => void
}

const TIPOS  = ['Casa','Departamento','PH','Lote','Local','Campo','Oficina','Cochera']
const ESTADOS = ['Disponible','Reservada','En consulta','Vendida']

export default function PropertyGrid({ user, isAdmin, isVendor, config, onSaleNotif, openModal, onModalClose }: Props) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]       = useState(true)
  const [vista, setVista]           = useState<'grid'|'lista'>('grid')
  const [filters, setFilters]       = useState<PropertyFilters>({})
  const [search, setSearch]         = useState('')

  // Modal state
  const [detailProp,   setDetailProp]   = useState<Property | null>(null)
  const [editProp,     setEditProp]     = useState<Property | null | 'new'>('new' as any)
  const [preventaId,   setPreventaId]   = useState<string | null>(null)
  const [showMatching, setShowMatching] = useState(false)
  const [showVendors,  setShowVendors]  = useState(false)
  const [showConfig,   setShowConfig]   = useState(false)
  const [showVentas,   setShowVentas]   = useState(false)
  const [showNewProp,  setShowNewProp]  = useState(false)
  const [confirmDel,   setConfirmDel]   = useState<string | null>(null)

  // Open modals from URL/topbar
  useEffect(() => {
    if (!openModal) return
    if (openModal === 'matching')    setShowMatching(true)
    if (openModal === 'vendors')     setShowVendors(true)
    if (openModal === 'config')      setShowConfig(true)
    if (openModal === 'newProperty') setShowNewProp(true)
    if (openModal === 'ventas')      setShowVentas(true)
    onModalClose?.()
  }, [openModal, onModalClose])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProperties({ ...filters, search })
      setProperties(data)
    } catch (e: any) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta propiedad? No se puede deshacer.')) return
    try {
      await deleteProperty(id)
      toast('Propiedad eliminada', 'info')
      load()
    } catch (e: any) { toast(e.message, 'error') }
  }

  function handleSaved(prop: Property, isNew: boolean) {
    load()
    setShowNewProp(false)
    setEditProp(null)
    toast(isNew ? '✓ Propiedad guardada' : '✓ Propiedad actualizada', 'success')
    // If saved as Vendida, broadcast sale notification
    if (prop.estado === 'Vendida') {
      broadcastSale(prop, null)
      onSaleNotif(prop, null)
    }
  }

  const displayed = properties.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return [p.dir, p.barrio, p.notas, p.tipo].join(' ').toLowerCase().includes(q)
  })

  return (
    <>
      {/* Filters bar */}
      <div className={styles.filtersBar}>
        <input
          className={styles.searchInput}
          placeholder="🔍 Buscar dirección, barrio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={styles.select} value={filters.estado || ''} onChange={e => setFilters(f => ({ ...f, estado: e.target.value as any }))}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
        <select className={styles.select} value={filters.tipo || ''} onChange={e => setFilters(f => ({ ...f, tipo: e.target.value as any }))}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className={styles.select} value={filters.credito || ''} onChange={e => setFilters(f => ({ ...f, credito: e.target.value as any }))}>
          <option value="">Crédito: todos</option>
          <option value="si">Acepta crédito</option>
          <option value="no">Sin crédito</option>
        </select>
        <select className={styles.select} value={filters.orden || ''} onChange={e => setFilters(f => ({ ...f, orden: e.target.value as any }))}>
          <option value="">Más recientes</option>
          <option value="precio-asc">Precio ↑</option>
          <option value="precio-desc">Precio ↓</option>
          <option value="m2">Mayor m²</option>
        </select>

        {/* Vista toggle */}
        <div className={styles.vistaBtns}>
          <button className={`${styles.vistaBtn} ${vista==='grid'?styles.active:''}`} onClick={() => setVista('grid')} title="Vista grilla">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>
          </button>
          <button className={`${styles.vistaBtn} ${vista==='lista'?styles.active:''}`} onClick={() => setVista('lista')} title="Vista lista">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>

        {/* Stats */}
        {config.show_stats && (
          <div className={styles.statsRow}>
            {['Disponible','Reservada','En consulta','Vendida'].map(e => (
              <button
                key={e}
                className={`${styles.statChip} ${filters.estado === e ? styles.statChipActive : ''}`}
                onClick={() => setFilters(f => ({ ...f, estado: f.estado === e ? '' : e as any }))}
              >
                <span className={styles[`dot${e.replace(/\s/g,'').replace('consulta','Cons')}`]} />
                {e}: {properties.filter(p => p.estado === e).length}
              </button>
            ))}
            <span className={styles.totalChip}>Total: {properties.length}</span>
          </div>
        )}
      </div>

      {/* Grid / List */}
      {loading ? (
        <div className={styles.loadingState}>
          {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No hay propiedades</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            {search || Object.values(filters).some(Boolean) ? 'Probá cambiando los filtros' : 'Todavía no se cargaron propiedades'}
          </div>
          {isAdmin && (
            <button className={styles.btnNewEmpty} onClick={() => setShowNewProp(true)}>
              + Agregar propiedad
            </button>
          )}
        </div>
      ) : (
        <div className={vista === 'grid' ? styles.grid : styles.lista}>
          {displayed.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              user={user}
              isAdmin={isAdmin}
              isVendor={isVendor}
              onOpen={setDetailProp}
              onEdit={p => { setEditProp(p); }}
              onDelete={handleDelete}
              onPreventa={setPreventaId}
            />
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      {detailProp && (
        <PropertyDetail
          property={detailProp}
          isAdmin={isAdmin}
          isVendor={isVendor}
          onClose={() => setDetailProp(null)}
          onEdit={p => { setDetailProp(null); setEditProp(p) }}
          onPreventa={id => { setDetailProp(null); setPreventaId(id) }}
          onDelete={id => { setDetailProp(null); handleDelete(id) }}
        />
      )}

      {(showNewProp || editProp) && (
        <PropertyModal
          property={showNewProp ? null : (editProp as Property)}
          isAdmin={isAdmin}
          onClose={() => { setShowNewProp(false); setEditProp(null) }}
          onSaved={handleSaved}
        />
      )}

      {preventaId && (
        <PreventaModal
          propertyId={preventaId}
          property={properties.find(p => p.id === preventaId) || null}
          onClose={() => setPreventaId(null)}
        />
      )}

      {showMatching && (
        <MatchingModal
          user={user}
          onClose={() => setShowMatching(false)}
        />
      )}

      {showVendors && isAdmin && (
        <VendorManagementModal onClose={() => setShowVendors(false)} />
      )}

      {showConfig && isAdmin && (
        <ConfigModal
          config={config}
          onClose={() => setShowConfig(false)}
          onSaved={() => { setShowConfig(false); window.location.reload() }}
        />
      )}

      {showVentas && isAdmin && (
        <VentasModal
          properties={properties}
          onClose={() => setShowVentas(false)}
        />
      )}
    </>
  )
}
