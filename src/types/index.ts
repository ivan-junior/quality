export type ServiceOrderStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_PART'
  | 'FINISHED'
  | 'DELIVERED'
  | 'CANCELLED'

export type ItemType = 'PRODUCT' | 'SERVICE'

export type StockMovementType = 'IN' | 'OUT' | 'ADJUST'

export type StockStatus = 'NORMAL' | 'LOW' | 'OUT'

export interface Customer {
  id: string
  name: string
  document: string
  phone: string
  whatsapp: string
  email: string
  notes: string
  createdAt: string
  lastServiceAt: string | null
}

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number | null
  color: string
  customerId: string
  notes: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  sku: string
  brand: string
  costPrice: number
  salePrice: number
  stock: number
  minStock: number
}

export interface Service {
  id: string
  name: string
  category: string
  defaultPrice: number
  estimatedMinutes: number
  description: string
}

export interface ServiceOrderItem {
  id: string
  type: ItemType
  referenceId: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface StatusHistoryEntry {
  id: string
  status: ServiceOrderStatus
  changedAt: string
  note?: string
}

export interface ServiceOrder {
  id: string
  number: string
  customerId: string
  vehicleId: string
  status: ServiceOrderStatus
  entryDate: string
  deliveryForecast: string | null
  currentKm: number | null
  customerRequest: string
  internalNotes: string
  items: ServiceOrderItem[]
  subtotal: number
  discount: number
  total: number
  statusHistory: StatusHistoryEntry[]
  stockDeducted: boolean
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  productId: string
  type: StockMovementType
  quantity: number
  reason: string
  notes: string
  serviceOrderId?: string
  createdAt: string
}

export interface SearchResultGroup {
  customers: Customer[]
  vehicles: Array<Vehicle & { customerName: string }>
  orders: Array<
    ServiceOrder & {
      customerName: string
      vehicleLabel: string
      plate: string
    }
  >
}
