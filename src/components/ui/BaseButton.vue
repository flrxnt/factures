<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
)

const variantClasses: Record<string, string> = {
  primary: 'bg-ink text-paper hover:bg-accent-dark',
  secondary: 'bg-transparent text-ink ring-1 ring-inset ring-hairline-strong hover:bg-paper-dim',
  danger: 'bg-transparent text-accent-dark ring-1 ring-inset ring-accent-soft hover:bg-accent-soft',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
    ]"
  >
    <slot />
  </button>
</template>
