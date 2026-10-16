import { DEFAULT_COMPANY_SETTINGS } from '@/lib/constants'
import { seedQuotes } from '@/mocks/quotes'
import {
  STORAGE_KEYS,
  getItem,
  setItem,
} from '@/storage/localStorageRepository'
import type { CompanySettings, Quote } from '@/types'

interface StorageMeta {
  version: number
  seededAt: string
}

const CURRENT_VERSION = 2

export function migrateIfNeeded(): void {
  const meta = getItem<StorageMeta | null>(STORAGE_KEYS.meta, null)
  if (!meta) return

  const version = meta.version ?? 1

  if (!localStorage.getItem(STORAGE_KEYS.quotes)) {
    setItem(STORAGE_KEYS.quotes, structuredClone(seedQuotes))
  }

  if (!localStorage.getItem(STORAGE_KEYS.companySettings)) {
    setItem(STORAGE_KEYS.companySettings, { ...DEFAULT_COMPANY_SETTINGS })
  }

  if (version < CURRENT_VERSION) {
    setItem(STORAGE_KEYS.meta, {
      ...meta,
      version: CURRENT_VERSION,
    })
  }
}

export function getDefaultCompanySettings(): CompanySettings {
  return { ...DEFAULT_COMPANY_SETTINGS }
}

export function ensureQuotesSeeded(): Quote[] {
  if (!localStorage.getItem(STORAGE_KEYS.quotes)) {
    setItem(STORAGE_KEYS.quotes, structuredClone(seedQuotes))
  }
  return getItem<Quote[]>(STORAGE_KEYS.quotes, [])
}
