import type { SearchResultGroup } from '@/types'
import { normalizeSearch } from '@/utils/format'
import { customerService } from './customerService'
import { serviceOrderService } from './serviceOrderService'
import { vehicleService } from './vehicleService'

export const searchService = {
  search(query: string): SearchResultGroup {
    const q = normalizeSearch(query)
    if (!q) {
      return { customers: [], vehicles: [], orders: [] }
    }

    const customers = customerService.search(query).slice(0, 8)
    const vehicles = vehicleService
      .search(query)
      .slice(0, 8)
      .map((v) => ({
        ...v,
        customerName: customerService.getById(v.customerId)?.name ?? '—',
      }))

    const orders = serviceOrderService
      .search(query)
      .slice(0, 8)
      .map((o) => {
        const customer = customerService.getById(o.customerId)
        const vehicle = vehicleService.getById(o.vehicleId)
        return {
          ...o,
          customerName: customer?.name ?? '—',
          vehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
          plate: vehicle?.plate ?? '—',
        }
      })

    return { customers, vehicles, orders }
  },
}
