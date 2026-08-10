<script setup lang="ts">
import { ref } from 'vue'
import type { Invoice } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'
import SignaturePad from './SignaturePad.vue'
import FileDropImage from './FileDropImage.vue'

defineProps<{
  invoice: Invoice
}>()

const mode = ref<'draw' | 'upload'>('draw')
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Signature</legend>
    <BaseInput v-model="invoice.signatureLabel" label="Mention" placeholder="Bon pour accord" />

    <div>
      <div class="mb-2 inline-flex items-center gap-1 rounded-full border border-hairline-strong p-1">
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase transition"
          :class="mode === 'draw' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
          @click="mode = 'draw'"
        >
          Dessiner
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase transition"
          :class="mode === 'upload' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
          @click="mode = 'upload'"
        >
          Importer
        </button>
      </div>

      <SignaturePad v-if="mode === 'draw'" v-model="invoice.signatureImageDataUrl" />
      <FileDropImage v-else v-model="invoice.signatureImageDataUrl" label="Signature (image)" :max-width="500" />
    </div>
  </fieldset>
</template>
