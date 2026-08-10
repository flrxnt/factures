<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import { UNTITLED_INVOICE_NAME } from '../../config/defaults'

const props = defineProps<{
  view: 'dashboard' | 'editor'
  invoiceName?: string
}>()

const emit = defineEmits<{
  back: []
  rename: [name: string]
  export: []
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
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <button v-if="view === 'editor'" type="button" title="Retour au tableau de bord" class="shrink-0 text-lg text-muted hover:text-ink" @click="emit('back')">
          ←
        </button>
        <h1 class="shrink-0 font-display text-xl text-ink">
          Facture<span class="text-accent">.</span>
        </h1>
        <input
          v-if="view === 'editor'"
          v-model="nameDraft"
          type="text"
          :placeholder="UNTITLED_INVOICE_NAME"
          class="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent text-sm text-ink-soft outline-none transition hover:border-hairline-strong focus:border-accent"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
          @blur="commitRename"
        />
      </div>
      <div v-if="view === 'editor'" class="flex flex-wrap items-center gap-2">
        <BaseButton variant="primary" @click="emit('export')">Télécharger le PDF</BaseButton>
      </div>
    </div>
  </header>
</template>
