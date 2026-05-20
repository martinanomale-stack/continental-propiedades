'use client'
import { Modal, ModalHeader } from '@/components/ui/Modal'
import type { Property } from '@/types'
interface Props { properties: Property[]; onClose: () => void }
export default function VentasModal({ onClose }: Props) {
  return <Modal open onClose={onClose} maxWidth={820}><ModalHeader title="Ventas y honorarios" onClose={onClose} /></Modal>
}
