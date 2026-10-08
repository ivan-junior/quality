import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, Plus, Search } from 'lucide-react'
import { SidebarNav } from '@/components/SidebarNav'
import { GlobalSearch } from '@/components/GlobalSearch'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/ordens': 'Ordens de Serviço',
  '/ordens/nova': 'Nova Ordem de Serviço',
  '/clientes': 'Clientes',
  '/veiculos': 'Veículos',
  '/produtos': 'Produtos',
  '/servicos': 'Serviços',
  '/estoque': 'Estoque',
  '/historico': 'Histórico',
  '/configuracoes': 'Configurações',
}

function resolveTitle(pathname: string): string {
  if (titles[pathname]) return titles[pathname]
  if (pathname.startsWith('/ordens/') && pathname.endsWith('/editar')) return 'Editar Ordem de Serviço'
  if (pathname.startsWith('/ordens/') && pathname.endsWith('/imprimir')) return 'Imprimir OS'
  if (pathname.startsWith('/ordens/')) return 'Detalhe da OS'
  if (pathname.startsWith('/clientes/')) return 'Detalhe do Cliente'
  if (pathname.startsWith('/veiculos/')) return 'Detalhe do Veículo'
  return 'Quality Sound & Film'
}

export function AppLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const title = resolveTitle(location.pathname)
  const isPrint = location.pathname.endsWith('/imprimir')

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (isPrint) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="no-print hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarNav />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-graphite">{title}</h1>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Buscar cliente, placa, OS...</span>
              <kbd className="rounded border bg-card px-1.5 text-[10px]">Ctrl K</kbd>
            </button>

            <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>

            <Button asChild>
              <Link to="/ordens/nova">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova OS</span>
              </Link>
            </Button>
          </div>
          <div className="px-4 pb-3 md:hidden">
            <Input
              readOnly
              placeholder="Buscar cliente, placa, OS..."
              onClick={() => setSearchOpen(true)}
              className="cursor-pointer"
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
