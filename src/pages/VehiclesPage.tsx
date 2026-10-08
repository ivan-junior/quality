import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { customerService, vehicleService } from '@/services'
import { formatPlate } from '@/utils/format'

const emptyForm = {
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  customerId: '',
  notes: '',
}

export function VehiclesPage() {
  const { tick, refresh } = useRefresh()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const customers = customerService.list()

  const vehicles = useMemo(() => vehicleService.search(query), [query, tick])

  function handleCreate() {
    if (!form.plate || !form.brand || !form.model || !form.customerId) {
      toast.error('Preencha placa, marca, modelo e cliente')
      return
    }
    if (vehicleService.getByPlate(form.plate)) {
      toast.error('Já existe um veículo com esta placa')
      return
    }
    vehicleService.create({
      plate: form.plate,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year ? Number(form.year) : null,
      color: form.color.trim(),
      customerId: form.customerId,
      notes: form.notes,
    })
    toast.success('Veículo cadastrado')
    setForm(emptyForm)
    setOpen(false)
    refresh()
  }

  return (
    <div>
      <PageHeader
        title="Veículos"
        description="Consulte pela placa o histórico completo do veículo"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo veículo
          </Button>
        }
      />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 uppercase"
          placeholder="Buscar por placa, marca ou modelo..."
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
        />
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Nenhum veículo encontrado"
          description="Tente buscar pela placa Mercosul (ex.: ABC1D23)."
          actionLabel="Novo veículo"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca / Modelo</TableHead>
                <TableHead className="hidden sm:table-cell">Ano</TableHead>
                <TableHead className="hidden md:table-cell">Cor</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => {
                const owner = customerService.getById(vehicle.customerId)
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <span className="rounded bg-graphite px-2 py-1 font-mono text-xs font-semibold text-white">
                        {vehicle.plate}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{vehicle.year ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.color || '—'}</TableCell>
                    <TableCell>{owner?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/veiculos/${vehicle.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo veículo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Placa *</Label>
              <Input
                className="uppercase font-mono"
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: formatPlate(e.target.value) })}
                placeholder="ABC1D23"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Marca *</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Modelo *</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Cor</Label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Cliente / proprietário *</Label>
              <Select
                value={form.customerId}
                onValueChange={(value) => setForm({ ...form, customerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
