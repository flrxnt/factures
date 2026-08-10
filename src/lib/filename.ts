/** Strips characters that are unsafe/reserved on common filesystems
 * (Windows in particular: \ / : * ? " < > |), collapses whitespace, and caps
 * length — used to turn a free-text invoice name into a safe download filename. */
export function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
  return cleaned || fallback
}
