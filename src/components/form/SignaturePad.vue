<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const CSS_WIDTH = 320
const CSS_HEIGHT = 120

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let hasStroke = false
let lastX = 0
let lastY = 0
let lastEmitted = ''

/** White (not transparent) background, exported as JPEG below — matches the
 * logo upload path (lib/image.ts) and avoids jsPDF embedding an
 * uncompressed raw RGBA bitmap for a transparent PNG (an otherwise tiny
 * signature stroke can balloon the PDF to hundreds of KB). */
function fillBackground() {
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CSS_WIDTH, CSS_HEIGHT)
}

function setupCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = CSS_WIDTH * dpr
  canvas.height = CSS_HEIGHT * dpr
  canvas.style.width = `${CSS_WIDTH}px`
  canvas.style.height = `${CSS_HEIGHT}px`
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#1c1a14'
  fillBackground()
  if (props.modelValue) {
    drawExisting(props.modelValue)
    lastEmitted = props.modelValue
  }
}

function drawExisting(dataUrl: string) {
  const img = new Image()
  img.onload = () => {
    if (!ctx) return
    const scale = Math.min(CSS_WIDTH / img.width, CSS_HEIGHT / img.height, 1)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, (CSS_WIDTH - w) / 2, (CSS_HEIGHT - h) / 2, w, h)
    hasStroke = true
  }
  img.src = dataUrl
}

function getPos(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function onPointerDown(event: PointerEvent) {
  if (!ctx) return
  drawing = true
  const { x, y } = getPos(event)
  lastX = x
  lastY = y
  canvasRef.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!drawing || !ctx) return
  const { x, y } = getPos(event)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
  hasStroke = true
}

function onPointerUp() {
  if (!drawing) return
  drawing = false
  if (hasStroke) {
    lastEmitted = canvasRef.value?.toDataURL('image/jpeg', 0.92) ?? ''
    emit('update:modelValue', lastEmitted)
  }
}

function clear() {
  if (!ctx) return
  fillBackground()
  hasStroke = false
  lastEmitted = ''
  emit('update:modelValue', '')
}

onMounted(setupCanvas)

// Keep the canvas in sync with genuinely external changes (switching to the
// upload tab and back, loading a different invoice) — but skip the redraw
// when this is just our own emitted value echoing back down as a prop.
watch(
  () => props.modelValue,
  (value) => {
    if (!ctx || value === lastEmitted) return
    fillBackground()
    hasStroke = false
    if (value) drawExisting(value)
  },
)
</script>

<template>
  <div>
    <canvas
      ref="canvasRef"
      class="touch-none rounded-md border border-hairline-strong bg-surface"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    ></canvas>
    <button type="button" class="mt-1.5 text-sm text-muted hover:text-accent-dark" @click="clear">Effacer</button>
  </div>
</template>
