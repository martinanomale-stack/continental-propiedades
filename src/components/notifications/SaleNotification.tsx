'use client'
// components/notifications/SaleNotification.tsx
import { useEffect } from 'react'
import { playSaleSound } from '@/utils/format'
import type { SaleNotification as SaleNotif } from '@/types'
import styles from './Notification.module.css'

interface Props { notif: SaleNotif; onClose: () => void }

const TIPO_EMOJI: Record<string, string> = {
  Casa:'🏠', Departamento:'🏢', PH:'🏘️', Lote:'🌳', Local:'🏪', Campo:'🌾', Cochera:'🚗', Oficina:'🏛️'
}

const CONFETTI_COLORS = ['#2c5f3f','#b8621a','#d4a012','#1a4a7a','#c0392b','#ffd700']

export default function SaleNotification({ notif, onClose }: Props) {
  const { property: p, vendor } = notif

  useEffect(() => {
    playSaleSound()
    const timer = setTimeout(onClose, 8000)
    return () => clearTimeout(timer)
  }, [onClose])

  const emoji = TIPO_EMOJI[p.tipo] || '🏠'
  const confetti = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.5 + Math.random()}s`,
    rotate: `${Math.random() * 360}deg`,
    size: `${6 + Math.random() * 6}px`,
  }))

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.box}>
        {/* Confetti */}
        {confetti.map(c => (
          <div key={c.id} className={styles.confetti} style={{
            left: c.left, background: c.color,
            animationDelay: c.delay, animationDuration: c.duration,
            transform: `rotate(${c.rotate})`, width: c.size, height: `calc(${c.size} + 4px)`,
          }} />
        ))}

        <span className={styles.houseEmoji}>{emoji}</span>
        <div className={styles.title}>¡Venta cerrada!</div>
        <div className={styles.sub}>{p.dir} — U$D {Number(p.precio).toLocaleString('es-AR')}</div>

        {/* Vendor info */}
        <div className={styles.vendorRow}>
          {vendor?.foto_url ? (
            <img src={vendor.foto_url} className={styles.vendorPhoto} alt={vendor.nombre} />
          ) : (
            <div className={styles.vendorInitials}>
              {vendor ? vendor.nombre[0].toUpperCase() : 'A'}
            </div>
          )}
          <div>
            <div className={styles.vendorName}>{vendor?.nombre || 'Admin'}</div>
            <div className={styles.vendorRole}>{vendor ? 'Vendedor/a' : 'Administrador'}</div>
          </div>
        </div>

        <button className={styles.ctaBtn} onClick={onClose}>🎉 ¡Excelente!</button>
      </div>
    </div>
  )
}
