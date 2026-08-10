<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import { createEmptyLineItem } from '../../config/defaults'
import SectionToggles from './SectionToggles.vue'
import SellerForm from './SellerForm.vue'
import ClientForm from './ClientForm.vue'
import InvoiceMetaForm from './InvoiceMetaForm.vue'
import LineItemsForm from './LineItemsForm.vue'
import DiscountForm from './DiscountForm.vue'
import NotesForm from './NotesForm.vue'
import PaymentDetailsForm from './PaymentDetailsForm.vue'
import SignatureForm from './SignatureForm.vue'

const props = defineProps<{
  invoice: Invoice
}>()

function addItem() {
  props.invoice.items.push(createEmptyLineItem())
}

function removeItem(id: string) {
  const index = props.invoice.items.findIndex((item) => item.id === id)
  if (index !== -1) props.invoice.items.splice(index, 1)
}
</script>

<template>
  <div class="space-y-6">
    <SectionToggles :invoice="invoice" />

    <InvoiceMetaForm :meta="invoice.meta" :show-due-date="invoice.visibleSections.dueDate" />

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <SellerForm v-if="invoice.visibleSections.sellerInfo" :seller="invoice.seller" :show-logo="invoice.visibleSections.logo" />
      <ClientForm v-if="invoice.visibleSections.clientInfo" :client="invoice.client" />
    </div>

    <LineItemsForm
      :items="invoice.items"
      :show-tax-column="invoice.visibleSections.taxColumn"
      :currency="invoice.meta.currency"
      :locale="invoice.meta.locale"
      @add="addItem"
      @remove="removeItem"
    />

    <DiscountForm v-if="invoice.visibleSections.discount" :discount="invoice.discount" />

    <NotesForm v-if="invoice.visibleSections.notes" :invoice="invoice" />

    <PaymentDetailsForm v-if="invoice.visibleSections.paymentDetails" :payment="invoice.payment" />

    <SignatureForm v-if="invoice.visibleSections.signature" :invoice="invoice" />
  </div>
</template>
