<script setup lang="ts">
import { useAppDialog } from '../../composables/useAppDialog'

const { state, settle } = useAppDialog()

function dismiss() {
  settle(false)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') dismiss()
  if (event.key === 'Enter') settle(true)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      @click.self="dismiss"
    >
      <div
        class="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl outline-none"
        role="alertdialog"
        aria-modal="true"
        tabindex="-1"
        @keydown="handleKeydown"
        @vue:mounted="($event.el as HTMLElement)?.focus()"
      >
        <p v-if="state.title" class="font-display text-lg text-ink">{{ state.title }}</p>
        <p class="mt-1.5 text-sm text-ink-soft">{{ state.message }}</p>
        <div class="mt-5 flex justify-end gap-2.5">
          <button
            v-if="state.kind === 'confirm'"
            type="button"
            class="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-hairline-strong transition hover:bg-paper-dim"
            @click="settle(false)"
          >
            {{ state.cancelLabel }}
          </button>
          <button
            type="button"
            class="rounded-full px-4 py-2 text-sm font-medium text-paper transition"
            :class="state.danger ? 'bg-accent-dark hover:opacity-90' : 'bg-ink hover:bg-accent-dark'"
            @click="settle(true)"
          >
            {{ state.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
