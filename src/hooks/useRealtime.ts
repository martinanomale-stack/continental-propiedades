'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useRealtime(table: string, onEvent: (payload: any) => void) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes' as any, { event: '*', schema: 'public', table }, (payload: any) => {
        onEventRef.current(payload)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table])
}

export function usePropertiesRealtime(onUpdate: () => void) {
  useRealtime('properties', onUpdate)
}

export function useMatchingRealtime(onUpdate: () => void) {
  useRealtime('matching_clients', onUpdate)
}

export function useVisitsRealtime(onUpdate: () => void) {
  useRealtime('visits', onUpdate)
}

export function useSaleChannel(onSale: (data: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('sale-notifications')
      .on('broadcast' as any, { event: 'new_sale' }, ({ payload }: any) => onSale(payload))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [onSale])
}

export function useMatchChannel(onMatch: (data: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('match-notifications')
      .on('broadcast' as any, { event: 'new_match' }, ({ payload }: any) => onMatch(payload))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [onMatch])
}

export async function broadcastSale(propertyData: any, vendorData: any) {
  const channel = supabase.channel('sale-notifications')
  await channel.subscribe()
  await channel.send({ type: 'broadcast', event: 'new_sale', payload: { property: propertyData, vendor: vendorData } })
  supabase.removeChannel(channel)
}

export async function broadcastMatch(matches: any[], newCount: number) {
  const channel = supabase.channel('match-notifications')
  await channel.subscribe()
  await channel.send({ type: 'broadcast', event: 'new_match', payload: { matches, newCount } })
  supabase.removeChannel(channel)
}
