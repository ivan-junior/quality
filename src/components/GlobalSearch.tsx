import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchService } from '@/services'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { STATUS_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/utils/format'

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const results = useMemo(() => searchService.search(query), [query])

  function go(path: string) {
    onOpenChange(false)
    setQuery('')
    navigate(path)
  }

  const hasResults =
    results.customers.length > 0 || results.vehicles.length > 0 || results.orders.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Busca global</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente, telefone, CPF, placa, modelo ou nº OS..."
              className="border-0 shadow-none focus-visible:ring-0 px-0"
            />
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!query.trim() ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              Digite para buscar em clientes, veículos e ordens de serviço.
            </p>
          ) : !hasResults ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado para “{query}”.
            </p>
          ) : (
            <div className="space-y-4">
              {results.customers.length > 0 ? (
                <section>
                  <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Clientes
                  </h4>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => go(`/clientes/${c.id}`)}
                        className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-muted"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.phone} · {c.document || 'Sem documento'}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {results.vehicles.length > 0 ? (
                <section>
                  <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Veículos
                  </h4>
                  <div className="space-y-1">
                    {results.vehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => go(`/veiculos/${v.id}`)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted"
                      >
                        <div>
                          <span className="font-medium">
                            {v.brand} {v.model} {v.year ?? ''}
                          </span>
                          <div className="text-xs text-muted-foreground">{v.customerName}</div>
                        </div>
                        <span className="rounded bg-graphite px-2 py-1 font-mono text-xs font-semibold text-white">
                          {v.plate}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {results.orders.length > 0 ? (
                <section>
                  <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ordens de Serviço
                  </h4>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => go(`/ordens/${o.id}`)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted"
                      >
                        <div>
                          <span className="font-medium">OS #{o.number}</span>
                          <div className="text-xs text-muted-foreground">
                            {o.customerName} · {o.vehicleLabel} · {o.plate}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-medium">{formatCurrency(o.total)}</div>
                          <div className="text-muted-foreground">{STATUS_LABELS[o.status]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
