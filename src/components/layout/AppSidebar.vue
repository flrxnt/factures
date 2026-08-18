<script setup lang="ts">
import { Files, Package, Receipt, Settings, Warehouse } from '@lucide/vue'
import type { AppView } from '../../composables/useAppNavigation'

defineProps<{
  view: AppView
  isTauriEnv: boolean
}>()

const emit = defineEmits<{
  'open-dashboard': []
  'open-catalog': []
  'open-stock': []
  'open-expenses': []
  'open-settings': []
}>()
</script>

<template>
  <aside class="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-hairline bg-paper-dim/40 px-4 py-6">
    <h1 class="mb-8 px-2 font-display text-xl text-ink">Facture<span class="text-accent">.</span></h1>

    <nav class="flex flex-1 flex-col gap-1">
      <button
        type="button"
        class="flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition"
        :class="view === 'dashboard' || view === 'editor' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim hover:text-ink'"
        @click="emit('open-dashboard')"
      >
        <Files class="h-4 w-4 shrink-0" />
        Documents
      </button>
      <button
        v-if="isTauriEnv"
        type="button"
        class="flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition"
        :class="view === 'catalog' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim hover:text-ink'"
        @click="emit('open-catalog')"
      >
        <Package class="h-4 w-4 shrink-0" />
        Catalogue
      </button>
      <button
        v-if="isTauriEnv"
        type="button"
        class="flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition"
        :class="view === 'stock' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim hover:text-ink'"
        @click="emit('open-stock')"
      >
        <Warehouse class="h-4 w-4 shrink-0" />
        Stock
      </button>
      <button
        v-if="isTauriEnv"
        type="button"
        class="flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition"
        :class="view === 'expenses' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim hover:text-ink'"
        @click="emit('open-expenses')"
      >
        <Receipt class="h-4 w-4 shrink-0" />
        Dépenses
      </button>
    </nav>

    <button
      type="button"
      class="flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition"
      :class="view === 'settings' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim hover:text-ink'"
      @click="emit('open-settings')"
    >
      <Settings class="h-4 w-4 shrink-0" />
      Paramètres
    </button>
  </aside>
</template>
