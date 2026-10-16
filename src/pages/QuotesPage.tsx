import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { QUOTE_STATUS_LABELS } from '@/lib/constants'
import { customerService, quoteService, vehicleService } from '@/services'
import type { QuoteFilterStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { isQuoteExpired } from '@/services/quoteService'

const filters: { value: QuoteFilterStatus; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: QUOTE_STATUS_LABELS.DRAFT },
  { value: 'SENT', label: QUOTE_STATUS_LABELS.SENT },
  { value: 'APPROVED', label: QUOTE_STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: QUOTE_STATUS_LABELS.REJECTED },
  { value: 'EXPIRED', label: QUOTE_STATUS_LABELS.EXPIRED },
  { value: 'CONVERTED', label: QUOTE_STATUS_LABELS.CONVERTED },
]

export function QuotesPage() {
  const [status, setStatus] = useState<QuoteFilterStatus>('ALL')
  const [query, setQuery] = useState('')

  const quotes = useMemo(() => {
    const base = quoteService.filterByStatus(status)
    if (!query.trim()) return base
    const searched = quoteService.search(query)
    if (status === 'ALL') return searched
    if (status === 'EXPIRED') return searched.filter((q) => isQuoteExpired(q))
    return searched.filter((q) => !isQuoteExpired(q) && q.status === status)
  }, [status, query])

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        description="Elabore propostas, envie ao cliente e converta em OS"
        actions={
          <Button asChild>
            <Link to="/orcamentos/novo">
              <Plus className="h-4 w-4" />
              Novo orçamento
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as QuoteFilterStatus)}>
          <TabsList className="h-auto flex-wrap">
            {filters.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="text-xs sm:text-sm">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por número, cliente, telefone ou placa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento encontrado"
          description="Crie um novo orçamento ou ajuste os filtros."
          actionLabel="Novo orçamento"
          onAction={() => {
            window.location.href = '/orcamentos/novo'
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Veículo</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Validade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const customer = customerService.getById(quote.customerId)
                const vehicle = vehicleService.getById(quote.vehicleId)
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">#{quote.number}</TableCell>
                    <TableCell>{formatDate(quote.issueDate)}</TableCell>
                    <TableCell>{customer?.name ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-graphite px-1.5 py-0.5 font-mono text-xs text-white">
                        {vehicle?.plate ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(quote.total)}</TableCell>
                    <TableCell>
                      <QuoteStatusBadge quote={quote} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(quote.validUntil)}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/orcamentos/${quote.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
