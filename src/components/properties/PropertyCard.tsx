'use client'
// components/properties/PropertyCard.tsx
import { useState } from 'react'
import { StatusBadge } from '@/components/ui/Button'
import { fmtPrecio, fmtM2 } from '@/utils/format'
import type { Property, AppUser } from '@/types'
import styles from './PropertyCard.module.css'

interface Props {
  property: Property
  user: AppUser
  isAdmin: boolean
  isVendor: boolean
  onOpen: (p: Property) => void
  onEdit: (p: Property) => void
  onDelete: (id: string) => void
  onPreventa: (id: string) => void
}

export default function PropertyCard({ property: p, user, isAdmin, isVendor, onOpen, onEdit, onDelete, onPreventa }: Props) {
  const [imgErr, setImgErr] = useState(false)
  const hasImg = p.imagenes?.length > 0 && !imgErr

  return (
    <div className={`${styles.card} ${p.estado === 'Vendida' ? styles.vendida : ''}`} onClick={() => onOpen(p)}>
      {/* Image */}
      <div className={styles.imgWrap}>
        {hasImg ? (
          <img
            src={p.imagenes[0]}
            alt={p.dir}
            className={styles.img}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className={styles.noImg}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.3 }}>
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </div>
        )}
        {/* Image count */}
        {p.imagenes?.length > 1 && (
          <span className={styles.imgCount}>+{p.imagenes.length - 1}</span>
        )}
        {/* Llave */}
        {p.llave_prop && (
          <span className={styles.llaveTag} title="Llave en oficina">🔑</span>
        )}
      </div>

      {/* Content */}
      <div className={styles.body}>
        <div className={styles.top}>
          <div>
            <div className={styles.tipo}>{p.tipo}</div>
            <div className={styles.dir}>{p.dir}</div>
            <div className={styles.barrio}>{p.barrio}</div>
          </div>
          <StatusBadge estado={p.estado} />
        </div>

        <div className={styles.precio}>{fmtPrecio(p.precio)}</div>

        {/* Stats row */}
        <div className={styles.stats}>
          {p.amb > 0    && <span>{p.amb} amb.</span>}
          {p.dorm > 0   && <span>{p.dorm} dorm.</span>}
          {p.banos > 0  && <span>{p.banos} baños</span>}
          {(p.m2t > 0 || p.m2c > 0) && <span>{fmtM2(p.m2t, p.m2c)}</span>}
          {p.credito === 'si' && <span className={styles.creditoBadge}>Crédito</span>}
        </div>

        {/* Admin actions */}
        {(isAdmin || isVendor) && (
          <div className={styles.actions} onClick={e => e.stopPropagation()}>
            <button
              className={styles.btnPreventa}
              onClick={() => onPreventa(p.id)}
              title="Checklist pre-venta"
            >
              📋 Pre-venta
            </button>
            {isAdmin && (
              <>
                <button className={styles.btnEdit} onClick={() => onEdit(p)}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button className={styles.btnDel} onClick={() => onDelete(p.id)}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
