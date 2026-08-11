<script setup lang="ts">
import { ref, computed } from 'vue'

export interface DataTableColumn {
  key: string
  label: string
  align?: 'left' | 'right'
  sortable?: boolean
}

const props = defineProps<{
  columns: DataTableColumn[]
  rows: Record<string, unknown>[]
  rowKey: string
  emptyMessage?: string
}>()

const emit = defineEmits<{
  'row-click': [row: Record<string, unknown>]
}>()

const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(column: DataTableColumn) {
  if (!column.sortable) return
  if (sortKey.value === column.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortDir.value = 'asc'
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av == null && bv == null) return 0
    if (av == null) return -1 * dir
    if (bv == null) return 1 * dir
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
})
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-hairline">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-hairline bg-paper-dim/60">
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-3 py-2.5 text-xs font-medium tracking-wide text-muted uppercase"
            :class="[column.align === 'right' ? 'text-right' : 'text-left', column.sortable ? 'cursor-pointer select-none hover:text-ink' : '']"
            @click="toggleSort(column)"
          >
            <span class="inline-flex items-center gap-1">
              {{ column.label }}
              <span v-if="column.sortable && sortKey === column.key" class="text-[10px]">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="sortedRows.length === 0">
          <td :colspan="columns.length" class="px-3 py-10 text-center text-sm text-muted">
            {{ emptyMessage ?? 'Aucun élément.' }}
          </td>
        </tr>
        <tr
          v-for="row in sortedRows"
          :key="String(row[rowKey])"
          class="cursor-pointer border-b border-hairline transition last:border-b-0 hover:bg-paper-dim/60"
          @click="emit('row-click', row)"
        >
          <td v-for="column in columns" :key="column.key" class="px-3 py-2.5" :class="column.align === 'right' ? 'text-right tabular-nums' : 'text-left'">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
