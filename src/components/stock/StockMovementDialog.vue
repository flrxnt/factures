<script setup lang="ts">
import { ref, watch } from 'vue'
import { MOVEMENT_TYPE_ORDER } from '../../config/stock'
import { useProductCollection } from '../../composables/useProductCollection'
import { useStockCollection } from '../../composables/useStockCollection'
import { useAppDialog } from '../../composables/useAppDialog'
import type { MovementType } from '../../types/stock'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseTextarea from '../ui/BaseTextarea.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { products } = useProductCollection()
const { warehouses, recordMovement } = useStockCollection()
const { alert } = useAppDialog()

const productId = ref('')
const warehouseId = ref('')
const movementType = ref<MovementType>('in')
const quantity = ref(0)
const note = ref('')
const saving = ref(false)

const productOptions = () => products.value.filter((p) => p.kind === 'good' && !p.archivedAt).map((p) => ({ value: p.id, label: p.name || 'Sans nom' }))
const warehouseOptions = () => warehouses.value.filter((w) => !w.archivedAt).map((w) => ({ value: w.id, label: w.name }))

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    productId.value = productOptions()[0]?.value ?? ''
    warehouseId.value = warehouses.value.find((w) => w.isDefault)?.id ?? warehouseOptions()[0]?.value ?? ''
    movementType.value = 'in'
    quantity.value = 0
    note.value = ''
  },
)

function close() {
  emit('update:open', false)
}

async function handleSave() {
  if (!productId.value || !warehouseId.value || quantity.value <= 0) return
  saving.value = true
  try {
    await recordMovement({
      id: crypto.randomUUID(),
      productId: productId.value,
      warehouseId: warehouseId.value,
      movementType: movementType.value,
      quantity: quantity.value,
      unitCost: null,
      documentId: null,
      note: note.value,
      createdAt: new Date().toISOString(),
    })
    close()
  } catch (error) {
    await alert(`Impossible d'enregistrer le mouvement : ${error}`, { title: 'Erreur' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" @click.self="close">
      <div class="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <p class="font-display text-lg text-ink">Nouveau mouvement de stock</p>

        <div class="mt-4 space-y-4">
          <BaseSelect v-model="productId" label="Produit" :options="productOptions()" />
          <BaseSelect v-model="warehouseId" label="Entrepôt" :options="warehouseOptions()" />
          <div class="flex gap-2">
            <button
              v-for="type in MOVEMENT_TYPE_ORDER"
              :key="type.value"
              type="button"
              class="rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition"
              :class="movementType === type.value ? 'border-ink bg-ink text-paper' : 'border-hairline-strong text-muted hover:text-ink'"
              @click="movementType = type.value"
            >
              {{ type.labelFr }}
            </button>
          </div>
          <BaseInput v-model.number="quantity" type="number" label="Quantité" />
          <BaseTextarea v-model="note" label="Note" :rows="2" />
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
          <BaseButton variant="primary" :disabled="saving || !productId || !warehouseId || quantity <= 0" @click="handleSave">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
