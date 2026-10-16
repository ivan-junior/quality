import type { ServiceOrderItem, WarrantyStatus, WarrantyUnit } from '@/types'
import { todayISODate } from '@/utils/format'

export function calcWarrantyEndDate(
  startDate: string,
  duration: number,
  unit: WarrantyUnit,
): string {
  const date = new Date(`${startDate}T12:00:00`)
  if (Number.isNaN(date.getTime()) || !Number.isFinite(duration) || duration <= 0) {
    return startDate
  }
  if (unit === 'DAYS') {
    date.setDate(date.getDate() + duration)
  } else {
    date.setMonth(date.getMonth() + duration)
  }
  return date.toISOString().slice(0, 10)
}

export function hasWarrantyInfo(item: Pick<
  ServiceOrderItem,
  'warrantyDuration' | 'warrantyUnit' | 'warrantyStartDate' | 'warrantyEndDate'
>): boolean {
  return (
    item.warrantyDuration != null &&
    item.warrantyDuration > 0 &&
    !!item.warrantyUnit &&
    !!item.warrantyStartDate &&
    !!item.warrantyEndDate
  )
}

export function getWarrantyStatus(
  item: Pick<
    ServiceOrderItem,
    'warrantyDuration' | 'warrantyUnit' | 'warrantyStartDate' | 'warrantyEndDate'
  >,
  today = todayISODate(),
): WarrantyStatus {
  if (!hasWarrantyInfo(item)) return 'NOT_INFORMED'
  const start = item.warrantyStartDate!
  const end = item.warrantyEndDate!
  if (today < start) return 'NOT_STARTED'
  if (today > end) return 'EXPIRED'
  return 'ACTIVE'
}

export function formatWarrantyDuration(duration: number, unit: WarrantyUnit): string {
  if (unit === 'DAYS') {
    return duration === 1 ? '1 dia' : `${duration} dias`
  }
  return duration === 1 ? '1 mês' : `${duration} meses`
}

export function applyWarrantyFields(
  item: ServiceOrderItem,
  warranty?: {
    duration?: number | null
    unit?: WarrantyUnit | null
    startDate?: string | null
  },
): ServiceOrderItem {
  const duration = warranty?.duration
  const unit = warranty?.unit
  const startDate = warranty?.startDate

  if (
    duration == null ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    !unit ||
    !startDate
  ) {
    const { warrantyDuration: _d, warrantyUnit: _u, warrantyStartDate: _s, warrantyEndDate: _e, ...rest } =
      item
    return rest
  }

  return {
    ...item,
    warrantyDuration: duration,
    warrantyUnit: unit,
    warrantyStartDate: startDate,
    warrantyEndDate: calcWarrantyEndDate(startDate, duration, unit),
  }
}
