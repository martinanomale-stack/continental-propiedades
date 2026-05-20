'use client'
// components/preventa/PreventaModal.tsx
import { useState, useEffect, useCallback } from 'react'
import { Modal, ModalHeader } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { getOrCreatePreventa, updatePreventa } from '@/services/matching'
import type { Property } from '@/types'
import styles from './PreventaModal.module.css'

interface Props {
  propertyId: string
  property: Property | null
  onClose: () => void
}

const CHECKLIST = [
  { id: 'escritura',  label: 'Escritura de propiedad',        desc: 'Copia o número de escritura disponible' },
  { id: 'impuestos',  label: 'Impuestos al día (ABL/Rentas)', desc: 'Constancia de deuda 0 o último pago' },
  { id: 'plano',      label: 'Plano aprobado',                desc: 'Plano municipal aprobado' },
  { id: 'reglamento', label: 'Reglamento de copropiedad',     desc: 'Solo para departamentos/PH' },
  { id: 'dni',        label: 'DNI del vendedor',              desc: 'Titular o apoderado con DNI vigente' },
  { id: 'boleto',     label: 'Boleto de compraventa',         desc: 'Borrador de boleto preparado' },
  { id: 'locacion',   label: 'Contrato de locación vigente',  desc: 'Solo si hay inquilino/a ocupando' },
  { id: 'inhibicion', label: 'Sin inhibición del vendedor',   desc: 'Verificar inhibición en Registro' },
  { id: 'hipoteca',   label: 'Sin hipoteca / cancelada',      desc: 'Verificar libre de gravamen' },
  { id: 'cit',        label: 'CIT / COTI solicitado',         desc: 'Código de oferta de transferencia inmobiliaria' },
]

type Status = 0 | 1 | 2 | 3
const SEMAFOROS: { cls: string; emoji: string; label: string }[] = [
  { cls: '',          emoji: '',   label: 'Sin completar' },
  { cls: styles.verde,    emoji: '🟢', label: 'Completo' },
  { cls: styles.amarillo, emoji: '🟡', label: 'Faltan cosas' },
  { cls: styles.rojo,     emoji: '🔴', label: 'Crítico' },
]

function deadlineBadge(dateStr: string | undefined) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr + 'T00:00:00').getTime() - Date.now()) / 86400000)
  if (diff < 0)  return <span className={`${styles.dlBadge} ${styles.dlOver}`}>Vencido ({Math.abs(diff)}d)</span>
  if (diff <= 7) return <span className={`${styles.dlBadge} ${styles.dlWarn}`}>{diff === 0 ? '¡Hoy!' : `${diff}d`}</span>
  return <span className={`${styles.dlBadge} ${styles.dlOk}`}>{diff}d restantes</span>
}

export default function PreventaModal({ propertyId, property, onClose }: Props) {
  const [pv, setPv] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrCreatePreventa(propertyId)
      .then(data => { setPv(data); setLoading(false) })
      .catch(e => { toast(e.message, 'error'); setLoading(false) })
  }, [propertyId])

  const ciclar = useCallback(async (field: string) => {
    const current: Status = pv[field] ?? 0
    const next = ((current + 1) % 4) as Status
    const updated = { ...pv, [field]: next }
    setPv(updated)
    try {
      await updatePreventa(propertyId, { [field]: next })
    } catch (e: any) { toast(e.message, 'error') }
  }, [pv, propertyId])

  const saveDeadline = useCallback(async (field: string, value: string) => {
    const updated = { ...pv, [field]: value || null }
    setPv(updated)
    try { await updatePreventa(propertyId, { [field]: value || null }) } catch (e: any) { toast(e.message, 'error') }
  }, [pv, propertyId])

  const completados = CHECKLIST.filter(i => pv[i.id] === 1).length
  const criticos    = CHECKLIST.filter(i => pv[i.id] === 3).length
  const faltan      = CHECKLIST.filter(i => pv[i.id] === 2).length
  const pct = Math.round(completados / CHECKLIST.length * 100)
  const progColor = criticos > 0 ? 'var(--danger)' : faltan > 0 ? '#ffc107' : completados === CHECKLIST.length ? 'var(--accent)' : 'var(--blue)'

  return (
    <Modal open onClose={onClose} maxWidth={660} className={styles.modal}>
      <ModalHeader title="📋 Pre-venta" onClose={onClose} />

      {property && (
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: '1rem' }}>
          Propiedad: <strong>{property.dir}</strong> — {property.barrio}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Cargando checklist...</div>
      ) : (
        <>
          {/* Progress */}
          <div className={styles.progressWrap}>
            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 45 }}>{pct}%</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%`, background: progColor }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: progColor }}>
              {criticos > 0 ? `🔴 ${criticos} críticos` : faltan > 0 ? `🟡 ${faltan} incompletos` : completados === CHECKLIST.length ? '🟢 Todo completo' : `${completados}/${CHECKLIST.length}`}
            </span>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            {SEMAFOROS.map((s, i) => i > 0 && <span key={i}>{s.emoji} {s.label}</span>)}
          </div>

          {/* Checklist items */}
          {CHECKLIST.map(item => {
            const status: Status = pv[item.id] ?? 0
            const sem = SEMAFOROS[status]
            return (
              <div
                key={item.id}
                className={`${styles.item} ${sem.cls}`}
                onClick={() => ciclar(item.id)}
              >
                <div className={`${styles.dot} ${sem.cls}`}>
                  {status > 0 ? sem.emoji : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.itemLabel}>{item.label}</div>
                  <div className={styles.itemDesc}>{item.desc}</div>
                </div>
                <span className={styles.cycle} title={sem.label}>↻</span>
              </div>
            )
          })}

          {/* Deadlines */}
          <div className={styles.deadlinesBox}>
            <div className={styles.deadlinesTitle}>⏰ Plazos importantes</div>
            {[
              { key: 'deadline_escritura', label: '📝 Fecha firma escritura' },
              { key: 'deadline_senia',     label: '💰 Pago seña / reserva' },
              { key: 'deadline_credito',   label: '🏦 Cierre del crédito' },
              { key: 'deadline_otro',      label: '📅 Otro plazo importante' },
            ].map(dl => (
              <div key={dl.key} className={styles.deadlineRow}>
                <span className={styles.deadlineLabel}>{dl.label}</span>
                <input
                  type="date"
                  className={styles.deadlineInput}
                  value={pv[dl.key] || ''}
                  onChange={e => saveDeadline(dl.key, e.target.value)}
                />
                {deadlineBadge(pv[dl.key])}
                {dl.key === 'deadline_otro' && (
                  <input
                    className={styles.deadlineInput}
                    placeholder="Descripción"
                    value={pv.deadline_otro_label || ''}
                    onChange={e => saveDeadline('deadline_otro_label', e.target.value)}
                    style={{ maxWidth: 130 }}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}
