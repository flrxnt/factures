<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { Component } from 'vue'
import { ChevronDown, EllipsisVertical } from '@lucide/vue'

const props = defineProps<{
  icon?: Component
  title?: string
  /** When set, the trigger renders as a labeled pill button (text + chevron)
   * instead of the default icon-only circle — for menus that act as a
   * primary control (e.g. "+ Autre document") rather than a row's overflow
   * actions. */
  label?: string
}>()

const MENU_WIDTH = 192 // matches w-48

const open = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const position = ref({ top: 0, left: 0 })

async function updatePosition() {
  await nextTick()
  const rect = triggerEl.value?.getBoundingClientRect()
  if (!rect) return
  position.value = { top: rect.bottom + 4, left: rect.right - MENU_WIDTH }
}

async function toggle(event: Event) {
  event.stopPropagation()
  if (open.value) {
    open.value = false
    return
  }
  await updatePosition()
  open.value = true
}

function close() {
  open.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (triggerEl.value?.contains(target) || menuEl.value?.contains(target)) return
  close()
}

// A fixed-position menu doesn't track scrolling, so close it rather than let
// it visually detach from the button that opened it.
function handleScroll() {
  if (open.value) close()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})
</script>

<template>
  <button
    v-if="props.label"
    ref="triggerEl"
    type="button"
    class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-transparent px-4 py-2 text-sm font-medium tracking-wide text-ink ring-1 ring-inset ring-hairline-strong transition hover:bg-paper-dim active:scale-[0.97]"
    @click="toggle"
  >
    <component :is="props.icon" v-if="props.icon" class="h-4 w-4" />
    {{ props.label }}
    <ChevronDown class="h-3.5 w-3.5" />
  </button>
  <button
    v-else
    ref="triggerEl"
    type="button"
    :title="props.title ?? 'Actions'"
    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-ink"
    @click="toggle"
  >
    <component :is="props.icon ?? EllipsisVertical" class="h-4 w-4" />
  </button>
  <Teleport to="body">
    <div
      v-if="open"
      ref="menuEl"
      class="fixed z-50 w-48 overflow-hidden rounded-xl border border-hairline bg-surface py-1 shadow-lg"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      @click="close"
    >
      <slot />
    </div>
  </Teleport>
</template>
