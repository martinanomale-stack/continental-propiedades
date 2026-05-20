'use client'
// hooks/useSiteConfig.ts — Branding, colors, feature flags
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SiteConfig } from '@/types'

const supabase = createClient()

const DEFAULT_CONFIG: SiteConfig = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'Continental Propiedades',
  subtitulo: '· Río Cuarto',
  logo_url: null,
  accent: '#2c5f3f',
  accent2: '#b8621a',
  bg: '#f5f2ec',
  surface: '#ffffff',
  border: '#e0d9cc',
  text_color: '#1a1510',
  fuente: 'DM Sans',
  show_stats: true,
  bold_shadow: false,
  round_cards: true,
  pin: null,
  recovery_email: null,
  updated_at: new Date().toISOString(),
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_config')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) {
          setConfig(data as SiteConfig)
          applyConfigToDOM(data as SiteConfig)
        }
        setLoading(false)
      })
  }, [])

  return { config, loading }
}

// Apply CSS variables to :root — matches original behavior exactly
export function applyConfigToDOM(config: SiteConfig) {
  const root = document.documentElement.style
  root.setProperty('--accent',  config.accent)
  root.setProperty('--accent2', config.accent2)
  root.setProperty('--bg',      config.bg)
  root.setProperty('--surface', config.surface)
  root.setProperty('--border',  config.border)
  root.setProperty('--text',    config.text_color)
  root.setProperty('--accent-light',  hexToRgba(config.accent, 0.1))
  root.setProperty('--accent2-light', hexToRgba(config.accent2, 0.1))
  root.setProperty('--shadow',
    config.bold_shadow
      ? '0 2px 8px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.10)'
      : '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)'
  )
  root.setProperty('--radius-lg', config.round_cards ? '16px' : '6px')
  document.body.style.fontFamily = `'${config.fuente}', sans-serif`
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
