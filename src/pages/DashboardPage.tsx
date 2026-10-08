import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { StockBadge } from '@/components/StockBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { STATUS_LABELS } from '@/lib/constants'
import { customerService, getStockStatus, productService, serviceOrderService, vehicleService } from '@/services'
import { formatCurrency, formatDate } from '@/utils/format'
import type { ServiceOrderStatus } from '@/types'

export function DashboardPage() {
  const stats = serviceOrderService.getDashboardStats()
  const lowStock = productService.getLowStock().slice(0, 6)
  const maxStatus = Math.max(...Object.values(stats.byStatus), 1)

  const cards = [
    {
      label: 'Ordens abertas',
      value: String(stats.open),
      icon: ClipboardList,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Em andamento',
      value: String(stats.inProgress),
      icon: Loader2,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Finalizadas hoje',
      value: String(stats.finishedToday),
      icon: CheckCircle2,
      tone: 'bg-primary-light text-primary-dark',
    },
    {
      label: 'Faturamento do mês',
      value: formatCurrency(stats.monthRevenue),
      icon: DollarSign,
      tone: 'bg-emerald-50 text-emerald-700',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da oficina Quality Sound & Film"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Ordens de serviço recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Veículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead className="hidden lg:table-cell">Serviço</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent.map((order) => {
                  const customer = customerService.getById(order.customerId)
                  const vehicle = vehicleService.getById(order.vehicleId)
                  const mainItem = order.items[0]?.description ?? '—'
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link className="font-medium text-primary hover:underline" to={`/ordens/${order.id}`}>
                          #{order.number}
                        </Link>
                      </TableCell>
                      <TableCell>{customer?.name ?? '—'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                      </TableCell>
                      <TableCell>
                        <span className="rounded bg-graphite px-1.5 py-0.5 font-mono text-xs text-white">
                          {vehicle?.plate ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-[180px] truncate lg:table-cell">{mainItem}</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(order.entryDate)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Estoque baixo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto em alerta.</p>
              ) : (
                lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Atual: {product.stock} · Mín: {product.minStock}
                      </p>
                    </div>
                    <StockBadge status={getStockStatus(product)} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OS por status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(STATUS_LABELS) as ServiceOrderStatus[]).map((status) => {
                const count = stats.byStatus[status]
                const width = `${Math.max(8, (count / maxStatus) * 100)}%`
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{STATUS_LABELS[status]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
