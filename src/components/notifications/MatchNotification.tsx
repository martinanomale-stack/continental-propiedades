'use client'
// components/notifications/MatchNotification.tsx
import { useEffect } from 'react'
import { playMatchSound } from '@/utils/format'
import type { MatchNotification as MatchNotif } from '@/types'
import styles from './Notification.module.css'

interface Props { notif: MatchNotif; onClose: () => void; onViewMatches?: () => void }

const TIPO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  'Busca comprar':   { bg: 'var(--blue-light)',  color: 'var(--blue)',   label: 'Busca comprar' },
  'Vende / permuta': { bg: 'var(--accent-light)',color: 'var(--accent)', label: 'Vende / permuta' },
  'Puede financiar': { bg: 'var(--amber-light)', color: '#6b5400',       label: 'Puede financiar' },
}

const CONFETTI_COLORS = ['#ff6b8a','#ffb3c1','#ffd6e0','#c0392b','#ff8fab','#ffc2d1']

export default function MatchNotification({ notif, onClose, onViewMatches }: Props) {
  const { matches, newCount } = notif
  const best = matches[0]

  useEffect(() => {
    playMatchSound()
    const timer = setTimeout(onClose, 10000)
    return () => clearTimeout(timer)
  }, [onClose])

  const confetti = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.5 + Math.random()}s`,
    rotate: `${Math.random() * 360}deg`,
    size: `${6 + Math.random() * 7}px`,
    round: Math.random() > 0.5 ? '50%' : '2px',
  }))

  if (!best) return null

  const tA = TIPO_CONFIG[best.a.tipo] || TIPO_CONFIG['Busca comprar']
  const tB = TIPO_CONFIG[best.b.tipo] || TIPO_CONFIG['Vende / permuta']

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.box}>
        {confetti.map(c => (
          <div key={c.id} className={styles.confetti} style={{
            left: c.left, background: c.color,
            animationDelay: c.delay, animationDuration: c.duration,
            transform: `rotate(${c.rotate})`, width: c.size,
            height: `calc(${c.size} + 4px)`, borderRadius: c.round,
          }} />
        ))}

        <span className={styles.houseEmoji}>
          {best.tipo === 'financiamiento' ? '💰' : '💞'}
        </span>
        <div className={`${styles.title} ${styles.titleMatch}`}>¡Nuevo Match!</div>
        <div className={styles.sub}>
          {newCount > 0
            ? <><strong>{newCount} match{newCount > 1 ? 'es nuevos' : ' nuevo'}</strong> detectado{newCount > 1 ? 's' : ''} entre clientes.</>
            : <><strong>{matches.length} match{matches.length > 1 ? 'es activos' : ' activo'}</strong> en el sistema.</>
          }
        </div>

        {/* Best match pair */}
        <div className={styles.matchPair}>
          <div className={styles.matchCard} style={{ background: tA.bg }}>
            <div className={styles.matchCardLabel} style={{ color: tA.color }}>{tA.label}</div>
            <div className={styles.matchCardName}>{best.a.nombre}</div>
            {best.a.presupuesto > 0 && (
              <div className={styles.matchCardSub}>U$D {Number(best.a.presupuesto).toLocaleString('es-AR')}</div>
            )}
            {best.a.zona && <div className={styles.matchCardSub}>📍 {best.a.zona}</div>}
          </div>
          <div className={styles.matchEmoji}>{best.tipo === 'financiamiento' ? '💰' : '💞'}</div>
          <div className={styles.matchCard} style={{ background: tB.bg }}>
            <div className={styles.matchCardLabel} style={{ color: tB.color }}>{tB.label}</div>
            <div className={styles.matchCardName}>{best.b.nombre}</div>
            {best.b.presupuesto > 0 && (
              <div className={styles.matchCardSub}>U$D {Number(best.b.presupuesto).toLocaleString('es-AR')}</div>
            )}
            {best.b.zona && <div className={styles.matchCardSub}>📍 {best.b.zona}</div>}
          </div>
        </div>

        {/* Reasons */}
        {best.razones.length > 0 && (
          <div className={styles.matchReasons}>
            {best.razones.map(r => <span key={r} className={styles.matchReason}>✓ {r}</span>)}
          </div>
        )}

        <button className={styles.ctaBtn} onClick={() => { onViewMatches?.(); onClose() }}>
          💞 Ver todos los matches
        </button>
        <button className={styles.secondBtn} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}
