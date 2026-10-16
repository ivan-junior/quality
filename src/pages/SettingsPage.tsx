import { useState } from 'react'
import { toast } from 'sonner'
import { RotateCcw, Save } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { companySettingsService, resetDemoData } from '@/services'
import type { CompanySettings } from '@/types'
import { maskPhone } from '@/utils/format'

export function SettingsPage() {
  const [resetting, setResetting] = useState(false)
  const [form, setForm] = useState<CompanySettings>(() => companySettingsService.get())

  function saveSettings() {
    if (!form.name.trim()) {
      toast.error('Informe o nome da empresa')
      return
    }
    const saved = companySettingsService.save(form)
    setForm(saved)
    toast.success('Configurações salvas')
  }

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
        description="Dados da empresa, canais e opções do sistema"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Dados da empresa</CardTitle>
            <CardDescription>
              Informações usadas nos documentos impressos (OS e orçamentos). Deixe redes e avaliação
              em branco se ainda não tiver os links.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Nome da empresa</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Endereço</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Logo (caminho do asset)</Label>
              <Input
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Instagram</Label>
                <Input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Facebook</Label>
                <Input
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Site</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Link de avaliação do Google</Label>
              <Input
                value={form.googleReviewUrl}
                onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
                placeholder="https://g.page/... (gera QR Code na OS)"
              />
            </div>
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4" />
              Salvar configurações
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistema</CardTitle>
            <CardDescription>
              MVP frontend com dados mockados em localStorage (quality.v1 · versão 2).
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurar dados de demonstração</CardTitle>
            <CardDescription>
              Limpa alterações feitas durante a apresentação e reinsere os mocks originais (clientes,
              veículos, OS, orçamentos, garantias, estoque etc.).
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
                    (incluindo João da Silva / ABC1D23, orçamento #00045 → OS #00128) serão
                    restaurados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Restaurar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
