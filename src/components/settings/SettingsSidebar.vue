<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { Palette, Receipt, Mail, CreditCard } from '@lucide/vue'

export type SettingsTab = 'apparence' | 'facturation' | 'email' | 'paiements'

const props = defineProps<{
  modelValue: SettingsTab
  showEmail: boolean
  showPaiements: boolean
}>()

defineEmits<{
  'update:modelValue': [tab: SettingsTab]
}>()

const items = computed(() => {
  const all: { value: SettingsTab; labelFr: string; icon: Component }[] = [
    { value: 'apparence', labelFr: 'Apparence', icon: Palette },
    { value: 'facturation', labelFr: 'Facturation', icon: Receipt },
    { value: 'email', labelFr: 'E-mail', icon: Mail },
    { value: 'paiements', labelFr: 'Paiements', icon: CreditCard },
  ]
  return all.filter((item) => {
    if (item.value === 'email') return props.showEmail
    if (item.value === 'paiements') return props.showPaiements
    return true
  })
})
</script>

<template>
  <nav class="flex shrink-0 flex-col gap-1 sm:w-48">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition"
      :class="modelValue === item.value ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-dim hover:text-ink'"
      @click="$emit('update:modelValue', item.value)"
    >
      <component :is="item.icon" class="h-4 w-4 shrink-0" />
      {{ item.labelFr }}
    </button>
  </nav>
</template>
