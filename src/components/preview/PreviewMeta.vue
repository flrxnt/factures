<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceMeta, InvoiceTemplate } from '../../types/invoice'

const props = defineProps<{
  meta: InvoiceMeta
  showDueDate: boolean
  template: InvoiceTemplate
}>()

function formatDate(iso: string, locale: string): string {
  if (!iso) return '—'
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

const wrapperClass = computed(() => {
  if (props.template === 'minimal') return 'flex flex-wrap gap-x-10 gap-y-2 py-1 text-sm'
  if (props.template === 'bold')
    return 'flex flex-wrap gap-x-10 gap-y-3 rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_16%,white)] px-5 py-4 text-sm'
  return 'flex flex-wrap gap-x-10 gap-y-3 border-y border-hairline py-4 text-sm'
})
</script>

<template>
  <div :class="wrapperClass">
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
