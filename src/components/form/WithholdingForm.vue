<script setup lang="ts">
import type { Withholding } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'

defineProps<{
  withholding: Withholding
}>()
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="font-display text-lg text-ink">Impôt sur le revenu (retenue)</legend>
    <p class="text-sm text-muted">
      Prélevé sur le total (après TVA), pas sur le sous-total : un taux de 5% sur 789 474 donne un net à payer de 750 000.
    </p>
    <div class="w-40">
      <BaseInput v-model.number="withholding.ratePercent" type="number" label="Taux (%)" placeholder="0" />
    </div>
  </fieldset>
</template>
