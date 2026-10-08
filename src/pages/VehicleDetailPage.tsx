import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { customerService, serviceOrderService, vehicleService } from '@/services'
import { formatCurrency, formatDate } from '@/utils/format'

export function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const vehicle = id ? vehicleService.getById(id) : undefined

  if (!vehicle) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Veículo não encontrado.</p>
        <Button onClick={() => navigate('/veiculos')}>Voltar</Button>
      </div>
    )
  }

  const owner = customerService.getById(vehicle.customerId)
  const orders = serviceOrderService.getByVehicle(vehicle.id)

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/veiculos')}>
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Veículo</p>
            <h1 className="mt-1 text-2xl font-semibold text-graphite">
              {vehicle.brand} {vehicle.model} {vehicle.year ?? ''}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-graphite px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-white">
                {vehicle.plate}
              </span>
              {vehicle.color ? (
                <span className="text-sm text-muted-foreground">Cor: {vehicle.color}</span>
              ) : null}
            </div>
          </div>
          <Button asChild>
            <Link to="/ordens/nova">Nova OS</Link>
          </Button>
        </div>

        <div className="mt-6 rounded-md bg-muted/60 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente atual</p>
          {owner ? (
            <Link to={`/clientes/${owner.id}`} className="mt-1 block font-semibold text-primary hover:underline">
              {owner.name}
            </Link>
          ) : (
            <p className="mt-1 font-medium">—</p>
          )}
          {owner?.phone ? <p className="text-sm text-muted-foreground">{owner.phone}</p> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico do veículo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum serviço registrado nesta placa.</p>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                to={`/ordens/${order.id}`}
                className="block rounded-md border px-4 py-3 hover:bg-muted"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{formatDate(order.entryDate)}</p>
                    <p className="font-medium">OS #{order.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.map((i) => i.description).join(' · ') || 'Sem itens'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
