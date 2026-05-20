'use client'
// components/ui/Toast.tsx — matches original toast() function behavior
import { useEffect, useState, useCallback } from 'react'
import styles from './Toast.module.css'

type ToastType = 'success' | 'error' | 'info' | 'warn'

interface ToastItem { id: string; message: string; type: ToastType }

// Global toast emitter
type Listener = (item: ToastItem) => void
const listeners: Listener[] = []

export function toast(message: string, type: ToastType = 'info') {
  const item: ToastItem = { id: Date.now().toString(), message, type }
  listeners.forEach(fn => fn(item))
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  const addToast = useCallback((item: ToastItem) => {
    setItems(prev => [...prev.slice(-4), item])
    setTimeout(() => {
      setItems(prev => prev.filter(t => t.id !== item.id))
    }, 3200)
  }, [])

  useEffect(() => {
    listeners.push(addToast)
    return () => { const i = listeners.indexOf(addToast); if (i > -1) listeners.splice(i, 1) }
  }, [addToast])

  if (!items.length) return null

  return (
    <div className={styles.container} aria-live="polite">
      {items.map(item => (
        <div key={item.id} className={`${styles.toast} ${styles[item.type]}`}>
          <span className={styles.icon}>
            {item.type === 'success' ? '✓' : item.type === 'error' ? '✕' : item.type === 'warn' ? '⚠' : 'ℹ'}
          </span>
          {item.message}
        </div>
      ))}
    </div>
  )
}
