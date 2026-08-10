<script setup lang="ts">
import { useInvoiceHistory } from '../../composables/useInvoiceHistory'
import InvoiceHistoryItem from './InvoiceHistoryItem.vue'
import BaseButton from '../ui/BaseButton.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  load: [id: string]
}>()

const { history, remove } = useInvoiceHistory()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex justify-end bg-slate-900/30" @click.self="emit('close')">
      <aside class="flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 class="text-base font-semibold text-slate-900">Historique des factures</h2>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="emit('close')">✕</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <p v-if="history.length === 0" class="text-sm text-slate-500">Aucune facture générée pour le moment.</p>
          <ul v-else class="space-y-2">
            <InvoiceHistoryItem
              v-for="entry in history"
              :key="entry.id"
              :invoice="entry"
              @load="emit('load', entry.id)"
              @remove="remove(entry.id)"
            />
          </ul>
        </div>
        <div class="border-t border-slate-200 p-4">
          <BaseButton variant="secondary" @click="emit('close')">Fermer</BaseButton>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
