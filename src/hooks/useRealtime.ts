'use client'
// hooks/useRealtime.ts — Live sync across all users via Supabase Realtime
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePayload } from '@/types'

const supabase = createClient()

type Table = 'properties' | 'visits' | 'sales' | 'matching_clients'

export function useRealtime<T>(
  table: Table,
  onEvent: (payload: RealtimePayload<T>) => void
) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => onEventRef.current(payload as RealtimePayload<T>)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table])
}

// Convenience hook for properties
export function usePropertiesRealtime(onUpdate: () => void) {
  useRealtime('properties', onUpdate as any)
}

// Convenience hook for matching (triggers match notifications)
export function useMatchingRealtime(onUpdate: () => void) {
  useRealtime('matching_clients', onUpdate as any)
}

// Convenience hook for visits
export function useVisitsRealtime(onUpdate: () => void) {
  useRealtime('visits', onUpdate as any)
}

// Sale notification broadcast channel
export function useSaleChannel(onSale: (data: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('sale-notifications')
      .on('broadcast', { event: 'new_sale' }, ({ payload }) => onSale(payload))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [onSale])
}

export function useMatchChannel(onMatch: (data: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('match-notifications')
      .on('broadcast', { event: 'new_match' }, ({ payload }) => onMatch(payload))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [onMatch])
}

// Broadcast a sale notification to all connected users
export async function broadcastSale(propertyData: object, vendorData: object | null) {
  const channel = supabase.channel('sale-notifications')
  await channel.subscribe()
  await channel.send({
    type: 'broadcast',
    event: 'new_sale',
    payload: { property: propertyData, vendor: vendorData },
  })
  supabase.removeChannel(channel)
}

// Broadcast a match notification to all connected users
export async function broadcastMatch(matches: object[], newCount: number) {
  const channel = supabase.channel('match-notifications')
  await channel.subscribe()
  await channel.send({
    type: 'broadcast',
    event: 'new_match',
    payload: { matches, newCount },
  })
  supabase.removeChannel(channel)
}
