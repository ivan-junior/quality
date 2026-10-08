import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { StockBadge } from '@/components/StockBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRefresh } from '@/hooks/useRefresh'
import { getStockStatus, productService, stockService } from '@/services'
import type { StockMovementType } from '@/types'
import { formatDateTime } from '@/utils/format'

export function StockPage() {
  const { tick, refresh } = useRefresh()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    productId: '',
    type: 'IN' as StockMovementType,
    quantity: 1,
    reason: '',
    notes: '',
  })

  const products = useMemo(() => productService.list(), [tick])
  const movements = useMemo(() => stockService.listMovements(), [tick])

  function save() {
    if (!form.productId || !form.reason.trim()) {
      toast.error('Selecione o produto e informe o motivo')
      return
    }
    stockService.register({
      productId: form.productId,
      type: form.type,
      quantity: form.quantity,
      reason: form.reason,
      notes: form.notes,
    })
    toast.success('Movimentação registrada')
    setOpen(false)
    setForm({ productId: '', type: 'IN', quantity: 1, reason: '', notes: '' })
    refresh()
  }

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Controle de saldo e movimentações"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setForm((f) => ({ ...f, type: 'ADJUST' }))
                setOpen(true)
              }}
            >
              Ajustar estoque
            </Button>
            <Button
              onClick={() => {
                setForm((f) => ({ ...f, type: 'IN' }))
                setOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Entrada de estoque
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="saldo">
        <TabsList>
          <TabsTrigger value="saldo">Saldo</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="saldo">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Estoque atual</TableHead>
                  <TableHead>Estoque mínimo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{p.minStock}</TableCell>
                    <TableCell>
                      <StockBadge status={getStockStatus(p)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => {
                  const product = productService.getById(m.productId)
                  const typeLabel =
                    m.type === 'IN' ? 'Entrada' : m.type === 'OUT' ? 'Saída' : 'Ajuste'
                  return (
                    <TableRow key={m.id}>
                      <TableCell>{formatDateTime(m.createdAt)}</TableCell>
                      <TableCell>{product?.name ?? '—'}</TableCell>
                      <TableCell>{typeLabel}</TableCell>
                      <TableCell>{m.quantity}</TableCell>
                      <TableCell>{m.reason}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.type === 'ADJUST' ? 'Ajustar estoque' : 'Movimentação de estoque'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Produto</Label>
              <Select
                value={form.productId}
                onValueChange={(v) => setForm({ ...form, productId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (atual: {p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as StockMovementType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">Entrada</SelectItem>
                  <SelectItem value="OUT">Saída</SelectItem>
                  <SelectItem value="ADJUST">Ajuste (definir saldo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>{form.type === 'ADJUST' ? 'Novo saldo' : 'Quantidade'}</Label>
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Motivo</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Observação</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
