import { ref } from 'vue'
import type { StockLevel, StockMovement, Warehouse } from '../types/stock'
import { createEmptyWarehouse } from '../config/stock'
import * as stockApi from '../lib/stockApi'

const warehouses = ref<Warehouse[]>([])
const stockLevels = ref<StockLevel[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)
let hydrated = false

async function ensureLoaded(): Promise<void> {
  if (hydrated) return
  isLoading.value = true
  loadError.value = null
  try {
    const [warehouseList, levels] = await Promise.all([stockApi.listWarehouses(), stockApi.getStockLevels()])
    warehouses.value = warehouseList
    stockLevels.value = levels
    hydrated = true
  } catch (error) {
    console.error('Failed to load stock data', error)
    loadError.value = String(error)
  } finally {
    isLoading.value = false
  }
}

function quantityFor(productId: string): number {
  return stockLevels.value.find((l) => l.productId === productId)?.quantity ?? 0
}

async function refreshLevels(): Promise<void> {
  stockLevels.value = await stockApi.getStockLevels()
}

async function saveWarehouse(warehouse: Warehouse): Promise<void> {
  await stockApi.saveWarehouse(warehouse)
  const index = warehouses.value.findIndex((w) => w.id === warehouse.id)
  if (index !== -1) warehouses.value[index] = warehouse
  else warehouses.value.unshift(warehouse)
}

async function removeWarehouse(id: string): Promise<void> {
  await stockApi.removeWarehouse(id)
  warehouses.value = warehouses.value.filter((w) => w.id !== id)
}

async function recordMovement(movement: StockMovement): Promise<void> {
  await stockApi.createStockMovement(movement)
  await refreshLevels()
}

export function useStockCollection() {
  return {
    warehouses,
    stockLevels,
    isLoading,
    loadError,
    ensureLoaded,
    quantityFor,
    saveWarehouse,
    removeWarehouse,
    recordMovement,
    createWarehouse: createEmptyWarehouse,
    listMovements: stockApi.listStockMovements,
  }
}
