import { useMemo, useState } from 'react'
import { Plus, Search, Wrench } from 'lucide-react'
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
import { SERVICE_CATEGORIES } from '@/lib/constants'
import { useRefresh } from '@/hooks/useRefresh'
import { serviceCatalogService } from '@/services'
import { formatCurrency } from '@/utils/format'

const emptyForm = {
  name: '',
  category: 'Instalação',
  defaultPrice: 0,
  estimatedMinutes: 60,
  description: '',
}

export function ServicesPage() {
  const { tick, refresh } = useRefresh()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const services = useMemo(() => serviceCatalogService.search(query), [query, tick])

  function save() {
    if (!form.name.trim()) {
      toast.error('Informe o nome do serviço')
      return
    }
    serviceCatalogService.create(form)
    toast.success('Serviço cadastrado')
    setForm(emptyForm)
    setOpen(false)
    refresh()
  }

  return (
    <div>
      <PageHeader
        title="Serviços"
        description="Catálogo de serviços da oficina"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo serviço
          </Button>
        }
      />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar serviço..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {services.length === 0 ? (
        <EmptyState icon={Wrench} title="Nenhum serviço encontrado" />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço padrão</TableHead>
                <TableHead className="hidden sm:table-cell">Tempo est.</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>{formatCurrency(s.defaultPrice)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{s.estimatedMinutes} min</TableCell>
                  <TableCell className="hidden max-w-xs truncate md:table-cell">{s.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo serviço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Preço padrão</Label>
                <Input
                  type="number"
                  value={form.defaultPrice}
                  onChange={(e) => setForm({ ...form, defaultPrice: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Tempo estimado (min)</Label>
              <Input
                type="number"
                value={form.estimatedMinutes}
                onChange={(e) =>
                  setForm({ ...form, estimatedMinutes: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
