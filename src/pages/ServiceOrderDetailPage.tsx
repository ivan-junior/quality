import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { STATUS_LABELS } from '@/lib/constants'
import { useRefresh } from '@/hooks/useRefresh'
import { customerService, serviceOrderService, vehicleService } from '@/services'
import type { ServiceOrderStatus } from '@/types'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

export function ServiceOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tick, refresh } = useRefresh()
  const [statusOpen, setStatusOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<ServiceOrderStatus>('IN_PROGRESS')

  void tick
  const order = id ? serviceOrderService.getById(id) : undefined

  if (!order) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Ordem de serviço não encontrada.</p>
        <Button onClick={() => navigate('/ordens')}>Voltar</Button>
      </div>
    )
  }

  const customer = customerService.getById(order.customerId)
  const vehicle = vehicleService.getById(order.vehicleId)

  function changeStatus() {
    serviceOrderService.updateStatus(order!.id, nextStatus)
    toast.success(`Status alterado para ${STATUS_LABELS[nextStatus]}`)
    setStatusOpen(false)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/ordens')}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={`/ordens/${order.id}/editar`}>
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setNextStatus(order.status)
            setStatusOpen(true)
          }}
        >
          Alterar status
        </Button>
        <Button asChild size="sm">
          <Link to={`/ordens/${order.id}/imprimir`} target="_blank">
            <Printer className="h-4 w-4" />
            Imprimir / Gerar PDF
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-graphite">OS #{order.number}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entrada {formatDate(order.entryDate)}
              {order.deliveryForecast ? ` · Previsão ${formatDate(order.deliveryForecast)}` : ''}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-xs uppercase text-muted-foreground">Cliente</p>
            {customer ? (
              <>
                <Link
                  to={`/clientes/${customer.id}`}
                  className="mt-1 block text-lg font-semibold text-primary hover:underline"
                >
                  {customer.name}
                </Link>
                <p className="text-sm">{customer.phone}</p>
                <p className="text-sm text-muted-foreground">{customer.document || '—'}</p>
              </>
            ) : (
              <p>—</p>
            )}
          </div>
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-xs uppercase text-muted-foreground">Veículo</p>
            {vehicle ? (
              <>
                <Link
                  to={`/veiculos/${vehicle.id}`}
                  className="mt-1 block text-lg font-semibold text-primary hover:underline"
                >
                  {vehicle.brand} {vehicle.model} {vehicle.year ?? ''}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-graphite px-2 py-1 font-mono text-xs font-bold text-white">
                    {vehicle.plate}
                  </span>
                  <span className="text-sm text-muted-foreground">{vehicle.color}</span>
                  {order.currentKm != null ? (
                    <span className="text-sm text-muted-foreground">
                      {order.currentKm.toLocaleString('pt-BR')} KM
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitação do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">
            {order.customerRequest || 'Sem solicitação registrada.'}
          </p>
          {order.internalNotes ? (
            <div className="mt-4 rounded-md border border-dashed p-3">
              <p className="text-xs uppercase text-muted-foreground">Observações internas</p>
              <p className="mt-1 text-sm">{order.internalNotes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'PRODUCT' ? 'Produto' : 'Serviço'} · Qtd {item.quantity} ·{' '}
                  {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(item.total)}</p>
            </div>
          ))}
          <div className="space-y-1 pt-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto</span>
              <span>{formatCurrency(order.discount)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>TOTAL</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...order.statusHistory].reverse().map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <StatusBadge status={entry.status} />
                {entry.note ? (
                  <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">{formatDateTime(entry.changedAt)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar status da OS #{order.number}</DialogTitle>
          </DialogHeader>
          <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as ServiceOrderStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as ServiceOrderStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Ao finalizar ou entregar, produtos da OS são baixados do estoque automaticamente (uma única vez).
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={changeStatus}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
