import { watch } from 'vue'
import { useAppSettings } from './useAppSettings'

function resolveEffective(theme: 'light' | 'dark' | 'system', prefersDark: boolean): 'light' | 'dark' {
  return theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
}

/** Applies `settings.theme` to the document by toggling a `.dark` class —
 * every component already consumes color tokens via CSS custom properties
 * (see style.css), so this single class flip re-themes the whole app. */
export function useAppTheme() {
  const { settings } = useAppSettings()
  const media = window.matchMedia('(prefers-color-scheme: dark)')

  function apply() {
    document.documentElement.classList.toggle('dark', resolveEffective(settings.theme, media.matches) === 'dark')
  }

  let stopWatch: (() => void) | null = null

  function start() {
    media.addEventListener('change', apply)
    stopWatch = watch(() => settings.theme, apply, { immediate: true })
  }

  function stop() {
    media.removeEventListener('change', apply)
    stopWatch?.()
  }

  return { start, stop }
}
