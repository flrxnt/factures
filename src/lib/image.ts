const MAX_LOGO_WIDTH = 400

/** Downscales an uploaded image to a max width and re-encodes it as a
 * compressed JPEG data URL, so it stays cheap to store in localStorage and
 * is directly consumable by both <img src> and jsPDF's doc.addImage(). */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const original = await loadImage(file)
  const scale = Math.min(1, MAX_LOGO_WIDTH / original.width)
  const width = Math.round(original.width * scale)
  const height = Math.round(original.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(original, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.85)
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossible de charger l\'image'))
    }
    img.src = url
  })
}
