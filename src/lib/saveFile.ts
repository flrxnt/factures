import { isTauri } from '@tauri-apps/api/core'

export type SaveResult = 'saved' | 'cancelled'

function splitFilename(filename: string): { base: string; ext: string } {
  const dot = filename.lastIndexOf('.')
  if (dot <= 0) return { base: filename, ext: '' }
  return { base: filename.slice(0, dot), ext: filename.slice(dot + 1) }
}

// jsPDF/JSON/CSV exports used to rely on a Blob + `<a download>` click, which
// browsers handle natively but Tauri's WKWebView doesn't act on — it needs
// the native save dialog + filesystem plugins instead.
async function saveViaTauri(data: Uint8Array | string, filename: string): Promise<SaveResult> {
  const { save } = await import('@tauri-apps/plugin-dialog')
  const { writeFile, writeTextFile } = await import('@tauri-apps/plugin-fs')
  const { ext } = splitFilename(filename)

  const path = await save({
    defaultPath: filename,
    filters: ext ? [{ name: ext.toUpperCase(), extensions: [ext] }] : undefined,
  })
  if (!path) return 'cancelled'

  if (typeof data === 'string') {
    await writeTextFile(path, data)
  } else {
    await writeFile(path, data)
  }
  return 'saved'
}

async function saveViaBrowser(data: Uint8Array | string, filename: string, mimeType: string): Promise<SaveResult> {
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : new Blob([data.slice()], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
  return 'saved'
}

export async function saveFile(data: Uint8Array | string, filename: string, mimeType: string): Promise<SaveResult> {
  return isTauri() ? saveViaTauri(data, filename) : saveViaBrowser(data, filename, mimeType)
}
