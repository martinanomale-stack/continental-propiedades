'use client'
import { Modal, ModalHeader } from '@/components/ui/Modal'
import type { SiteConfig } from '@/types'
interface Props { config: SiteConfig; onClose: () => void; onSaved: () => void }
export default function ConfigModal({ onClose }: Props) {
  return <Modal open onClose={onClose}><ModalHeader title="Configuración" onClose={onClose} /></Modal>
}
