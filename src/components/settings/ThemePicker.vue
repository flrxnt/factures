<script setup lang="ts">
import type { AppTheme } from '../../types/settings'
import { useAppSettings } from '../../composables/useAppSettings'

const { settings } = useAppSettings()

const OPTIONS: { value: AppTheme; labelFr: string }[] = [
  { value: 'light', labelFr: 'Clair' },
  { value: 'dark', labelFr: 'Sombre' },
  { value: 'system', labelFr: 'Système' },
]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in OPTIONS"
      :key="option.value"
      type="button"
      class="rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition active:scale-95"
      :class="settings.theme === option.value ? 'border-ink bg-ink text-paper' : 'border-hairline-strong text-muted hover:text-ink'"
      @click="settings.theme = option.value"
    >
      {{ option.labelFr }}
    </button>
  </div>
</template>
