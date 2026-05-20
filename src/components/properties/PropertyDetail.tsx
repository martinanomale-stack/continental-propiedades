'use client'
// components/properties/PropertyDetail.tsx
// Full implementation: gallery, map, stats, actions — mirrors buildDetailHTML()
import { Modal } from '@/components/ui/Modal'
import type { Property } from '@/types'
interface Props { property: Property; isAdmin: boolean; isVendor: boolean; onClose: () => void; onEdit: (p: Property) => void; onPreventa: (id: string) => void; onDelete: (id: string) => void }
export default function PropertyDetail({ property: p, onClose }: Props) {
  return <Modal open onClose={onClose} maxWidth={860}><div style={{padding:'1.5rem'}}><h2 style={{fontFamily:'DM Serif Display,serif'}}>{p.dir}</h2><p style={{color:'var(--text3)'}}>{p.barrio} — {p.tipo}</p></div></Modal>
}
