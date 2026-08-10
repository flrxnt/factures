<script setup lang="ts">
import type { InvoiceMeta } from '../../types/invoice'

defineProps<{
  meta: InvoiceMeta
  showDueDate: boolean
}>()

function formatDate(iso: string, locale: string): string {
  if (!iso) return '—'
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}
</script>

<template>
  <div class="grid grid-cols-3 gap-4 rounded-md bg-slate-50 px-4 py-3 text-sm sm:w-fit sm:min-w-[22rem]">
    <div>
      <p class="text-xs font-medium tracking-wide text-slate-500 uppercase">N° facture</p>
      <p class="font-semibold text-slate-900">{{ meta.invoiceNumber || '—' }}</p>
    </div>
    <div>
      <p class="text-xs font-medium tracking-wide text-slate-500 uppercase">Émise le</p>
      <p class="font-semibold text-slate-900">{{ formatDate(meta.issueDate, meta.locale) }}</p>
    </div>
    <div v-if="showDueDate">
      <p class="text-xs font-medium tracking-wide text-slate-500 uppercase">Échéance</p>
      <p class="font-semibold text-slate-900">{{ formatDate(meta.dueDate, meta.locale) }}</p>
    </div>
  </div>
</template>
