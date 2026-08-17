<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Pencil, Trash2, TriangleAlert } from '@lucide/vue'
import { useProductCollection } from '../../composables/useProductCollection'
import { useStockCollection } from '../../composables/useStockCollection'
import { useAppDialog } from '../../composables/useAppDialog'
import { useAppSettings } from '../../composables/useAppSettings'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { PRODUCT_KIND_ORDER, getProductKindDescriptor } from '../../config/products'
import type { Product, ProductKind } from '../../types/product'
import DataTable from '../ui/DataTable.vue'
import type { DataTableColumn } from '../ui/DataTable.vue'
import LoadingState from '../ui/LoadingState.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import ProductFormDialog from './ProductFormDialog.vue'

const { products, isLoading, ensureLoaded, remove, create } = useProductCollection()
const { quantityFor, ensureLoaded: ensureStockLoaded } = useStockCollection()
const { confirm: confirmDialog, alert: alertDialog } = useAppDialog()
const { settings } = useAppSettings()

onMounted(() => {
  ensureLoaded()
  ensureStockLoaded()
})

const searchQuery = ref('')
const kindFilter = ref<ProductKind | 'all'>('all')
const showArchived = ref(false)

const filteredProducts = computed(() => {
  let result = products.value
  if (!showArchived.value) result = result.filter((p) => !p.archivedAt)
  if (kindFilter.value !== 'all') result = result.filter((p) => p.kind === kindFilter.value)
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter((p) => [p.name, p.sku, p.category].some((field) => field.toLowerCase().includes(query)))
  }
  return result
})

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'kind', label: 'Type' },
  { key: 'salePrice', label: 'Prix de vente', align: 'right', sortable: true },
  { key: 'stock', label: 'Stock', align: 'right' },
  { key: 'actions', label: '' },
]

function isLowStock(product: Product): boolean {
  return product.kind === 'good' && product.lowStockThreshold != null && quantityFor(product.id) <= product.lowStockThreshold
}

const editing = ref<Product | null>(null)
const isNew = ref(false)
const dialogOpen = ref(false)

function openCreate() {
  editing.value = create()
  isNew.value = true
  dialogOpen.value = true
}

function openEdit(product: Product) {
  editing.value = { ...product }
  isNew.value = false
  dialogOpen.value = true
}

async function handleRemove(product: Product) {
  const confirmed = await confirmDialog(`Supprimer « ${product.name || 'ce produit'} » ? Cette action est irréversible.`, {
    title: 'Supprimer le produit',
    confirmLabel: 'Supprimer',
    danger: true,
  })
  if (!confirmed) return
  try {
    await remove(product.id)
  } catch (error) {
    await alertDialog(String(error), { title: 'Suppression impossible' })
  }
}
</script>

<template>
  <div class="px-4 py-8 sm:px-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2 class="font-display text-2xl text-ink">Catalogue</h2>
      <BaseButton variant="primary" @click="openCreate">+ Nouveau produit</BaseButton>
    </div>

    <LoadingState v-if="isLoading" :rows="4" label="Chargement du catalogue…" />

    <template v-else>
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <label class="flex items-center gap-2 rounded-full border border-hairline-strong bg-surface px-3.5 py-2 sm:max-w-xs">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="shrink-0 text-muted">
            <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.4" />
            <line x1="9.8" y1="9.8" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase transition active:scale-95"
            :class="kindFilter === 'all' ? 'border-ink bg-ink text-paper' : 'border-hairline-strong text-muted hover:text-ink'"
            @click="kindFilter = 'all'"
          >
            Tous
          </button>
          <button
            v-for="k in PRODUCT_KIND_ORDER"
            :key="k.value"
            type="button"
            class="rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase transition active:scale-95"
            :class="kindFilter === k.value ? 'border-ink bg-ink text-paper' : 'border-hairline-strong text-muted hover:text-ink'"
            @click="kindFilter = k.value"
          >
            {{ k.labelFr }}
          </button>
        </div>

        <BaseToggle v-model="showArchived" label="Afficher les archivés" />
      </div>

      <p v-if="products.length === 0" class="rounded-2xl border border-dashed border-hairline-strong py-16 text-center text-sm text-muted">
        Aucun produit pour le moment. Créez-en un pour commencer.
      </p>
      <p
        v-else-if="filteredProducts.length === 0"
        class="rounded-2xl border border-dashed border-hairline-strong py-16 text-center text-sm text-muted"
      >
        Aucun produit ne correspond à ces filtres.
      </p>

      <DataTable v-else :columns="columns" :rows="filteredProducts" row-key="id" @row-click="(row) => openEdit(row as unknown as Product)">
        <template #cell-salePrice="{ value }">
          {{ formatCurrency(value as number, settings.invoiceDefaults.currency, settings.invoiceDefaults.locale) }}
        </template>
        <template #cell-kind="{ value }">
          {{ getProductKindDescriptor(value as ProductKind).labelFr }}
        </template>
        <template #cell-stock="{ row }">
          <span v-if="(row as unknown as Product).kind === 'good'" class="inline-flex items-center justify-end gap-1.5">
            <TriangleAlert v-if="isLowStock(row as unknown as Product)" class="h-3.5 w-3.5 text-[#7d2e3b]" />
            {{ quantityFor((row as unknown as Product).id) }}
          </span>
          <span v-else class="text-muted">—</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex justify-end gap-1">
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-ink"
              title="Modifier"
              @click.stop="openEdit(row as unknown as Product)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-accent-dark"
              title="Supprimer"
              @click.stop="handleRemove(row as unknown as Product)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </template>
      </DataTable>
    </template>

    <ProductFormDialog v-model:open="dialogOpen" :product="editing" :is-new="isNew" />
  </div>
</template>
