import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import type { ServiceOrderStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <Badge className={cn('border font-medium', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
