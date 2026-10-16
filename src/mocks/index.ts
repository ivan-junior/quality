import { seedCustomers } from './customers'
import { seedVehicles } from './vehicles'
import { seedProducts } from './products'
import { seedServices } from './services'
import { seedOrders, seedStockMovements } from './orders'
import { seedQuotes } from './quotes'
import { DEFAULT_COMPANY_SETTINGS } from '@/lib/constants'
import { migrateIfNeeded } from '@/storage/migrate'
import {
  STORAGE_KEYS,
  clearAllStorage,
  getItem,
  isStorageInitialized,
  setItem,
} from '@/storage/localStorageRepository'
import type {
  CompanySettings,
  Customer,
  Product,
  Quote,
  Service,
  ServiceOrder,
  StockMovement,
  Vehicle,
} from '@/types'

const CURRENT_META_VERSION = 2

export function seedDatabase(): void {
  setItem(STORAGE_KEYS.customers, structuredClone(seedCustomers))
  setItem(STORAGE_KEYS.vehicles, structuredClone(seedVehicles))
  setItem(STORAGE_KEYS.products, structuredClone(seedProducts))
  setItem(STORAGE_KEYS.services, structuredClone(seedServices))
  setItem(STORAGE_KEYS.orders, structuredClone(seedOrders))
  setItem(STORAGE_KEYS.quotes, structuredClone(seedQuotes))
  setItem(STORAGE_KEYS.stockMovements, structuredClone(seedStockMovements))
  setItem(STORAGE_KEYS.companySettings, { ...DEFAULT_COMPANY_SETTINGS })
  setItem(STORAGE_KEYS.meta, {
    version: CURRENT_META_VERSION,
    seededAt: new Date().toISOString(),
  })
}

export function ensureDatabase(): void {
  if (!isStorageInitialized()) {
    seedDatabase()
    return
  }
  migrateIfNeeded()
}

export function resetDemoData(): void {
  clearAllStorage()
  seedDatabase()
}

export function getCustomers(): Customer[] {
  ensureDatabase()
  return getItem<Customer[]>(STORAGE_KEYS.customers, [])
}

export function getVehicles(): Vehicle[] {
  ensureDatabase()
  return getItem<Vehicle[]>(STORAGE_KEYS.vehicles, [])
}

export function getProducts(): Product[] {
  ensureDatabase()
  return getItem<Product[]>(STORAGE_KEYS.products, [])
}

export function getServices(): Service[] {
  ensureDatabase()
  return getItem<Service[]>(STORAGE_KEYS.services, [])
}

export function getOrders(): ServiceOrder[] {
  ensureDatabase()
  return getItem<ServiceOrder[]>(STORAGE_KEYS.orders, [])
}

export function getQuotes(): Quote[] {
  ensureDatabase()
  return getItem<Quote[]>(STORAGE_KEYS.quotes, [])
}

export function getStockMovements(): StockMovement[] {
  ensureDatabase()
  return getItem<StockMovement[]>(STORAGE_KEYS.stockMovements, [])
}

export function getCompanySettings(): CompanySettings {
  ensureDatabase()
  return getItem<CompanySettings>(STORAGE_KEYS.companySettings, {
    ...DEFAULT_COMPANY_SETTINGS,
  })
}

export {
  seedCustomers,
  seedVehicles,
  seedProducts,
  seedServices,
  seedOrders,
  seedQuotes,
  seedStockMovements,
}
