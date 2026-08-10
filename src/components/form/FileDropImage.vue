<script setup lang="ts">
import { ref } from 'vue'
import { fileToCompressedDataUrl } from '../../lib/image'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    maxWidth?: number
  }>(),
  { label: 'Image', maxWidth: 400 },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isDragging = ref(false)
const error = ref('')

async function handleFile(file: File | undefined) {
  error.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Le fichier doit être une image.'
    return
  }
  try {
    const dataUrl = await fileToCompressedDataUrl(file, props.maxWidth)
    emit('update:modelValue', dataUrl)
  } catch {
    error.value = "Impossible de charger l'image."
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  handleFile(event.dataTransfer?.files[0])
}

function onInputChange(event: Event) {
  handleFile((event.target as HTMLInputElement).files?.[0])
}

function clearImage() {
  emit('update:modelValue', '')
  error.value = ''
}
</script>

<template>
  <div>
    <span class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">{{ label }}</span>
    <div
      class="flex items-center gap-3 rounded-md border border-dashed px-3 py-3 text-sm transition"
      :class="isDragging ? 'border-accent bg-accent-soft/40' : 'border-hairline-strong'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <img v-if="props.modelValue" :src="props.modelValue" :alt="label" class="h-12 w-12 rounded object-contain ring-1 ring-hairline" />
      <div class="flex-1">
        <label class="cursor-pointer text-accent hover:text-accent-dark">
          <span>Choisir un fichier</span>
          <input type="file" accept="image/*" class="hidden" @change="onInputChange" />
        </label>
        <span class="text-muted"> ou glisser-déposer une image</span>
      </div>
      <button v-if="props.modelValue" type="button" class="text-sm text-muted hover:text-accent-dark" @click="clearImage">
        Retirer
      </button>
    </div>
    <p v-if="error" class="mt-1 text-sm text-accent-dark">{{ error }}</p>
  </div>
</template>
