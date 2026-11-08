import { Capacitor, registerPlugin } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

interface MaterialYouPalette {
  dynamic: boolean
  light?: Record<string, string>
  dark?: Record<string, string>
}

interface MaterialYouPlugin {
  getPalette(): Promise<MaterialYouPalette>
}

const MaterialYou = registerPlugin<MaterialYouPlugin>('MaterialYou')
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

let palette: MaterialYouPalette | null = null

async function applyStatusBar(surface: string | undefined) {
  if (!surface) return

  try {
    await StatusBar.setBackgroundColor({ color: surface })
    await StatusBar.setStyle({
      style: darkQuery.matches ? Style.Dark : Style.Light,
    })
  } catch {
    // Best-effort: edge-to-edge Android builds may manage the status bar themselves.
  }
}

function applyPalette() {
  if (!palette?.dynamic) return

  const colors = darkQuery.matches ? palette.dark : palette.light
  if (!colors) return

  const root = document.documentElement
  for (const [role, value] of Object.entries(colors)) {
    root.style.setProperty(`--md-sys-color-${role}`, value)
  }

  void applyStatusBar(colors.surface)
}

async function refreshPalette() {
  try {
    palette = await MaterialYou.getPalette()
    applyPalette()
  } catch {
    // Keep the current colors; the CSS baseline remains the fallback.
  }
}

export async function initMaterialYou() {
  if (Capacitor.getPlatform() !== 'android') return

  await refreshPalette()
  darkQuery.addEventListener('change', applyPalette)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void refreshPalette()
  })
}
