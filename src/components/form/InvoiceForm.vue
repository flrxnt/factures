<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import { createEmptyLineItem } from '../../config/defaults'
import SectionToggles from './SectionToggles.vue'
import ThemeForm from './ThemeForm.vue'
import SellerForm from './SellerForm.vue'
import ClientForm from './ClientForm.vue'
import InvoiceMetaForm from './InvoiceMetaForm.vue'
import LineItemsForm from './LineItemsForm.vue'
import TotalsForm from './TotalsForm.vue'
import DiscountForm from './DiscountForm.vue'
import WithholdingForm from './WithholdingForm.vue'
import NotesForm from './NotesForm.vue'
import PaymentDetailsForm from './PaymentDetailsForm.vue'
import SignatureForm from './SignatureForm.vue'

const props = defineProps<{
  invoice: Invoice
}>()

function addItem() {
  props.invoice.items.push(createEmptyLineItem(props.invoice.meta.defaultTaxRatePercent))
}

function removeItem(id: string) {
  const index = props.invoice.items.findIndex((item) => item.id === id)
  if (index !== -1) props.invoice.items.splice(index, 1)
}
</script>

<template>
  <div class="divide-y divide-hairline">
    <div class="space-y-6 pb-8">
      <ThemeForm :invoice="invoice" />
      <SectionToggles :invoice="invoice" />
    </div>

    <div class="py-8">
      <InvoiceMetaForm :invoice="invoice" :show-due-date="invoice.visibleSections.dueDate" :show-tax-rate="invoice.visibleSections.taxColumn" />
    </div>

    <div v-if="invoice.visibleSections.sellerInfo || invoice.visibleSections.clientInfo" class="space-y-8 py-8">
      <SellerForm v-if="invoice.visibleSections.sellerInfo" :seller="invoice.seller" :show-logo="invoice.visibleSections.logo" />
      <ClientForm v-if="invoice.visibleSections.clientInfo" :client="invoice.client" />
    </div>

    <div class="py-8">
      <LineItemsForm
        :items="invoice.items"
        :show-quantity-column="invoice.visibleSections.quantityColumn"
        :show-unit-price-column="invoice.visibleSections.unitPriceColumn"
        :show-tax-column="invoice.visibleSections.taxColumn"
        :show-line-total-column="invoice.visibleSections.lineTotalColumn"
        :currency="invoice.meta.currency"
        :locale="invoice.meta.locale"
        @add="addItem"
        @remove="removeItem"
      />
    </div>

    <div class="py-8">
      <TotalsForm :invoice="invoice" />
    </div>

    <div v-if="invoice.visibleSections.discount" class="py-8">
      <DiscountForm :discount="invoice.discount" />
    </div>

    <div v-if="invoice.visibleSections.withholding" class="py-8">
      <WithholdingForm :withholding="invoice.withholding" />
    </div>

    <div v-if="invoice.visibleSections.notes" class="py-8">
      <NotesForm :invoice="invoice" />
    </div>

    <div v-if="invoice.visibleSections.paymentDetails" class="py-8">
      <PaymentDetailsForm :payment="invoice.payment" />
    </div>

    <div v-if="invoice.visibleSections.signature" class="pt-8">
      <SignatureForm :invoice="invoice" />
    </div>
  </div>
</template>
