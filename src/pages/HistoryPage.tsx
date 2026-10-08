import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Search } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { customerService, serviceOrderService, vehicleService } from '@/services'
import { formatCurrency, formatDate, formatPlate, normalizeSearch } from '@/utils/format'

export function HistoryPage() {
  const [query, setQuery] = useState('')

  const result = useMemo(() => {
    const q = normalizeSearch(query)
    if (!q) return null

    const byPlate = vehicleService.getByPlate(formatPlate(query))
    const vehicles = byPlate ? [byPlate] : vehicleService.search(query).slice(0, 5)
    const customers = customerService.search(query).slice(0, 5)
    const orders = serviceOrderService.search(query).slice(0, 10)

    return { vehicles, customers, orders, primaryVehicle: byPlate ?? vehicles[0] }
  }, [query])

  return (
    <div>
      <PageHeader
        title="Histórico"
        description="Pesquise principalmente por placa, cliente ou número da OS"
      />

      <div className="mb-6 relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 h-12 text-base uppercase"
          placeholder="Ex.: ABC1D23"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query.trim() ? (
        <EmptyState
          icon={History}
          title="Comece pela placa"
          description="Digite uma placa Mercosul para ver todo o histórico do veículo. Experimente ABC1D23."
        />
      ) : !result ||
        (result.vehicles.length === 0 &&
          result.customers.length === 0 &&
          result.orders.length === 0) ? (
        <EmptyState icon={History} title="Nenhum histórico encontrado" description={`Sem resultados para “${query}”.`} />
      ) : (
        <div className="space-y-6">
          {result.primaryVehicle ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {result.primaryVehicle.brand} {result.primaryVehicle.model}{' '}
                  {result.primaryVehicle.year ?? ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-graphite px-3 py-1.5 font-mono text-sm font-bold text-white">
                    {result.primaryVehicle.plate}
                  </span>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Cliente atual</p>
                    {(() => {
                      const owner = customerService.getById(result.primaryVehicle!.customerId)
                      return owner ? (
                        <Link
                          to={`/clientes/${owner.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {owner.name}
                        </Link>
                      ) : (
                        <p>—</p>
                      )
                    })()}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Histórico
                  </h3>
                  <div className="space-y-3">
                    {serviceOrderService.getByVehicle(result.primaryVehicle.id).map((order) => (
                      <Link
                        key={order.id}
                        to={`/ordens/${order.id}`}
                        className="flex flex-col gap-2 rounded-md border px-4 py-3 hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">OS #{order.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.entryDate)} ·{' '}
                            {order.items[0]?.description ?? 'Sem itens'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{formatCurrency(order.total)}</span>
                          <StatusBadge status={order.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {result.orders.length > 0 && !result.primaryVehicle ? (
            <Card>
              <CardHeader>
                <CardTitle>Ordens encontradas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.orders.map((order) => {
                  const customer = customerService.getById(order.customerId)
                  const vehicle = vehicleService.getById(order.vehicleId)
                  return (
                    <Link
                      key={order.id}
                      to={`/ordens/${order.id}`}
                      className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium">OS #{order.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer?.name} · {vehicle?.plate}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </Link>
                  )
                })}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
