import { computed, nextTick, ref, watch } from 'vue'
import type { Invoice } from '../types/invoice'

const MAX_HISTORY = 50
const SNAPSHOT_DELAY_MS = 500

/**
 * Per-invoice undo/redo: a debounced stack of full JSON snapshots (so a
 * burst of keystrokes becomes one undo step, not one per character) with a
 * pointer into it. `invoice` is expected to be a stable object reference
 * (the app's single reactive "currently open" invoice) — call reset()
 * whenever a *different* invoice is loaded into it, so history doesn't leak
 * across documents.
 */
export function useUndoHistory(invoice: Invoice) {
  const history = ref<string[]>([JSON.stringify(invoice)])
  const pointer = ref(0)
  const hasPending = ref(false)
  let applying = false
  let timer: ReturnType<typeof setTimeout> | undefined

  function pushSnapshot() {
    hasPending.value = false
    if (applying) return
    const snapshot = JSON.stringify(invoice)
    if (snapshot === history.value[pointer.value]) return
    const truncated = history.value.slice(0, pointer.value + 1)
    truncated.push(snapshot)
    if (truncated.length > MAX_HISTORY) truncated.shift()
    history.value = truncated
    pointer.value = history.value.length - 1
  }

  function flushPending() {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
      pushSnapshot()
    }
  }

  watch(
    invoice,
    () => {
      if (applying) return
      hasPending.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(pushSnapshot, SNAPSHOT_DELAY_MS)
    },
    { deep: true },
  )

  function applySnapshot(index: number) {
    applying = true
    Object.assign(invoice, JSON.parse(history.value[index]))
    pointer.value = index
    // Vue's deep watcher for this mutation fires during the reactivity
    // flush, which happens before nextTick callbacks run — so resetting the
    // flag here (not synchronously) is what lets the watcher see `applying`
    // still true and skip queuing a spurious snapshot for our own revert.
    nextTick(() => {
      applying = false
    })
  }

  function undo() {
    flushPending()
    if (pointer.value <= 0) return
    applySnapshot(pointer.value - 1)
  }

  function redo() {
    if (pointer.value >= history.value.length - 1) return
    applySnapshot(pointer.value + 1)
  }

  function reset() {
    flushPending()
    history.value = [JSON.stringify(invoice)]
    pointer.value = 0
    hasPending.value = false
  }

  const canUndo = computed(() => pointer.value > 0 || hasPending.value)
  const canRedo = computed(() => pointer.value < history.value.length - 1)

  return { undo, redo, reset, canUndo, canRedo }
}
