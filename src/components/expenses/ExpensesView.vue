<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Trash2 } from '@lucide/vue'
import { usePaymentCollection } from '../../composables/usePaymentCollection'
import { useAppDialog } from '../../composables/useAppDialog'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../../config/defaults'
import DataTable from '../ui/DataTable.vue'
import type { DataTableColumn } from '../ui/DataTable.vue'
import LoadingState from '../ui/LoadingState.vue'
import BaseButton from '../ui/BaseButton.vue'
import ExpenseDialog from './ExpenseDialog.vue'

const { payments, isLoading, loadError, ensureLoaded, remove } = usePaymentCollection()
const { confirm: confirmDialog, alert } = useAppDialog()

onMounted(ensureLoaded)

const dialogOpen = ref(false)

const expenses = computed(() =>
  payments.value
    .filter((p) => p.direction === 'out')
    .map((p) => ({
      id: p.id,
      amount: formatCurrency(p.amount, DEFAULT_CURRENCY, DEFAULT_LOCALE),
      category: p.category || '—',
      counterparty: p.counterparty || '—',
      method: p.method || '—',
      paidAt: p.paidAt,
    }))
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
)

const totalExpenses = computed(() => payments.value.filter((p) => p.direction === 'out').reduce((sum, p) => sum + p.amount, 0))

const columns: DataTableColumn[] = [
  { key: 'paidAt', label: 'Date', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'counterparty', label: 'Bénéficiaire', sortable: true },
  { key: 'method', label: 'Moyen' },
  { key: 'amount', label: 'Montant', align: 'right', sortable: true },
]

async function handleRemove(id: string) {
  const confirmed = await confirmDialog('Supprimer cette dépense ? Cette action est irréversible.', {
    title: 'Supprimer la dépense',
    confirmLabel: 'Supprimer',
    danger: true,
  })
  if (!confirmed) return
  try {
    await remove(id)
  } catch (error) {
    await alert(String(error), { title: 'Suppression impossible' })
  }
}
</script>

<template>
  <div class="px-4 py-8 sm:px-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-2xl text-ink">Dépenses</h2>
        <p class="mt-1 text-sm text-muted">Total : {{ formatCurrency(totalExpenses, DEFAULT_CURRENCY, DEFAULT_LOCALE) }}</p>
      </div>
      <BaseButton variant="primary" @click="dialogOpen = true">+ Nouvelle dépense</BaseButton>
    </div>

    <LoadingState v-if="isLoading" :rows="4" label="Chargement des dépenses…" />

    <p v-else-if="loadError" class="rounded-2xl border border-dashed border-[#7d2e3b] py-16 text-center text-sm text-[#7d2e3b]">
      Impossible de charger les dépenses : {{ loadError }}
    </p>

    <DataTable v-else :columns="columns" :rows="expenses" row-key="id" empty-message="Aucune dépense enregistrée pour le moment.">
      <template #cell-amount="{ row, value }">
        <span class="inline-flex items-center justify-end gap-3">
          {{ value }}
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-accent-dark"
            title="Supprimer"
            @click.stop="handleRemove(row.id as string)"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </span>
      </template>
    </DataTable>

    <ExpenseDialog v-model:open="dialogOpen" />
  </div>
</template>
