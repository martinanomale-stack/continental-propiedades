'use client'
// components/properties/PropertyModal.tsx
// Full implementation: mirrors original abrirModal() form with all fields,
// image upload with compression, barrio autocomplete, Leaflet map preview
// TODO: implement full form (see original HTML lines 2300-2900)
import { Modal, ModalHeader } from '@/components/ui/Modal'
import type { Property } from '@/types'
interface Props { property: Property | null; isAdmin: boolean; onClose: () => void; onSaved: (p: Property, isNew: boolean) => void }
export default function PropertyModal({ property, onClose }: Props) {
  return <Modal open onClose={onClose}><ModalHeader title={property ? 'Editar propiedad' : 'Nueva propiedad'} onClose={onClose} /><p style={{padding:'1rem',color:'var(--text3)'}}>Formulario completo — ver implementación en rama feature/property-form</p></Modal>
}
