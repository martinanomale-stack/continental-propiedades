'use client'
// hooks/useAuth.ts — Current user + session
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AppUser } from '@/types'

const supabase = createClient()

export function useAuth() {
  const [user, setUser]       = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setUser(data as AppUser | null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) await fetchProfile(session.user.id)
        else setUser(null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return {
    user,
    loading,
    isAdmin:  user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    isGuest:  user?.role === 'guest',
  }
}
