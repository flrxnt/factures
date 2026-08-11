import { reactive, watch } from 'vue'
import type { AppSettings } from '../types/settings'
import { getItem, setItem } from '../lib/storage'
import { createDefaultAppSettings } from '../config/settingsDefaults'

const SETTINGS_KEY = 'flofactures:settings:v1'

// Field-by-field merge (not a blind Object.assign) so a settings object
// stored before a future field was added doesn't crash on a missing key.
function mergeWithDefaults(stored: Partial<AppSettings> | null): AppSettings {
  const defaults = createDefaultAppSettings()
  if (!stored) return defaults
  return {
    schemaVersion: defaults.schemaVersion,
    theme: stored.theme ?? defaults.theme,
    smtp: { ...defaults.smtp, ...(stored.smtp ?? {}) },
    invoiceDefaults: { ...defaults.invoiceDefaults, ...(stored.invoiceDefaults ?? {}) },
    payments: {
      ...defaults.payments,
      ...(stored.payments ?? {}),
      stripe: { ...defaults.payments.stripe, ...(stored.payments?.stripe ?? {}) },
      paydunya: { ...defaults.payments.paydunya, ...(stored.payments?.paydunya ?? {}) },
    },
  }
}

const settings = reactive<AppSettings>(mergeWithDefaults(getItem<Partial<AppSettings> | null>(SETTINGS_KEY, null)))

watch(settings, () => setItem(SETTINGS_KEY, settings), { deep: true })

export function useAppSettings() {
  return { settings }
}
