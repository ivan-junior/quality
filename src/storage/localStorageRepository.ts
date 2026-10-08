const PREFIX = 'quality.v1'

export const STORAGE_KEYS = {
  customers: `${PREFIX}.customers`,
  vehicles: `${PREFIX}.vehicles`,
  products: `${PREFIX}.products`,
  services: `${PREFIX}.services`,
  orders: `${PREFIX}.orders`,
  stockMovements: `${PREFIX}.stockMovements`,
  meta: `${PREFIX}.meta`,
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export function getItem<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem<T>(key: StorageKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key: StorageKey): void {
  localStorage.removeItem(key)
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}

export function isStorageInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.meta) !== null
}
