<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '../../types/product'
import { PRODUCT_KIND_ORDER, COMMON_UNITS } from '../../config/products'
import { useProductCollection } from '../../composables/useProductCollection'
import { useAppDialog } from '../../composables/useAppDialog'
import BaseInput from '../ui/BaseInput.vue'
import BaseTextarea from '../ui/BaseTextarea.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  open: boolean
  product: Product | null
  isNew: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { save } = useProductCollection()
const { alert } = useAppDialog()

const draft = ref<Product | null>(null)
const saving = ref(false)

watch(
  () => props.product,
  (value) => {
    draft.value = value ? { ...value } : null
  },
  { immediate: true },
)

function close() {
  emit('update:open', false)
}

function setPurchasePrice(value: string | number) {
  if (!draft.value) return
  draft.value.purchasePrice = value === '' ? null : Number(value)
}

function setLowStockThreshold(value: string | number) {
  if (!draft.value) return
  draft.value.lowStockThreshold = value === '' ? null : Number(value)
}

function toggleArchived(archived: boolean) {
  if (!draft.value) return
  draft.value.archivedAt = archived ? new Date().toISOString() : ''
}

async function handleSave() {
  if (!draft.value) return
  saving.value = true
  try {
    await save(draft.value)
    close()
  } catch (error) {
    await alert(`Impossible d'enregistrer le produit : ${error}`, { title: 'Erreur' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open && draft" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" @click.self="close">
      <div class="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <p class="font-display text-lg text-ink">{{ isNew ? 'Nouveau produit' : 'Modifier le produit' }}</p>

        <div class="mt-4 space-y-4">
          <div class="flex gap-2">
            <button
              v-for="k in PRODUCT_KIND_ORDER"
              :key="k.value"
              type="button"
              class="rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition"
              :class="draft.kind === k.value ? 'border-ink bg-ink text-paper' : 'border-hairline-strong text-muted hover:text-ink'"
              @click="draft.kind = k.value"
            >
              {{ k.labelFr }}
            </button>
          </div>

          <BaseInput v-model="draft.name" label="Nom" required />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="draft.sku" label="Référence (SKU)" />
            <BaseInput v-model="draft.category" label="Catégorie" />
          </div>
          <BaseTextarea v-model="draft.description" label="Description" :rows="2" />

          <div class="grid grid-cols-3 gap-4">
            <BaseInput v-model.number="draft.salePrice" type="number" label="Prix de vente" />
            <BaseInput :model-value="draft.purchasePrice ?? ''" type="number" label="Prix d'achat" @update:model-value="setPurchasePrice" />
            <BaseInput v-model.number="draft.taxRatePercent" type="number" label="TVA (%)" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">Unité</span>
              <input
                v-model="draft.unit"
                list="product-unit-options"
                class="w-full border-0 border-b border-hairline-strong bg-transparent px-0.5 py-1.5 text-sm text-ink outline-none transition focus:border-accent"
              />
              <datalist id="product-unit-options">
                <option v-for="u in COMMON_UNITS" :key="u" :value="u" />
              </datalist>
            </label>
            <BaseInput :model-value="draft.lowStockThreshold ?? ''" type="number" label="Seuil d'alerte stock" @update:model-value="setLowStockThreshold" />
          </div>

          <BaseToggle v-if="!isNew" :model-value="!!draft.archivedAt" label="Archivé" @update:model-value="toggleArchived" />
        </div>

        <div class="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            class="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-ink ring-1 ring-inset ring-hairline-strong transition hover:bg-paper-dim"
            :disabled="saving"
            @click="close"
          >
            Annuler
          </button>
          <BaseButton variant="primary" :disabled="saving || !draft.name" @click="handleSave">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
