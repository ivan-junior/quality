import { Badge } from '@/components/ui/badge'
import { QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '@/lib/constants'
import type { Quote } from '@/types'
import { getEffectiveQuoteStatus } from '@/services/quoteService'
import { cn } from '@/lib/utils'

export function QuoteStatusBadge({ quote }: { quote: Quote }) {
  const status = getEffectiveQuoteStatus(quote)
  return (
    <Badge className={cn('border font-medium', QUOTE_STATUS_COLORS[status])}>
      {QUOTE_STATUS_LABELS[status]}
    </Badge>
  )
}
