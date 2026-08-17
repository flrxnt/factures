<script setup lang="ts">
import { ref, watch } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import { ArrowLeft, Undo2, Redo2 } from '@lucide/vue'
import BaseButton from '../ui/BaseButton.vue'
import StatusSelect from '../ui/StatusSelect.vue'
import { UNTITLED_INVOICE_NAME } from '../../config/defaults'
import type { InvoiceStatus } from '../../types/invoice'

const isTauriEnv = isTauri()

const props = defineProps<{
  invoiceName?: string
  invoiceStatus?: InvoiceStatus
  canUndo?: boolean
  canRedo?: boolean
}>()

const emit = defineEmits<{
  back: []
  rename: [name: string]
  'status-change': [status: InvoiceStatus]
  undo: []
  redo: []
  export: []
  'send-email': []
}>()

const nameDraft = ref(props.invoiceName ?? '')
watch(
  () => props.invoiceName,
  (value) => {
    nameDraft.value = value ?? ''
  },
)

function commitRename() {
  const trimmed = nameDraft.value.trim()
  if (trimmed !== (props.invoiceName ?? '')) emit('rename', trimmed)
}
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-hairline bg-paper/90 backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          title="Retour au tableau de bord"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-ink active:scale-90"
          @click="emit('back')"
        >
          <ArrowLeft class="h-4.5 w-4.5" />
        </button>
        <input
          v-model="nameDraft"
          type="text"
          :placeholder="UNTITLED_INVOICE_NAME"
          class="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent text-sm text-ink-soft outline-none transition hover:border-hairline-strong focus:border-accent"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
          @blur="commitRename"
        />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-1">
          <button
            type="button"
            title="Annuler"
            class="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-ink active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted disabled:active:scale-100"
            :disabled="!canUndo"
            @click="emit('undo')"
          >
            <Undo2 class="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Rétablir"
            class="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-ink active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted disabled:active:scale-100"
            :disabled="!canRedo"
            @click="emit('redo')"
          >
            <Redo2 class="h-4 w-4" />
          </button>
        </div>
        <StatusSelect v-if="invoiceStatus" :model-value="invoiceStatus" @update:model-value="(status) => emit('status-change', status)" />
        <BaseButton v-if="isTauriEnv" variant="secondary" @click="emit('send-email')">Envoyer par e-mail</BaseButton>
        <BaseButton variant="primary" @click="emit('export')">Télécharger le PDF</BaseButton>
      </div>
    </div>
  </header>
</template>
