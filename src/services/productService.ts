import { getProducts } from '@/mocks'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type { Product, StockStatus } from '@/types'
import { generateId, normalizeSearch } from '@/utils/format'

function save(products: Product[]) {
  setItem(STORAGE_KEYS.products, products)
}

export function getStockStatus(product: Product): StockStatus {
  if (product.stock <= 0) return 'OUT'
  if (product.stock <= product.minStock) return 'LOW'
  return 'NORMAL'
}

export const productService = {
  list(): Product[] {
    return getProducts().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  },

  getById(id: string): Product | undefined {
    return getProducts().find((p) => p.id === id)
  },

  search(query: string): Product[] {
    const q = normalizeSearch(query)
    if (!q) return this.list()
    return this.list().filter((p) => {
      const hay = normalizeSearch(`${p.name} ${p.sku} ${p.brand} ${p.category}`)
      return hay.includes(q)
    })
  },

  getLowStock(): Product[] {
    return this.list().filter((p) => getStockStatus(p) !== 'NORMAL')
  },

  create(data: Omit<Product, 'id'>): Product {
    const products = getProducts()
    const product: Product = { ...data, id: generateId('prod') }
    products.push(product)
    save(products)
    return product
  },

  update(id: string, data: Partial<Product>): Product | undefined {
    const products = getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index < 0) return undefined
    products[index] = { ...products[index], ...data, id }
    save(products)
    return products[index]
  },

  adjustStock(id: string, delta: number): Product | undefined {
    const product = this.getById(id)
    if (!product) return undefined
    return this.update(id, { stock: Math.max(0, product.stock + delta) })
  },

  setStock(id: string, stock: number): Product | undefined {
    return this.update(id, { stock: Math.max(0, stock) })
  },

  remove(id: string): boolean {
    const products = getProducts()
    const next = products.filter((p) => p.id !== id)
    if (next.length === products.length) return false
    save(next)
    return true
  },
}
