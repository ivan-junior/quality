import { seedCustomers } from './customers'
import { seedVehicles } from './vehicles'
import { seedProducts } from './products'
import { seedServices } from './services'
import { seedOrders, seedStockMovements } from './orders'
import {
  STORAGE_KEYS,
  clearAllStorage,
  getItem,
  isStorageInitialized,
  setItem,
} from '@/storage/localStorageRepository'
import type {
  Customer,
  Product,
  Service,
  ServiceOrder,
  StockMovement,
  Vehicle,
} from '@/types'

export function seedDatabase(): void {
  setItem(STORAGE_KEYS.customers, structuredClone(seedCustomers))
  setItem(STORAGE_KEYS.vehicles, structuredClone(seedVehicles))
  setItem(STORAGE_KEYS.products, structuredClone(seedProducts))
  setItem(STORAGE_KEYS.services, structuredClone(seedServices))
  setItem(STORAGE_KEYS.orders, structuredClone(seedOrders))
  setItem(STORAGE_KEYS.stockMovements, structuredClone(seedStockMovements))
  setItem(STORAGE_KEYS.meta, {
    version: 1,
    seededAt: new Date().toISOString(),
  })
}

export function ensureDatabase(): void {
  if (!isStorageInitialized()) {
    seedDatabase()
  }
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

export function getStockMovements(): StockMovement[] {
  ensureDatabase()
  return getItem<StockMovement[]>(STORAGE_KEYS.stockMovements, [])
}

export {
  seedCustomers,
  seedVehicles,
  seedProducts,
  seedServices,
  seedOrders,
  seedStockMovements,
}
