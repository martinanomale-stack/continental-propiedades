// utils/format.ts — Formatting helpers matching original fmtPrecio, fmtM2, etc.

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function fmtPrecio(precio: number): string {
  return 'U$D ' + Number(precio).toLocaleString('es-AR')
}

export function fmtMonto(n: number | null | undefined): string {
  if (!n) return '$ 0'
  return '$ ' + Number(n).toLocaleString('es-AR')
}

export function fmtM2(m2t: number, m2c: number): string {
  const parts: string[] = []
  if (m2t) parts.push(`${m2t} m² terreno`)
  if (m2c) parts.push(`${m2c} m² cub.`)
  return parts.join(' · ')
}

export function fmtFecha(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: '2-digit'
  })
}

export function fmtFechaHora(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR') + ' ' +
    d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export function badgeClass(estado: string): string {
  const map: Record<string, string> = {
    'Disponible':  'badge-disp',
    'Reservada':   'badge-res',
    'En consulta': 'badge-cons',
    'Vendida':     'badge-vend',
  }
  return map[estado] || 'badge-disp'
}

export function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.width, h = img.height
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('Canvas to blob failed')); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        },
        'image/jpeg', quality
      )
      URL.revokeObjectURL(url)
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = url
  })
}

export function compressCropSquare(file: File, size = 200): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')!
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('Crop failed')); return }
          resolve(new File([blob], 'profile.jpg', { type: 'image/jpeg' }))
        },
        'image/jpeg', 0.85
      )
      URL.revokeObjectURL(url)
    }
    img.onerror = reject
    img.src = url
  })
}

// Barrios de Río Cuarto (same list as original)
export const BARRIOS_RC = [
  'Abilene','Aguas Claras','Alberdi','Alta Alameda','ATE',
  'Banda Norte','Bimaco','Castelli 1','Castelli 2','Centro',
  'Foresta','Golf','Hipódromo','La Angelita','Macrocentro',
  'Regimiento 14','Reparo','San Antonio de Padua','Sector Bosque Chico',
  'Sector Cardinales','Sector Oeste','Sector Paseo La Ribera',
  'Sector Plaza Mojica','Soles del Oeste','Sur - Plaza Moretti',
  'Villa Dalcar',
].sort()

// Sound: sale victory melody
export function playSaleSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51]
    const times = [0, 0.12, 0.24, 0.36, 0.5, 0.62, 0.74]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = 'sine'
      gain.gain.setValueAtTime(0, ctx.currentTime + times[i])
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + times[i] + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + times[i] + 0.3)
      osc.start(ctx.currentTime + times[i])
      osc.stop(ctx.currentTime + times[i] + 0.35)
    })
  } catch {}
}

// Sound: match romantic melody
export function playMatchSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [392, 523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 1046.50]
    const times = [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.72, 0.85]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq; osc.type = i < 4 ? 'sine' : 'triangle'
      const t = ctx.currentTime + times[i]
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.start(t); osc.stop(t + 0.32)
    })
  } catch {}
}
