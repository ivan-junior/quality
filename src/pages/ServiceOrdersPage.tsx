import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STATUS_LABELS } from '@/lib/constants'
import { customerService, serviceOrderService, vehicleService } from '@/services'
import type { ServiceOrderStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'

type Filter = 'ALL' | ServiceOrderStatus

const filters: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  ...(Object.keys(STATUS_LABELS) as ServiceOrderStatus[]).map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
]

export function ServiceOrdersPage() {
  const [status, setStatus] = useState<Filter>('ALL')
  const [query, setQuery] = useState('')

  const orders = useMemo(() => {
    const base =
      status === 'ALL'
        ? serviceOrderService.list()
        : serviceOrderService.filterByStatus(status)
    if (!query.trim()) return base
    return serviceOrderService.search(query).filter((o) =>
      status === 'ALL' ? true : o.status === status,
    )
  }, [status, query])

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Acompanhe e gerencie os atendimentos da oficina"
        actions={
          <Button asChild>
            <Link to="/ordens/nova">
              <Plus className="h-4 w-4" />
              Nova Ordem de Serviço
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as Filter)}>
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
            placeholder="Buscar por número, cliente ou placa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma ordem encontrada"
          description="Crie uma nova OS ou ajuste os filtros."
          actionLabel="Nova OS"
          onAction={() => {
            window.location.href = '/ordens/nova'
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº OS</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Veículo</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const customer = customerService.getById(order.customerId)
                const vehicle = vehicleService.getById(order.vehicleId)
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.number}</TableCell>
                    <TableCell>{formatDate(order.entryDate)}</TableCell>
                    <TableCell>{customer?.name ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-graphite px-1.5 py-0.5 font-mono text-xs text-white">
                        {vehicle?.plate ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/ordens/${order.id}`}>Abrir</Link>
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
