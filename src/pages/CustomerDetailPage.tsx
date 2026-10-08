import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Car, Phone } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { customerService, serviceOrderService, vehicleService } from '@/services'
import { formatCurrency, formatDate } from '@/utils/format'

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customer = id ? customerService.getById(id) : undefined

  if (!customer) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Cliente não encontrado.</p>
        <Button onClick={() => navigate('/clientes')}>Voltar</Button>
      </div>
    )
  }

  const vehicles = vehicleService.getByCustomer(customer.id)
  const orders = serviceOrderService.getByCustomer(customer.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">{customer.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            {customer.phone}
            {customer.whatsapp ? ` · WhatsApp ${customer.whatsapp}` : ''}
          </p>
        </div>
        <Button asChild>
          <Link to="/ordens/nova">Nova OS para este cliente</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dados do cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">CPF/CNPJ</p>
              <p className="font-medium">{customer.document || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">E-mail</p>
              <p className="font-medium">{customer.email || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Último atendimento</p>
              <p className="font-medium">{formatDate(customer.lastServiceAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Observações</p>
              <p className="font-medium">{customer.notes || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Veículos do cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
            ) : (
              vehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  to={`/veiculos/${vehicle.id}`}
                  className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted"
                >
                  <div>
                    <p className="font-medium">
                      {vehicle.brand} {vehicle.model} {vehicle.year ?? ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{vehicle.color || 'Sem cor'}</p>
                  </div>
                  <span className="rounded bg-graphite px-2 py-1 font-mono text-xs font-semibold text-white">
                    {vehicle.plate}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de atendimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
          ) : (
            orders.map((order) => {
              const vehicle = vehicleService.getById(order.vehicleId)
              return (
                <Link
                  key={order.id}
                  to={`/ordens/${order.id}`}
                  className="flex flex-col gap-2 rounded-md border px-4 py-3 hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">OS #{order.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.entryDate)} ·{' '}
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'} ·{' '}
                      {order.items[0]?.description ?? 'Sem itens'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
