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
  <div class="flex flex-wrap gap-x-10 gap-y-3 border-y border-hairline py-4 text-sm">
    <div>
      <p class="text-xs font-medium tracking-wide text-muted uppercase">N° facture</p>
      <p class="mt-0.5 font-medium text-ink">{{ meta.invoiceNumber || '—' }}</p>
    </div>
    <div>
      <p class="text-xs font-medium tracking-wide text-muted uppercase">Émise le</p>
      <p class="mt-0.5 font-medium text-ink">{{ formatDate(meta.issueDate, meta.locale) }}</p>
    </div>
    <div v-if="showDueDate">
      <p class="text-xs font-medium tracking-wide text-muted uppercase">Échéance</p>
      <p class="mt-0.5 font-medium text-ink">{{ formatDate(meta.dueDate, meta.locale) }}</p>
    </div>
  </div>
</template>
