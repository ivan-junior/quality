import { getCustomers } from '@/mocks'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type { Customer } from '@/types'
import { generateId, normalizeSearch, nowISO } from '@/utils/format'

function save(customers: Customer[]) {
  setItem(STORAGE_KEYS.customers, customers)
}

export const customerService = {
  list(): Customer[] {
    return getCustomers().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  },

  getById(id: string): Customer | undefined {
    return getCustomers().find((c) => c.id === id)
  },

  search(query: string): Customer[] {
    const q = normalizeSearch(query)
    if (!q) return this.list()
    return this.list().filter((c) => {
      const hay = normalizeSearch(
        `${c.name} ${c.document} ${c.phone} ${c.whatsapp} ${c.email}`,
      )
      return hay.includes(q) || normalizeSearch(c.document.replace(/\D/g, '')).includes(q.replace(/\D/g, ''))
    })
  },

  create(data: Omit<Customer, 'id' | 'createdAt' | 'lastServiceAt'>): Customer {
    const customers = getCustomers()
    const customer: Customer = {
      ...data,
      id: generateId('cust'),
      createdAt: nowISO(),
      lastServiceAt: null,
    }
    customers.push(customer)
    save(customers)
    return customer
  },

  update(id: string, data: Partial<Customer>): Customer | undefined {
    const customers = getCustomers()
    const index = customers.findIndex((c) => c.id === id)
    if (index < 0) return undefined
    customers[index] = { ...customers[index], ...data, id }
    save(customers)
    return customers[index]
  },

  remove(id: string): boolean {
    const customers = getCustomers()
    const next = customers.filter((c) => c.id !== id)
    if (next.length === customers.length) return false
    save(next)
    return true
  },

  touchLastService(id: string, date: string): void {
    this.update(id, { lastServiceAt: date })
  },
}
