// services/config.ts
import { createClient } from '@/lib/supabase/client'
import type { SiteConfig } from '@/types'

const supabase = createClient()
const CONFIG_ID = '00000000-0000-0000-0000-000000000001'

export async function getSiteConfig(): Promise<SiteConfig> {
  const { data, error } = await supabase
    .from('site_config')
    .select('*')
    .eq('id', CONFIG_ID)
    .single()
  if (error) throw new Error(error.message)
  return data as SiteConfig
}

export async function updateSiteConfig(payload: Partial<SiteConfig>) {
  const { data, error } = await supabase
    .from('site_config')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', CONFIG_ID)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as SiteConfig
}

export async function uploadLogo(file: File): Promise<string> {
  const path = `logo/${Date.now()}.${file.name.split('.').pop()}`
  const { error } = await supabase.storage
    .from('brand-assets')
    .upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = supabase.storage
    .from('brand-assets')
    .getPublicUrl(path)
  await updateSiteConfig({ logo_url: publicUrl })
  return publicUrl
}
