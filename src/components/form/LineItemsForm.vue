<script setup lang="ts">
import { computed } from 'vue'
import type { LineItem } from '../../types/invoice'
import { buildFormRowGridTemplate } from '../../config/invoiceLayout'
import LineItemRow from './LineItemRow.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  items: LineItem[]
  showQuantityColumn: boolean
  showUnitPriceColumn: boolean
  showTaxColumn: boolean
  showLineTotalColumn: boolean
  currency: string
  locale: string
}>()

const emit = defineEmits<{
  add: []
  remove: [id: string]
}>()

const gridTemplate = computed(() =>
  buildFormRowGridTemplate({
    showQuantity: props.showQuantityColumn,
    showUnitPrice: props.showUnitPriceColumn,
    showTax: props.showTaxColumn,
    showLineTotal: props.showLineTotalColumn,
  }),
)

/** Line amounts are optional (a line can be purely descriptive), but once at
 * least one line has a price, mixing in unpriced lines makes the total
 * ambiguous — flagged here rather than hard-blocked, since there's no
 * separate "submit" step to gate. */
const hasMixedAmounts = computed(() => {
  const priced = props.items.filter((item) => item.unitPrice > 0).length
  return priced > 0 && priced < props.items.length
})
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Lignes de facturation</legend>

    <p v-if="items.length === 0" class="rounded-md border border-dashed border-hairline-strong px-3 py-5 text-center text-sm text-muted">
      Aucune ligne. Ajoutez une prestation ou un produit.
    </p>

    <div v-else class="-mx-1 overflow-x-auto px-1">
      <div class="min-w-[34rem] space-y-2">
        <div class="grid gap-2 px-1 text-xs font-medium tracking-wide text-muted uppercase" :style="{ gridTemplateColumns: gridTemplate }">
          <span>Description</span>
          <span v-if="showQuantityColumn" class="text-right">Qté</span>
          <span v-if="showUnitPriceColumn" class="text-right">Prix unitaire</span>
          <span v-if="showTaxColumn" class="text-right">TVA %</span>
          <span v-if="showLineTotalColumn" class="text-right">Montant</span>
          <span></span>
        </div>

        <LineItemRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          :show-quantity-column="showQuantityColumn"
          :show-unit-price-column="showUnitPriceColumn"
          :show-tax-column="showTaxColumn"
          :show-line-total-column="showLineTotalColumn"
          :currency="currency"
          :locale="locale"
          @remove="emit('remove', item.id)"
        />
      </div>
    </div>

    <p v-if="hasMixedAmounts" class="text-sm text-accent-dark">
      Certaines lignes n'ont pas de montant : ajoutez un prix unitaire à toutes les lignes, sinon le sous-total risque d'être incomplet.
    </p>

    <BaseButton variant="secondary" @click="emit('add')">+ Ajouter une ligne</BaseButton>
  </fieldset>
</template>
