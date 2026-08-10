<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import { useInvoiceTotals } from '../../composables/useInvoiceTotals'
import PreviewHeader from './PreviewHeader.vue'
import PreviewMeta from './PreviewMeta.vue'
import PreviewClient from './PreviewClient.vue'
import PreviewItemsTable from './PreviewItemsTable.vue'
import PreviewTotals from './PreviewTotals.vue'
import PreviewNotes from './PreviewNotes.vue'
import PreviewPayment from './PreviewPayment.vue'
import PreviewSignature from './PreviewSignature.vue'
import PreviewFooter from './PreviewFooter.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const { totals } = useInvoiceTotals(props.invoice)
</script>

<template>
  <div id="invoice-preview" class="mx-auto w-full max-w-[794px] space-y-6 bg-white p-8 text-slate-900 shadow-sm ring-1 ring-slate-200 sm:p-10">
    <PreviewHeader v-if="invoice.visibleSections.sellerInfo" :seller="invoice.seller" :show-logo="invoice.visibleSections.logo" />

    <PreviewMeta v-if="invoice.visibleSections.invoiceMeta" :meta="invoice.meta" :show-due-date="invoice.visibleSections.dueDate" />

    <PreviewClient v-if="invoice.visibleSections.clientInfo" :client="invoice.client" />

    <PreviewItemsTable
      :items="invoice.items"
      :show-tax-column="invoice.visibleSections.taxColumn"
      :currency="invoice.meta.currency"
      :locale="invoice.meta.locale"
    />

    <PreviewTotals
      :totals="totals"
      :show-discount="invoice.visibleSections.discount"
      :currency="invoice.meta.currency"
      :locale="invoice.meta.locale"
    />

    <PreviewNotes v-if="invoice.visibleSections.notes" :notes="invoice.notes" :terms-and-conditions="invoice.termsAndConditions" />

    <PreviewPayment v-if="invoice.visibleSections.paymentDetails" :payment="invoice.payment" />

    <PreviewSignature v-if="invoice.visibleSections.signature" :signature-label="invoice.signatureLabel" />

    <PreviewFooter v-if="invoice.visibleSections.footer" :seller-name="invoice.seller.name" />
  </div>
</template>
