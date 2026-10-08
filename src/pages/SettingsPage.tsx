import { useState } from 'react'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { BRAND } from '@/lib/constants'
import { resetDemoData } from '@/services'

export function SettingsPage() {
  const [resetting, setResetting] = useState(false)

  function handleReset() {
    setResetting(true)
    resetDemoData()
    toast.success('Dados de demonstração restaurados')
    setTimeout(() => {
      window.location.href = '/'
    }, 500)
  }

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Opções do sistema de demonstração"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{BRAND.name}</CardTitle>
            <CardDescription>
              MVP frontend com dados mockados persistidos em localStorage. Ideal para apresentações ao
              cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Telefone: {BRAND.phone}</p>
            <p>Versão: 1.0.0 · Storage: quality.v1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurar dados de demonstração</CardTitle>
            <CardDescription>
              Limpa alterações feitas durante a apresentação e reinsere os mocks originais (clientes,
              veículos, OS, estoque etc.).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={resetting}>
                  <RotateCcw className="h-4 w-4" />
                  Restaurar dados de demonstração
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restaurar dados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todas as alterações feitas nesta demonstração serão perdidas. Os mocks originais
                    (incluindo João da Silva / ABC1D23) serão restaurados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Confirmar restauração</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
