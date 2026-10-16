import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { serviceOrderService } from '@/services'
import type { ServiceOrderItem } from '@/types'

export function ServiceOrderEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = id ? serviceOrderService.getById(id) : undefined

  const [entryDate, setEntryDate] = useState(existing?.entryDate ?? '')
  const [deliveryForecast, setDeliveryForecast] = useState(existing?.deliveryForecast ?? '')
  const [currentKm, setCurrentKm] = useState(existing?.currentKm?.toString() ?? '')
  const [customerRequest, setCustomerRequest] = useState(existing?.customerRequest ?? '')
  const [internalNotes, setInternalNotes] = useState(existing?.internalNotes ?? '')
  const [orderDiscount, setOrderDiscount] = useState(existing?.discount ?? 0)
  const [items, setItems] = useState<ServiceOrderItem[]>(existing?.items ?? [])

  if (!existing) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Ordem não encontrada.</p>
        <Button onClick={() => navigate('/ordens')}>Voltar</Button>
      </div>
    )
  }

  function save() {
    serviceOrderService.update(existing!.id, {
      entryDate,
      deliveryForecast: deliveryForecast || null,
      currentKm: currentKm ? Number(currentKm) : null,
      customerRequest,
      internalNotes,
      items,
      discount: orderDiscount,
    })
    toast.success('Ordem de serviço atualizada')
    navigate(`/ordens/${existing!.id}`)
  }

  const warrantyStart = deliveryForecast || entryDate

  return (
    <div className="space-y-4">
      <PageHeader title={`Editar OS #${existing.number}`} />

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Data de entrada</Label>
              <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>KM atual</Label>
              <Input value={currentKm} onChange={(e) => setCurrentKm(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Previsão</Label>
              <Input
                type="date"
                value={deliveryForecast}
                onChange={(e) => setDeliveryForecast(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Solicitação</Label>
            <Textarea value={customerRequest} onChange={(e) => setCustomerRequest(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações internas</Label>
            <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsEditor
            items={items}
            onChange={setItems}
            orderDiscount={orderDiscount}
            onOrderDiscountChange={setOrderDiscount}
            suggestedWarrantyStart={warrantyStart}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(`/ordens/${existing.id}`)}>
          Cancelar
        </Button>
        <Button onClick={save}>Salvar alterações</Button>
      </div>
    </div>
  )
}
