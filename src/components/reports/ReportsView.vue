<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Download } from '@lucide/vue'
import { useInvoiceCollection } from '../../composables/useInvoiceCollection'
import { usePaymentCollection } from '../../composables/usePaymentCollection'
import { useProductCollection } from '../../composables/useProductCollection'
import { useStockCollection } from '../../composables/useStockCollection'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../../config/defaults'
import {
  REPORT_PERIOD_ORDER,
  computeRevenueReport,
  computeUnpaidInvoices,
  computeMarginReport,
  computeStockValuationReport,
  computeExpensesTotal,
  type ReportPeriod,
} from '../../lib/reports'
import { exportReportAsCsv } from '../../lib/exportReport'
import { generateReportPdf } from '../../lib/pdf/generateReportPdf'
import { saveFile } from '../../lib/saveFile'
import DataTable from '../ui/DataTable.vue'
import type { DataTableColumn } from '../ui/DataTable.vue'
import LoadingState from '../ui/LoadingState.vue'
import ActionsMenu from '../ui/ActionsMenu.vue'

const { invoices, isLoading: invoicesLoading } = useInvoiceCollection()
const { payments, isLoading: paymentsLoading, ensureLoaded: ensurePaymentsLoaded, paidTotal } = usePaymentCollection()
const { products, isLoading: productsLoading, ensureLoaded: ensureProductsLoaded } = useProductCollection()
const { isLoading: stockLoading, loadError: stockError, ensureLoaded: ensureStockLoaded, quantityFor } = useStockCollection()

onMounted(() => {
  ensurePaymentsLoaded()
  ensureProductsLoaded()
  ensureStockLoaded()
})

const isLoading = computed(() => invoicesLoading.value || paymentsLoading.value || productsLoading.value || stockLoading.value)

const period = ref<ReportPeriod>('month')

const fmt = (amount: number) => formatCurrency(amount, DEFAULT_CURRENCY, DEFAULT_LOCALE)

const revenue = computed(() => computeRevenueReport(invoices.value, paidTotal, period.value))
const unpaidRows = computed(() => computeUnpaidInvoices(invoices.value, paidTotal, period.value))
const margin = computed(() => computeMarginReport(invoices.value, products.value, period.value))
const stockValuation = computed(() => computeStockValuationReport(products.value, quantityFor))
const expensesTotal = computed(() => computeExpensesTotal(payments.value, period.value))

// DataTable's `rows` prop is typed as Record<string, unknown>[] (it renders
// arbitrary tabular data); these reports use named interfaces instead, which
// TS won't structurally match to an index-signature type on its own.
const unpaidTableRows = computed(() => unpaidRows.value as unknown as Record<string, unknown>[])
const marginTableRows = computed(() => margin.value.byProduct as unknown as Record<string, unknown>[])
const stockTableRows = computed(() => stockValuation.value.lines as unknown as Record<string, unknown>[])

const unpaidColumns: DataTableColumn[] = [
  { key: 'name', label: 'Facture', sortable: true },
  { key: 'clientName', label: 'Client', sortable: true },
  { key: 'issueDate', label: 'Date', sortable: true },
  { key: 'balance', label: 'Solde dû', align: 'right', sortable: true },
]

const marginColumns: DataTableColumn[] = [
  { key: 'productName', label: 'Produit', sortable: true },
  { key: 'quantitySold', label: 'Qté vendue', align: 'right', sortable: true },
  { key: 'revenue', label: 'Chiffre d’affaires', align: 'right', sortable: true },
  { key: 'margin', label: 'Marge', align: 'right', sortable: true },
]

const stockColumns: DataTableColumn[] = [
  { key: 'productName', label: 'Produit', sortable: true },
  { key: 'quantity', label: 'Quantité', align: 'right', sortable: true },
  { key: 'value', label: 'Valeur', align: 'right', sortable: true },
]


async function handleExportCsv() {
  await exportReportAsCsv({ period: period.value, revenue: revenue.value, unpaid: unpaidRows.value, margin: margin.value, expensesTotal: expensesTotal.value })
}

async function handleExportPdf() {
  const doc = generateReportPdf({
    period: period.value,
    revenue: revenue.value,
    margin: margin.value,
    stockValuation: stockValuation.value,
    expensesTotal: expensesTotal.value,
  })
  const bytes = new Uint8Array(doc.output('arraybuffer'))
  await saveFile(bytes, `rapport-${new Date().toISOString().slice(0, 10)}.pdf`, 'application/pdf')
}
</script>

<template>
  <div class="px-4 py-8 sm:px-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2 class="font-display text-2xl text-ink">Rapports</h2>
      <div class="flex items-center gap-3">
        <div class="inline-flex items-center gap-1 rounded-full border border-hairline-strong p-1">
          <button
            v-for="p in REPORT_PERIOD_ORDER"
            :key="p.value"
            type="button"
            class="rounded-full px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition"
            :class="period === p.value ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
            @click="period = p.value"
          >
            {{ p.labelFr }}
          </button>
        </div>
        <ActionsMenu :icon="Download" title="Exporter">
          <button type="button" class="flex w-full items-center px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim" @click="handleExportPdf">
            Exporter (PDF)
          </button>
          <button type="button" class="flex w-full items-center px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim" @click="handleExportCsv">
            Exporter (CSV)
          </button>
        </ActionsMenu>
      </div>
    </div>

    <LoadingState v-if="isLoading" :rows="4" label="Chargement des données…" />

    <p v-else-if="stockError" class="rounded-2xl border border-dashed border-[#7d2e3b] py-16 text-center text-sm text-[#7d2e3b]">
      Impossible de charger les données de rapport : {{ stockError }}
    </p>

    <template v-else>
      <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div class="rounded-2xl border border-hairline bg-surface p-4">
          <p class="text-xs font-medium tracking-wide text-muted uppercase">CA (HT)</p>
          <p class="mt-1 font-display text-xl text-ink tabular-nums">{{ fmt(revenue.revenueHt) }}</p>
        </div>
        <div class="rounded-2xl border border-hairline bg-surface p-4">
          <p class="text-xs font-medium tracking-wide text-muted uppercase">TVA collectée</p>
          <p class="mt-1 font-display text-xl text-ink tabular-nums">{{ fmt(revenue.vatCollected) }}</p>
        </div>
        <div class="rounded-2xl border border-hairline bg-surface p-4">
          <p class="text-xs font-medium tracking-wide text-muted uppercase">Encaissé</p>
          <p class="mt-1 font-display text-xl text-ink tabular-nums">{{ fmt(revenue.collected) }}</p>
        </div>
        <div class="rounded-2xl border border-hairline bg-surface p-4">
          <p class="text-xs font-medium tracking-wide text-muted uppercase">Impayés</p>
          <p class="mt-1 font-display text-xl tabular-nums" :class="revenue.unpaid > 0 ? 'text-[#7d2e3b]' : 'text-ink'">{{ fmt(revenue.unpaid) }}</p>
        </div>
        <div class="rounded-2xl border border-hairline bg-surface p-4">
          <p class="text-xs font-medium tracking-wide text-muted uppercase">Marge brute</p>
          <p class="mt-1 font-display text-xl text-ink tabular-nums">{{ fmt(margin.margin) }}</p>
          <p class="text-xs text-muted">{{ margin.marginPercent }}% du CA lié aux produits</p>
        </div>
        <div class="rounded-2xl border border-hairline bg-surface p-4">
          <p class="text-xs font-medium tracking-wide text-muted uppercase">Dépenses</p>
          <p class="mt-1 font-display text-xl text-ink tabular-nums">{{ fmt(expensesTotal) }}</p>
        </div>
      </div>

      <div class="mb-8">
        <div class="mb-3 flex items-center justify-between">
          <p class="font-display text-lg text-ink">Factures impayées</p>
          <p class="text-xs text-muted">{{ unpaidRows.length }} facture{{ unpaidRows.length > 1 ? 's' : '' }}</p>
        </div>
        <DataTable :columns="unpaidColumns" :rows="unpaidTableRows" row-key="id" empty-message="Aucune facture impayée sur cette période.">
          <template #cell-balance="{ value }">{{ fmt(value as number) }}</template>
        </DataTable>
      </div>

      <div class="mb-8">
        <p class="mb-3 font-display text-lg text-ink">Marge par produit</p>
        <DataTable
          :columns="marginColumns"
          :rows="marginTableRows"
          row-key="productId"
          empty-message="Aucune vente de produit avec prix d'achat renseigné sur cette période."
        >
          <template #cell-revenue="{ value }">{{ fmt(value as number) }}</template>
          <template #cell-margin="{ value }">{{ fmt(value as number) }}</template>
        </DataTable>
      </div>

      <div>
        <div class="mb-3 flex items-center justify-between">
          <p class="font-display text-lg text-ink">Valorisation du stock</p>
          <p class="text-xs text-muted">Total : {{ fmt(stockValuation.totalValue) }}</p>
        </div>
        <DataTable :columns="stockColumns" :rows="stockTableRows" row-key="productId" empty-message="Aucun stock valorisable pour le moment.">
          <template #cell-value="{ value }">{{ fmt(value as number) }}</template>
        </DataTable>
      </div>
    </template>
  </div>
</template>
