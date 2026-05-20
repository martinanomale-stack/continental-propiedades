'use client'
import { Modal, ModalHeader } from '@/components/ui/Modal'
interface Props { onClose: () => void }
export default function VendorManagementModal({ onClose }: Props) {
  return <Modal open onClose={onClose}><ModalHeader title="Gestión de vendedores" onClose={onClose} /></Modal>
}
