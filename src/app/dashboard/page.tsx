'use client'
// app/dashboard/page.tsx — Main application shell
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { useSaleChannel, useMatchChannel, usePropertiesRealtime } from '@/hooks/useRealtime'
import Topbar from '@/components/layout/Topbar'
import VisitasSidebar from '@/components/visits/VisitasSidebar'
import VentasSidebar from '@/components/sales/VentasSidebar'
import PropertyGrid from '@/components/properties/PropertyGrid'
import SaleNotification from '@/components/notifications/SaleNotification'
import MatchNotification from '@/components/notifications/MatchNotification'
import WelcomeOverlay from '@/components/auth/WelcomeOverlay'
import { useRouter } from 'next/navigation'
import type { SaleNotification as SaleNotif, MatchNotification as MatchNotif } from '@/types'

export default function DashboardPage() {
  const { user, loading, isAdmin, isVendor } = useAuth()
  const { config } = useSiteConfig()
  const router = useRouter()

  const [saleNotif, setSaleNotif]   = useState<SaleNotif | null>(null)
  const [matchNotif, setMatchNotif] = useState<MatchNotif | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // Realtime: refresh property list when any change happens
  usePropertiesRealtime(() => setRefreshKey(k => k + 1))

  // Sale broadcast — show notification to all users
  useSaleChannel((data) => {
    setSaleNotif({ type: 'sale', property: data.property, vendor: data.vendor })
  })

  // Match broadcast — show notification to all users
  useMatchChannel((data) => {
    setMatchNotif({ type: 'match', matches: data.matches, newCount: data.newCount })
  })

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
        <div>Cargando...</div>
      </div>
    </div>
  )

  return (
    <>
      <Topbar user={user} config={config} />

      <div className="app-layout">
        {/* Left sidebar — visits (admin + vendor only) */}
        {(isAdmin || isVendor) && (
          <VisitasSidebar userId={user.id} isAdmin={isAdmin} />
        )}

        {/* Main content */}
        <main className="main">
          <PropertyGrid
            key={refreshKey}
            user={user}
            isAdmin={isAdmin}
            isVendor={isVendor}
            config={config}
            onSaleNotif={(p, v) => setSaleNotif({ type: 'sale', property: p, vendor: v })}
          />
        </main>

        {/* Right sidebar — sales (admin only) */}
        {isAdmin && <VentasSidebar />}
      </div>

      {/* Notifications */}
      {saleNotif && (
        <SaleNotification
          notif={saleNotif}
          onClose={() => setSaleNotif(null)}
        />
      )}
      {matchNotif && (
        <MatchNotification
          notif={matchNotif}
          onClose={() => setMatchNotif(null)}
        />
      )}

      {/* First-time vendor welcome */}
      {isVendor && <WelcomeOverlay userId={user.id} userName={user.nombre} />}
    </>
  )
}
