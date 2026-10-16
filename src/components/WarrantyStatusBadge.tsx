import { Badge } from '@/components/ui/badge'
import { WARRANTY_STATUS_COLORS, WARRANTY_STATUS_LABELS } from '@/lib/constants'
import type { ServiceOrderItem } from '@/types'
import { getWarrantyStatus } from '@/utils/warranty'
import { cn } from '@/lib/utils'

export function WarrantyStatusBadge({ item }: { item: ServiceOrderItem }) {
  const status = getWarrantyStatus(item)
  return (
    <Badge className={cn('border font-medium', WARRANTY_STATUS_COLORS[status])}>
      {WARRANTY_STATUS_LABELS[status]}
    </Badge>
  )
}
