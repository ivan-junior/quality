import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  productService,
  serviceCatalogService,
  serviceOrderService,
} from '@/services'
import type { ItemType, ServiceOrderItem } from '@/types'
import { calcItemTotal, calcOrderTotals, formatCurrency, generateId } from '@/utils/format'

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
  const [itemDialog, setItemDialog] = useState(false)
  const [itemForm, setItemForm] = useState({
    type: 'PRODUCT' as ItemType,
    referenceId: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  })

  const catalog = useMemo(
    () => (itemForm.type === 'PRODUCT' ? productService.list() : serviceCatalogService.list()),
    [itemForm.type],
  )
  const totals = calcOrderTotals(items, orderDiscount)

  if (!existing) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Ordem não encontrada.</p>
        <Button onClick={() => navigate('/ordens')}>Voltar</Button>
      </div>
    )
  }

  function addItem() {
    const ref =
      itemForm.type === 'PRODUCT'
        ? productService.getById(itemForm.referenceId)
        : serviceCatalogService.getById(itemForm.referenceId)
    if (!ref) {
      toast.error('Selecione um item')
      return
    }
    const unitPrice =
      itemForm.unitPrice || ('salePrice' in ref ? ref.salePrice : ref.defaultPrice)
    setItems((prev) => [
      ...prev,
      {
        id: generateId('osi'),
        type: itemForm.type,
        referenceId: itemForm.referenceId,
        description: ref.name,
        quantity: itemForm.quantity,
        unitPrice,
        discount: itemForm.discount,
        total: calcItemTotal(itemForm.quantity, unitPrice, itemForm.discount),
      },
    ])
    setItemDialog(false)
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Itens</CardTitle>
          <Button size="sm" onClick={() => setItemDialog(true)}>
            + Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  Qtd {item.quantity} · {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatCurrency(item.total)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}
          <div className="rounded-md bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Label>Desconto</Label>
              <Input
                type="number"
                className="w-32"
                value={orderDiscount}
                onChange={(e) => setOrderDiscount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="mt-3 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(`/ordens/${existing.id}`)}>
          Cancelar
        </Button>
        <Button onClick={save}>Salvar alterações</Button>
      </div>

      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Select
              value={itemForm.type}
              onValueChange={(value) =>
                setItemForm({ ...itemForm, type: value as ItemType, referenceId: '', unitPrice: 0 })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRODUCT">Produto</SelectItem>
                <SelectItem value="SERVICE">Serviço</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={itemForm.referenceId}
              onValueChange={(value) => {
                const ref =
                  itemForm.type === 'PRODUCT'
                    ? productService.getById(value)
                    : serviceCatalogService.getById(value)
                const unitPrice = ref
                  ? 'salePrice' in ref
                    ? ref.salePrice
                    : ref.defaultPrice
                  : 0
                setItemForm({ ...itemForm, referenceId: value, unitPrice })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: Number(e.target.value) || 1 })}
              />
              <Input
                type="number"
                value={itemForm.unitPrice}
                onChange={(e) => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) || 0 })}
              />
              <Input
                type="number"
                value={itemForm.discount}
                onChange={(e) => setItemForm({ ...itemForm, discount: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addItem}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
