import { STOCK_STATUS_COLORS, STOCK_STATUS_LABELS } from '@/lib/constants'
import type { StockStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <Badge className={cn('border font-medium', STOCK_STATUS_COLORS[status])}>
      {STOCK_STATUS_LABELS[status]}
    </Badge>
  )
}
