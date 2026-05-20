'use client'
// components/ui/Button.tsx
import styles from './Button.module.css'
import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'new'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({ variant = 'primary', loading, icon, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${loading ? styles.loading : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : icon}
      {children}
    </button>
  )
}

// Badge for property status
interface BadgeProps { estado: string }
export function StatusBadge({ estado }: BadgeProps) {
  const map: Record<string, string> = {
    'Disponible':  styles.badgeDisp,
    'Reservada':   styles.badgeRes,
    'En consulta': styles.badgeCons,
    'Vendida':     styles.badgeVend,
  }
  return <span className={`${styles.badge} ${map[estado] || styles.badgeDisp}`}>{estado}</span>
}

// Role badge
interface RoleBadgeProps { role: string }
export function RoleBadge({ role }: RoleBadgeProps) {
  const map: Record<string, string> = {
    admin:  styles.roleAdmin,
    vendor: styles.roleVendor,
    guest:  styles.roleGuest,
  }
  return (
    <span className={`${styles.roleBadge} ${map[role] || ''}`}>
      {role === 'admin' ? 'ADMIN' : role === 'vendor' ? 'VENDEDOR' : 'INVITADO'}
    </span>
  )
}
