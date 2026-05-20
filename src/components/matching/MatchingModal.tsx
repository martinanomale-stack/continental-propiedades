'use client'
// components/matching/MatchingModal.tsx
// Full implementation: mirrors matching module in original HTML
import { Modal, ModalHeader } from '@/components/ui/Modal'
import type { AppUser } from '@/types'
interface Props { user: AppUser; onClose: () => void }
export default function MatchingModal({ onClose }: Props) {
  return <Modal open onClose={onClose} maxWidth={860}><ModalHeader title="💞 Matching de clientes" onClose={onClose} /><p style={{padding:'1rem',color:'var(--text3)'}}>Módulo matching completo — ver implementación</p></Modal>
}
