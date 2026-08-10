/** Thin localStorage wrapper: JSON (de)serialization + guards against quota
 * errors or unavailable storage (private browsing) in one place. */

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`storage.getItem failed for "${key}"`, error)
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`storage.setItem failed for "${key}"`, error)
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`storage.removeItem failed for "${key}"`, error)
  }
}
