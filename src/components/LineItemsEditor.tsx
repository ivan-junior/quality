import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/NumberInput'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WarrantyStatusBadge } from '@/components/WarrantyStatusBadge'
import { productService, serviceCatalogService } from '@/services'
import type { ItemType, ServiceOrderItem, WarrantyUnit } from '@/types'
import { calcItemTotal, calcOrderTotals, formatCurrency, formatDate, generateId } from '@/utils/format'
import { applyWarrantyFields, formatWarrantyDuration, hasWarrantyInfo } from '@/utils/warranty'

interface LineItemsEditorProps {
  items: ServiceOrderItem[]
  onChange: (items: ServiceOrderItem[]) => void
  orderDiscount: number
  onOrderDiscountChange: (value: number) => void
  suggestedWarrantyStart?: string | null
  showWarrantyStatus?: boolean
  readOnly?: boolean
}

export function LineItemsEditor({
  items,
  onChange,
  orderDiscount,
  onOrderDiscountChange,
  suggestedWarrantyStart,
  showWarrantyStatus = false,
  readOnly = false,
}: LineItemsEditorProps) {
  const [itemDialog, setItemDialog] = useState(false)
  const [itemForm, setItemForm] = useState({
    type: 'PRODUCT' as ItemType,
    referenceId: '',
    quantity: 1 as number | null,
    unitPrice: 0 as number | null,
    discount: 0 as number | null,
    warrantyDuration: null as number | null,
    warrantyUnit: 'MONTHS' as WarrantyUnit,
    warrantyStartDate: '',
    hasWarranty: false,
  })

  const catalog =
    itemForm.type === 'PRODUCT' ? productService.list() : serviceCatalogService.list()
  const totals = calcOrderTotals(items, orderDiscount)

  function resetForm() {
    setItemForm({
      type: 'PRODUCT',
      referenceId: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      warrantyDuration: null,
      warrantyUnit: 'MONTHS',
      warrantyStartDate: suggestedWarrantyStart || '',
      hasWarranty: false,
    })
  }

  function openDialog() {
    resetForm()
    setItemForm((prev) => ({
      ...prev,
      warrantyStartDate: suggestedWarrantyStart || '',
    }))
    setItemDialog(true)
  }

  function addItem() {
    const quantity = itemForm.quantity ?? 0
    const unitPrice = itemForm.unitPrice ?? 0
    const discount = itemForm.discount ?? 0

    if (!itemForm.referenceId) {
      toast.error('Selecione um item')
      return
    }
    if (quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero')
      return
    }
    if (unitPrice < 0 || discount < 0) {
      toast.error('Valores inválidos')
      return
    }

    const ref =
      itemForm.type === 'PRODUCT'
        ? productService.getById(itemForm.referenceId)
        : serviceCatalogService.getById(itemForm.referenceId)
    if (!ref) {
      toast.error('Selecione um item')
      return
    }

    const description = ref.name
    const price =
      unitPrice ||
      ('salePrice' in ref ? ref.salePrice : (ref as { defaultPrice: number }).defaultPrice)

    let item: ServiceOrderItem = {
      id: generateId('osi'),
      type: itemForm.type,
      referenceId: itemForm.referenceId,
      description,
      quantity,
      unitPrice: price,
      discount,
      total: calcItemTotal(quantity, price, discount),
    }

    if (itemForm.type === 'PRODUCT' && itemForm.hasWarranty) {
      item = applyWarrantyFields(item, {
        duration: itemForm.warrantyDuration,
        unit: itemForm.warrantyUnit,
        startDate: itemForm.warrantyStartDate || suggestedWarrantyStart || null,
      })
      if (itemForm.hasWarranty && !hasWarrantyInfo(item)) {
        toast.error('Preencha duração, unidade e data de início da garantia')
        return
      }
    }

    onChange([...items, item])
    setItemDialog(false)
    resetForm()
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <div className="flex justify-end">
          <Button type="button" onClick={openDialog}>
            <Plus className="h-4 w-4" />
            Adicionar item
          </Button>
        </div>
      ) : null}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-20">Qtd</TableHead>
              <TableHead className="w-28">Unitário</TableHead>
              <TableHead className="w-24">Desconto</TableHead>
              <TableHead className="w-28 text-right">Total</TableHead>
              {!readOnly ? <TableHead className="w-12" /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 5 : 6} className="text-center text-muted-foreground">
                  Nenhum item adicionado
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.type === 'PRODUCT' ? 'Produto' : 'Serviço'}
                    </div>
                    {item.type === 'PRODUCT' ? (
                      <div className="mt-1 space-y-1">
                        {hasWarrantyInfo(item) ? (
                          <div className="text-xs text-muted-foreground">
                            Garantia: {formatWarrantyDuration(item.warrantyDuration!, item.warrantyUnit!)}
                            {' · '}Início: {formatDate(item.warrantyStartDate)}
                            {' · '}Venc.: {formatDate(item.warrantyEndDate)}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Garantia não informada</div>
                        )}
                        {showWarrantyStatus ? <WarrantyStatusBadge item={item} /> : null}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.discount)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total)}
                  </TableCell>
                  {!readOnly ? (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-end gap-2 text-sm">
        {!readOnly ? (
          <div className="flex items-center gap-2">
            <Label>Desconto geral</Label>
            <NumberInput
              className="w-32"
              value={orderDiscount}
              onValueChange={(v) => onOrderDiscountChange(v ?? 0)}
              min={0}
            />
          </div>
        ) : null}
        <div className="text-muted-foreground">Subtotal: {formatCurrency(totals.subtotal)}</div>
        <div className="text-muted-foreground">Descontos: {formatCurrency(totals.discount)}</div>
        <div className="text-lg font-semibold">Total: {formatCurrency(totals.total)}</div>
      </div>

      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Tipo</Label>
              <Select
                value={itemForm.type}
                onValueChange={(v) =>
                  setItemForm({
                    ...itemForm,
                    type: v as ItemType,
                    referenceId: '',
                    unitPrice: 0,
                    hasWarranty: false,
                  })
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
            </div>
            <div className="grid gap-1.5">
              <Label>Item</Label>
              <Select
                value={itemForm.referenceId}
                onValueChange={(id) => {
                  const ref =
                    itemForm.type === 'PRODUCT'
                      ? productService.getById(id)
                      : serviceCatalogService.getById(id)
                  const price = ref
                    ? 'salePrice' in ref
                      ? ref.salePrice
                      : ref.defaultPrice
                    : 0
                  setItemForm({ ...itemForm, referenceId: id, unitPrice: price })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {catalog.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label>Quantidade</Label>
                <NumberInput
                  value={itemForm.quantity}
                  onValueChange={(v) => setItemForm({ ...itemForm, quantity: v })}
                  allowDecimal={false}
                  min={0}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Valor unitário</Label>
                <NumberInput
                  value={itemForm.unitPrice}
                  onValueChange={(v) => setItemForm({ ...itemForm, unitPrice: v })}
                  min={0}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Desconto</Label>
                <NumberInput
                  value={itemForm.discount}
                  onValueChange={(v) => setItemForm({ ...itemForm, discount: v })}
                  min={0}
                />
              </div>
            </div>

            {itemForm.type === 'PRODUCT' ? (
              <div className="space-y-3 rounded-md border p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={itemForm.hasWarranty}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        hasWarranty: e.target.checked,
                        warrantyStartDate:
                          itemForm.warrantyStartDate || suggestedWarrantyStart || '',
                      })
                    }
                  />
                  Informar garantia
                </label>
                {itemForm.hasWarranty ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-1.5">
                      <Label>Garantia</Label>
                      <NumberInput
                        value={itemForm.warrantyDuration}
                        onValueChange={(v) => setItemForm({ ...itemForm, warrantyDuration: v })}
                        allowDecimal={false}
                        emptyAsNull
                        min={1}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Unidade</Label>
                      <Select
                        value={itemForm.warrantyUnit}
                        onValueChange={(v) =>
                          setItemForm({ ...itemForm, warrantyUnit: v as WarrantyUnit })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHS">Meses</SelectItem>
                          <SelectItem value="DAYS">Dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5 sm:col-span-1">
                      <Label>Início da garantia</Label>
                      <Input
                        type="date"
                        value={itemForm.warrantyStartDate}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, warrantyStartDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addItem}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
