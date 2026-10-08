import { getOrders } from '@/mocks'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type {
  ServiceOrder,
  ServiceOrderItem,
  ServiceOrderStatus,
  StatusHistoryEntry,
} from '@/types'
import { calcOrderTotals, generateId, normalizeSearch, nowISO, todayISODate } from '@/utils/format'
import { customerService } from './customerService'
import { stockService } from './stockService'
import { vehicleService } from './vehicleService'

function save(orders: ServiceOrder[]) {
  setItem(STORAGE_KEYS.orders, orders)
}

function nextOrderNumber(): string {
  const orders = getOrders()
  const max = orders.reduce((acc, order) => {
    const n = Number.parseInt(order.number, 10)
    return Number.isFinite(n) ? Math.max(acc, n) : acc
  }, 0)
  return String(max + 1).padStart(5, '0')
}

function withTotals(
  order: ServiceOrder,
  items: ServiceOrderItem[],
  discount = order.discount,
): ServiceOrder {
  const totals = calcOrderTotals(items, discount)
  return { ...order, items, ...totals, updatedAt: nowISO() }
}

function shouldDeductStock(status: ServiceOrderStatus): boolean {
  return status === 'FINISHED' || status === 'DELIVERED'
}

function deductStockIfNeeded(order: ServiceOrder): ServiceOrder {
  if (order.stockDeducted || !shouldDeductStock(order.status)) return order

  for (const item of order.items) {
    if (item.type !== 'PRODUCT') continue
    stockService.register({
      productId: item.referenceId,
      type: 'OUT',
      quantity: item.quantity,
      reason: `Baixa por OS #${order.number}`,
      notes: item.description,
      serviceOrderId: order.id,
    })
  }

  return { ...order, stockDeducted: true, updatedAt: nowISO() }
}

export const serviceOrderService = {
  list(): ServiceOrder[] {
    return getOrders().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  getById(id: string): ServiceOrder | undefined {
    return getOrders().find((o) => o.id === id)
  },

  getByVehicle(vehicleId: string): ServiceOrder[] {
    return this.list().filter((o) => o.vehicleId === vehicleId)
  },

  getByCustomer(customerId: string): ServiceOrder[] {
    return this.list().filter((o) => o.customerId === customerId)
  },

  search(query: string): ServiceOrder[] {
    const q = normalizeSearch(query)
    if (!q) return this.list()
    return this.list().filter((order) => {
      const customer = customerService.getById(order.customerId)
      const vehicle = vehicleService.getById(order.vehicleId)
      const hay = normalizeSearch(
        `${order.number} ${customer?.name ?? ''} ${vehicle?.plate ?? ''} ${vehicle?.brand ?? ''} ${vehicle?.model ?? ''}`,
      )
      return hay.includes(q)
    })
  },

  filterByStatus(status: ServiceOrderStatus | 'ALL'): ServiceOrder[] {
    if (status === 'ALL') return this.list()
    return this.list().filter((o) => o.status === status)
  },

  create(input: {
    customerId: string
    vehicleId: string
    entryDate?: string
    deliveryForecast?: string | null
    currentKm?: number | null
    customerRequest?: string
    internalNotes?: string
    items?: ServiceOrderItem[]
    discount?: number
    status?: ServiceOrderStatus
  }): ServiceOrder {
    const orders = getOrders()
    const items = input.items ?? []
    const totals = calcOrderTotals(items, input.discount ?? 0)
    const status = input.status ?? 'OPEN'
    const history: StatusHistoryEntry[] = [
      { id: generateId('osh'), status, changedAt: nowISO() },
    ]

    let order: ServiceOrder = {
      id: generateId('os'),
      number: nextOrderNumber(),
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      status,
      entryDate: input.entryDate ?? todayISODate(),
      deliveryForecast: input.deliveryForecast ?? null,
      currentKm: input.currentKm ?? null,
      customerRequest: input.customerRequest ?? '',
      internalNotes: input.internalNotes ?? '',
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      statusHistory: history,
      stockDeducted: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }

    order = deductStockIfNeeded(order)
    customerService.touchLastService(order.customerId, order.updatedAt)
    orders.push(order)
    save(orders)
    return order
  },

  update(id: string, data: Partial<ServiceOrder>): ServiceOrder | undefined {
    const orders = getOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index < 0) return undefined

    let order = { ...orders[index], ...data, id }
    if (data.items) {
      order = withTotals(order, data.items, data.discount ?? order.discount)
    } else if (data.discount !== undefined) {
      order = withTotals(order, order.items, data.discount)
    }

    order = deductStockIfNeeded(order)
    orders[index] = { ...order, updatedAt: nowISO() }
    save(orders)
    return orders[index]
  },

  updateStatus(id: string, status: ServiceOrderStatus, note?: string): ServiceOrder | undefined {
    const order = this.getById(id)
    if (!order) return undefined

    const entry: StatusHistoryEntry = {
      id: generateId('osh'),
      status,
      changedAt: nowISO(),
      note,
    }

    return this.update(id, {
      status,
      statusHistory: [...order.statusHistory, entry],
    })
  },

  remove(id: string): boolean {
    const orders = getOrders()
    const next = orders.filter((o) => o.id !== id)
    if (next.length === orders.length) return false
    save(next)
    return true
  },

  getDashboardStats() {
    const orders = this.list()
    const today = todayISODate()
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const open = orders.filter((o) => o.status === 'OPEN').length
    const inProgress = orders.filter((o) => o.status === 'IN_PROGRESS').length
    const finishedToday = orders.filter(
      (o) =>
        (o.status === 'FINISHED' || o.status === 'DELIVERED') &&
        o.statusHistory.some(
          (h) =>
            (h.status === 'FINISHED' || h.status === 'DELIVERED') &&
            h.changedAt.startsWith(today),
        ),
    ).length

    const monthRevenue = orders
      .filter((o) => {
        if (o.status === 'CANCELLED') return false
        if (o.status !== 'FINISHED' && o.status !== 'DELIVERED') return false
        const d = new Date(o.updatedAt)
        return d.getMonth() === month && d.getFullYear() === year
      })
      .reduce((sum, o) => sum + o.total, 0)

    const byStatus = {
      OPEN: orders.filter((o) => o.status === 'OPEN').length,
      IN_PROGRESS: orders.filter((o) => o.status === 'IN_PROGRESS').length,
      WAITING_PART: orders.filter((o) => o.status === 'WAITING_PART').length,
      FINISHED: orders.filter((o) => o.status === 'FINISHED').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    }

    return { open, inProgress, finishedToday, monthRevenue, byStatus, recent: orders.slice(0, 8) }
  },
}
