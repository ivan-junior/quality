import { getStockMovements } from '@/mocks'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type { StockMovement, StockMovementType } from '@/types'
import { generateId, nowISO } from '@/utils/format'
import { productService } from './productService'

function save(movements: StockMovement[]) {
  setItem(STORAGE_KEYS.stockMovements, movements)
}

export const stockService = {
  listMovements(): StockMovement[] {
    return getStockMovements().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  register(input: {
    productId: string
    type: StockMovementType
    quantity: number
    reason: string
    notes?: string
    serviceOrderId?: string
  }): StockMovement {
    const movements = getStockMovements()
    const quantity = Math.abs(input.quantity)

    if (input.type === 'IN') {
      productService.adjustStock(input.productId, quantity)
    } else if (input.type === 'OUT') {
      productService.adjustStock(input.productId, -quantity)
    } else {
      productService.setStock(input.productId, quantity)
    }

    const movement: StockMovement = {
      id: generateId('mov'),
      productId: input.productId,
      type: input.type,
      quantity,
      reason: input.reason,
      notes: input.notes ?? '',
      serviceOrderId: input.serviceOrderId,
      createdAt: nowISO(),
    }
    movements.push(movement)
    save(movements)
    return movement
  },
}
