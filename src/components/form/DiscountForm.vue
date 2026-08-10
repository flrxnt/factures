<script setup lang="ts">
import type { Discount } from '../../types/invoice'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseInput from '../ui/BaseInput.vue'

defineProps<{
  discount: Discount
}>()

const TYPE_OPTIONS = [
  { value: 'percent', label: 'Pourcentage (%)' },
  { value: 'fixed', label: 'Montant fixe' },
]
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Remise</legend>
    <div class="grid grid-cols-2 gap-4">
      <BaseSelect
        :model-value="discount.type"
        label="Type"
        :options="TYPE_OPTIONS"
        @update:model-value="(v) => (discount.type = v as Discount['type'])"
      />
      <BaseInput v-model.number="discount.value" type="number" label="Valeur" placeholder="0" />
    </div>
  </fieldset>
</template>
