<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { TriangleAlert, X } from '@lucide/vue'
import { useProductCollection } from '../../composables/useProductCollection'
import { useStockCollection } from '../../composables/useStockCollection'
import { useAppDialog } from '../../composables/useAppDialog'
import DataTable from '../ui/DataTable.vue'
import type { DataTableColumn } from '../ui/DataTable.vue'
import LoadingState from '../ui/LoadingState.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import StockMovementDialog from './StockMovementDialog.vue'

const { products, ensureLoaded: ensureProductsLoaded } = useProductCollection()
const { warehouses, isLoading, ensureLoaded, quantityFor, saveWarehouse, removeWarehouse, createWarehouse } = useStockCollection()
const { alert, confirm: confirmDialog } = useAppDialog()

onMounted(() => {
  ensureProductsLoaded()
  ensureLoaded()
})

const dialogOpen = ref(false)

const stockProducts = computed(() =>
  products.value
    .filter((p) => p.kind === 'good' && !p.archivedAt)
    .map((p) => ({ id: p.id, name: p.name, category: p.category, quantity: quantityFor(p.id), lowStockThreshold: p.lowStockThreshold })),
)

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Produit', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'quantity', label: 'Stock disponible', align: 'right', sortable: true },
]

function isLowStock(row: Record<string, unknown>): boolean {
  const threshold = row.lowStockThreshold as number | null
  return threshold != null && (row.quantity as number) <= threshold
}

const newWarehouseName = ref('')

async function handleAddWarehouse() {
  const name = newWarehouseName.value.trim()
  if (!name) return
  const warehouse = createWarehouse(name)
  if (warehouses.value.length === 0) warehouse.isDefault = true
  try {
    await saveWarehouse(warehouse)
    newWarehouseName.value = ''
  } catch (error) {
    await alert(String(error), { title: 'Erreur' })
  }
}

async function handleRemoveWarehouse(id: string, name: string) {
  const confirmed = await confirmDialog(`Supprimer « ${name} » ?`, { title: "Supprimer l'entrepôt", confirmLabel: 'Supprimer', danger: true })
  if (!confirmed) return
  try {
    await removeWarehouse(id)
  } catch (error) {
    await alert(String(error), { title: 'Suppression impossible' })
  }
}
</script>

<template>
  <div class="px-4 py-8 sm:px-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2 class="font-display text-2xl text-ink">Stock</h2>
      <BaseButton variant="primary" :disabled="warehouses.length === 0" @click="dialogOpen = true">+ Nouveau mouvement</BaseButton>
    </div>

    <LoadingState v-if="isLoading" :rows="4" label="Chargement du stock…" />

    <template v-else>
      <div class="mb-6 rounded-2xl border border-hairline bg-surface p-5">
        <p class="font-display text-lg text-ink">Entrepôts</p>
        <div v-if="warehouses.filter((w) => !w.archivedAt).length > 0" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="w in warehouses.filter((w) => !w.archivedAt)"
            :key="w.id"
            class="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-3 py-1 text-xs text-ink-soft"
          >
            {{ w.name }}
            <span v-if="w.isDefault" class="text-muted">(défaut)</span>
            <button type="button" class="text-muted hover:text-accent-dark" title="Supprimer" @click="handleRemoveWarehouse(w.id, w.name)">
              <X class="h-3 w-3" />
            </button>
          </span>
        </div>
        <div class="mt-3 flex gap-2">
          <BaseInput v-model="newWarehouseName" placeholder="Nom du nouvel entrepôt" @keydown.enter="handleAddWarehouse" />
          <BaseButton variant="secondary" @click="handleAddWarehouse">Ajouter</BaseButton>
        </div>
      </div>

      <p v-if="stockProducts.length === 0" class="rounded-2xl border border-dashed border-hairline-strong py-16 text-center text-sm text-muted">
        Aucun produit stockable pour le moment. Ajoutez des produits de type « Produit » dans le catalogue.
      </p>

      <DataTable v-else :columns="columns" :rows="stockProducts" row-key="id">
        <template #cell-quantity="{ row, value }">
          <span class="inline-flex items-center justify-end gap-1.5">
            <TriangleAlert v-if="isLowStock(row)" class="h-3.5 w-3.5 text-[#7d2e3b]" />
            {{ value }}
          </span>
        </template>
      </DataTable>
    </template>

    <StockMovementDialog v-model:open="dialogOpen" />
  </div>
</template>
