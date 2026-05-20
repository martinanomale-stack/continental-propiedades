'use client'
// components/ui/Modal.tsx — Generic overlay modal matching original look
import { useEffect } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: number | string
  className?: string
}

export function Modal({ open, onClose, children, maxWidth = 580, className = '' }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div
        className={`${styles.modal} ${className}`}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Modal sub-components
export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className={styles.header}>
      <div className={styles.title}>{title}</div>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className={styles.footer}>{children}</div>
}
