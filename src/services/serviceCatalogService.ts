import { getServices } from '@/mocks'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type { Service } from '@/types'
import { generateId, normalizeSearch } from '@/utils/format'

function save(services: Service[]) {
  setItem(STORAGE_KEYS.services, services)
}

export const serviceCatalogService = {
  list(): Service[] {
    return getServices().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  },

  getById(id: string): Service | undefined {
    return getServices().find((s) => s.id === id)
  },

  search(query: string): Service[] {
    const q = normalizeSearch(query)
    if (!q) return this.list()
    return this.list().filter((s) => {
      const hay = normalizeSearch(`${s.name} ${s.category} ${s.description}`)
      return hay.includes(q)
    })
  },

  create(data: Omit<Service, 'id'>): Service {
    const services = getServices()
    const service: Service = { ...data, id: generateId('svc') }
    services.push(service)
    save(services)
    return service
  },

  update(id: string, data: Partial<Service>): Service | undefined {
    const services = getServices()
    const index = services.findIndex((s) => s.id === id)
    if (index < 0) return undefined
    services[index] = { ...services[index], ...data, id }
    save(services)
    return services[index]
  },

  remove(id: string): boolean {
    const services = getServices()
    const next = services.filter((s) => s.id !== id)
    if (next.length === services.length) return false
    save(next)
    return true
  },
}
