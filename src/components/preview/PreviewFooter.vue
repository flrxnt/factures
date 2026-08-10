<script setup lang="ts">
defineProps<{
  footerNoteLeft: string
  footerNoteRight: string
}>()
</script>

<template>
  <div v-if="footerNoteLeft || footerNoteRight" class="flex justify-between gap-6 border-t border-hairline pt-4 text-xs text-muted">
    <p class="whitespace-pre-wrap">{{ footerNoteLeft }}</p>
    <p class="whitespace-pre-wrap text-right">{{ footerNoteRight }}</p>
  </div>
</template>
