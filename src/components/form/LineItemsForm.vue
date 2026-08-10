<script setup lang="ts">
import type { LineItem } from '../../types/invoice'
import LineItemRow from './LineItemRow.vue'
import BaseButton from '../ui/BaseButton.vue'

defineProps<{
  items: LineItem[]
  showTaxColumn: boolean
  currency: string
  locale: string
}>()

const emit = defineEmits<{
  add: []
  remove: [id: string]
}>()
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="text-base font-semibold text-slate-900">Lignes de facturation</legend>

    <p v-if="items.length === 0" class="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">
      Aucune ligne. Ajoutez une prestation ou un produit.
    </p>

    <div v-else class="-mx-1 overflow-x-auto px-1">
      <div class="min-w-[38rem] space-y-2">
        <div class="grid gap-2 px-1 text-xs font-medium text-slate-500" :class="showTaxColumn ? 'grid-cols-[1fr_5rem_7rem_5rem_7rem_2rem]' : 'grid-cols-[1fr_5rem_7rem_7rem_2rem]'">
          <span>Description</span>
          <span class="text-right">Qté</span>
          <span class="text-right">Prix unitaire</span>
          <span v-if="showTaxColumn" class="text-right">TVA %</span>
          <span class="text-right">Total</span>
          <span></span>
        </div>

        <LineItemRow
          v-for="item in items"
          :key="item.id"
          :item="item"
          :show-tax-column="showTaxColumn"
          :currency="currency"
          :locale="locale"
          @remove="emit('remove', item.id)"
        />
      </div>
    </div>

    <BaseButton variant="secondary" @click="emit('add')">+ Ajouter une ligne</BaseButton>
  </fieldset>
</template>
