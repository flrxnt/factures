import { reactive } from 'vue'

type DialogKind = 'alert' | 'confirm'

interface DialogOptions {
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface DialogState extends Required<Omit<DialogOptions, 'title'>> {
  visible: boolean
  kind: DialogKind
  message: string
  title: string
  resolve: ((value: boolean) => void) | null
}

// Module-level singleton: every `useAppDialog()` call shares the same state,
// and a single <AppDialog /> mounted once in App.vue renders it.
const state = reactive<DialogState>({
  visible: false,
  kind: 'alert',
  message: '',
  title: '',
  confirmLabel: 'OK',
  cancelLabel: 'Annuler',
  danger: false,
  resolve: null,
})

function open(kind: DialogKind, message: string, options: DialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    state.kind = kind
    state.message = message
    state.title = options.title ?? ''
    state.confirmLabel = options.confirmLabel ?? (kind === 'confirm' ? 'Confirmer' : 'OK')
    state.cancelLabel = options.cancelLabel ?? 'Annuler'
    state.danger = options.danger ?? false
    state.resolve = resolve
    state.visible = true
  })
}

function settle(value: boolean) {
  state.visible = false
  state.resolve?.(value)
  state.resolve = null
}

export function useAppDialog() {
  return {
    state,
    settle,
    confirm: (message: string, options: DialogOptions = {}) => open('confirm', message, options),
    alert: (message: string, options: DialogOptions = {}) => open('alert', message, options),
  }
}
