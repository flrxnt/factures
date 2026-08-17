<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Package } from '@lucide/vue'
import { useProductCollection } from '../../composables/useProductCollection'
import type { Product } from '../../types/product'

const emit = defineEmits<{
  select: [product: Product]
}>()

const { products, ensureLoaded } = useProductCollection()
onMounted(ensureLoaded)

const query = ref('')
const open = ref(false)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return products.value.filter((p) => !p.archivedAt && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))).slice(0, 8)
})

function selectProduct(product: Product) {
  emit('select', product)
  query.value = ''
  open.value = false
}

// Delayed so a click on a dropdown option (which blurs the input first)
// still registers before the list disappears.
function handleBlur() {
  window.setTimeout(() => {
    open.value = false
  }, 150)
}
</script>

<template>
  <div class="relative">
    <label class="flex items-center gap-1.5 rounded-md border border-dashed border-hairline-strong bg-paper-dim/40 px-2 py-1 text-xs">
      <Package class="h-3.5 w-3.5 shrink-0 text-muted" />
      <input
        v-model="query"
        type="text"
        placeholder="Rechercher un produit du catalogue…"
        class="w-full bg-transparent text-ink outline-none placeholder:text-muted"
        @focus="open = true"
        @blur="handleBlur"
      />
    </label>
    <div v-if="open && results.length > 0" class="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-lg border border-hairline bg-surface shadow-lg">
      <button
        v-for="product in results"
        :key="product.id"
        type="button"
        class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-paper-dim"
        @mousedown.prevent="selectProduct(product)"
      >
        <span class="truncate text-ink">{{ product.name }}</span>
        <span class="shrink-0 text-xs text-muted tabular-nums">{{ product.salePrice }}</span>
      </button>
    </div>
  </div>
</template>
