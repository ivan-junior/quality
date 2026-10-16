import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge'
import { WarrantyStatusBadge } from '@/components/WarrantyStatusBadge'
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QUOTE_STATUS_LABELS } from '@/lib/constants'
import { useRefresh } from '@/hooks/useRefresh'
import { customerService, quoteService, vehicleService } from '@/services'
import type { QuoteStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { formatWarrantyDuration, hasWarrantyInfo } from '@/utils/warranty'
import { buildQuoteWhatsAppMessage } from '@/utils/whatsapp'

const MANUAL_STATUSES: QuoteStatus[] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED']

export function QuoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tick, refresh } = useRefresh()
  const [statusOpen, setStatusOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<QuoteStatus>('SENT')

  void tick
  const quote = id ? quoteService.getById(id) : undefined

  if (!quote) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Orçamento não encontrado.</p>
        <Button onClick={() => navigate('/orcamentos')}>Voltar</Button>
      </div>
    )
  }

  const customer = customerService.getById(quote.customerId)
  const vehicle = vehicleService.getById(quote.vehicleId)
  const vehicleLabel = vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'
  const whatsappPhone = customer?.whatsapp || customer?.phone || ''
  const canEdit = quote.status !== 'CONVERTED'
  const canConvert = quote.status === 'APPROVED' && !quote.convertedServiceOrderId

  function changeStatus() {
    const updated = quoteService.updateStatus(quote!.id, nextStatus)
    if (!updated || updated.status !== nextStatus) {
      toast.error('Transição de status não permitida')
      return
    }
    toast.success(`Status alterado para ${QUOTE_STATUS_LABELS[nextStatus]}`)
    setStatusOpen(false)
    refresh()
  }

  function convert() {
    const result = quoteService.convertToServiceOrder(quote!.id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    if (result.stockWarnings.length) {
      toast.warning('Orçamento convertido com avisos de estoque', {
        description: result.stockWarnings.join(' '),
      })
    } else {
      toast.success(`OS #${result.order.number} gerada`)
    }
    refresh()
    navigate(`/ordens/${result.order.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/orcamentos')}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        {canEdit ? (
          <Button asChild variant="outline" size="sm">
            <Link to={`/orcamentos/${quote.id}/editar`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        ) : null}
        {canEdit ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNextStatus(quote.status === 'CONVERTED' ? 'DRAFT' : quote.status)
              setStatusOpen(true)
            }}
          >
            Alterar status
          </Button>
        ) : null}
        <Button asChild size="sm" variant="outline">
          <Link to={`/orcamentos/${quote.id}/imprimir`} target="_blank">
            <Printer className="h-4 w-4" />
            Gerar PDF
          </Link>
        </Button>
        <WhatsAppShareButton
          phone={whatsappPhone}
          message={buildQuoteWhatsAppMessage({
            customerName: customer?.name ?? 'Cliente',
            quoteNumber: quote.number,
            vehicleLabel,
            plate: vehicle?.plate ?? '—',
            total: quote.total,
            validUntil: quote.validUntil,
          })}
        />
        {canConvert ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm">Converter em Ordem de Serviço</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Converter orçamento #{quote.number}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Será criada uma nova OS com os mesmos itens, cliente e veículo. O estoque não será
                  descontado nesta etapa. O orçamento passará para o status Convertido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={convert}>Confirmar conversão</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-graphite">Orçamento #{quote.number}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Emissão {formatDate(quote.issueDate)} · Validade {formatDate(quote.validUntil)}
            </p>
            {quote.convertedServiceOrderId && quote.convertedServiceOrderNumber ? (
              <p className="mt-2 text-sm">
                Ordem de Serviço vinculada:{' '}
                <Link
                  to={`/ordens/${quote.convertedServiceOrderId}`}
                  className="font-medium text-primary hover:underline"
                >
                  #{quote.convertedServiceOrderNumber}
                </Link>
              </p>
            ) : null}
          </div>
          <QuoteStatusBadge quote={quote} />
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
                <span className="mt-2 inline-block rounded bg-graphite px-2 py-1 font-mono text-xs font-bold text-white">
                  {vehicle.plate}
                </span>
              </>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">
            {quote.customerRequest || 'Sem solicitação registrada.'}
          </p>
          {quote.notes ? (
            <div className="mt-4 rounded-md border border-dashed p-3">
              <p className="text-xs uppercase text-muted-foreground">Observações</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{quote.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quote.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0">
              <div className="space-y-1">
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type === 'PRODUCT' ? 'Produto' : 'Serviço'} · Qtd {item.quantity} ·{' '}
                  {formatCurrency(item.unitPrice)}
                </p>
                {item.type === 'PRODUCT' ? (
                  <div className="space-y-1">
                    {hasWarrantyInfo(item) ? (
                      <p className="text-xs text-muted-foreground">
                        Garantia prevista:{' '}
                        {formatWarrantyDuration(item.warrantyDuration!, item.warrantyUnit!)}
                        {' · '}Início: {formatDate(item.warrantyStartDate)}
                        {' · '}Venc.: {formatDate(item.warrantyEndDate)}
                      </p>
                    ) : null}
                    <WarrantyStatusBadge item={item} />
                  </div>
                ) : null}
              </div>
              <p className="font-semibold">{formatCurrency(item.total)}</p>
            </div>
          ))}
          <div className="space-y-1 pt-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto</span>
              <span>{formatCurrency(quote.discount)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>TOTAL</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar status do orçamento #{quote.number}</DialogTitle>
          </DialogHeader>
          <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as QuoteStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MANUAL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {QUOTE_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
