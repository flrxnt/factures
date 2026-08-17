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
import PreviewPaymentLink from './PreviewPaymentLink.vue'
import PreviewSignature from './PreviewSignature.vue'
import PreviewFooter from './PreviewFooter.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const { totals } = useInvoiceTotals(props.invoice)
</script>

<template>
  <div
    id="invoice-preview"
    class="mx-auto w-full max-w-[794px] space-y-8 border border-hairline bg-surface p-8 text-ink shadow-[0_1px_2px_rgba(28,26,20,0.04)] sm:p-12"
    :style="{ '--color-accent': invoice.themeColor }"
  >
    <PreviewHeader
      v-if="invoice.visibleSections.sellerInfo"
      :seller="invoice.seller"
      :show-logo="invoice.visibleSections.logo"
      :template="invoice.template"
      :doc-type="invoice.docType"
    />

    <PreviewMeta
      v-if="invoice.visibleSections.invoiceMeta"
      :meta="invoice.meta"
      :show-due-date="invoice.visibleSections.dueDate"
      :template="invoice.template"
    />

    <PreviewClient v-if="invoice.visibleSections.clientInfo" :client="invoice.client" />

    <PreviewItemsTable
      :items="invoice.items"
      :show-quantity-column="invoice.visibleSections.quantityColumn"
      :show-unit-price-column="invoice.visibleSections.unitPriceColumn"
      :show-tax-column="invoice.visibleSections.taxColumn"
      :show-line-total-column="invoice.visibleSections.lineTotalColumn"
      :currency="invoice.meta.currency"
      :locale="invoice.meta.locale"
      :template="invoice.template"
    />

    <PreviewTotals
      :totals="totals"
      :show-discount="invoice.visibleSections.discount"
      :show-withholding="invoice.visibleSections.withholding"
      :currency="invoice.meta.currency"
      :locale="invoice.meta.locale"
      :template="invoice.template"
    />

    <PreviewNotes v-if="invoice.visibleSections.notes" :notes="invoice.notes" :terms-and-conditions="invoice.termsAndConditions" />

    <PreviewPayment v-if="invoice.visibleSections.paymentDetails" :payment="invoice.payment" />

    <PreviewPaymentLink v-if="invoice.visibleSections.paymentLink" :payment-link="invoice.paymentLink" />

    <PreviewSignature
      v-if="invoice.visibleSections.signature"
      :signature-label="invoice.signatureLabel"
      :signature-image-data-url="invoice.signatureImageDataUrl"
    />

    <PreviewFooter
      v-if="invoice.visibleSections.footer"
      :footer-note-left="invoice.footerNoteLeft"
      :footer-note-right="invoice.footerNoteRight"
    />
  </div>
</template>
