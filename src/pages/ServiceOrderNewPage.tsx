import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LineItemsEditor } from '@/components/LineItemsEditor'
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
  customerService,
  serviceOrderService,
  vehicleService,
} from '@/services'
import type { Customer, ServiceOrderItem, Vehicle } from '@/types'
import {
  formatPlate,
  maskDocument,
  maskPhone,
  todayISODate,
} from '@/utils/format'

export function ServiceOrderNewPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [customerQuery, setCustomerQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerDialog, setCustomerDialog] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    name: '',
    document: '',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
  })

  const [plateQuery, setPlateQuery] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicleDialog, setVehicleDialog] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    notes: '',
  })

  const [entryDate, setEntryDate] = useState(todayISODate())
  const [deliveryForecast, setDeliveryForecast] = useState('')
  const [currentKm, setCurrentKm] = useState('')
  const [customerRequest, setCustomerRequest] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [items, setItems] = useState<ServiceOrderItem[]>([])

  const customers = useMemo(() => {
    const DEMO_CUSTOMER_ID = 'cust_013' // Sarah Codognoto — sempre primeiro na demo
    const results = customerService.search(customerQuery)
    const demoCustomer = results.find((c) => c.id === DEMO_CUSTOMER_ID)
    const others = results.filter((c) => c.id !== DEMO_CUSTOMER_ID)
    return demoCustomer
      ? [demoCustomer, ...others].slice(0, 8)
      : results.slice(0, 8)
  }, [customerQuery, selectedCustomer])
  const customerVehicles = selectedCustomer
    ? vehicleService.getByCustomer(selectedCustomer.id)
    : []
  const plateMatch = plateQuery ? vehicleService.getByPlate(plateQuery) : undefined

  function createCustomer() {
    if (!customerForm.name || !customerForm.phone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }
    const customer = customerService.create({
      ...customerForm,
      whatsapp: customerForm.whatsapp || customerForm.phone,
    })
    setSelectedCustomer(customer)
    setCustomerDialog(false)
    toast.success('Cliente cadastrado')
    setStep(2)
  }

  function createVehicle() {
    if (!selectedCustomer) return
    if (!vehicleForm.plate || !vehicleForm.brand || !vehicleForm.model) {
      toast.error('Preencha placa, marca e modelo')
      return
    }
    const vehicle = vehicleService.create({
      plate: vehicleForm.plate,
      brand: vehicleForm.brand,
      model: vehicleForm.model,
      year: vehicleForm.year ? Number(vehicleForm.year) : null,
      color: vehicleForm.color,
      customerId: selectedCustomer.id,
      notes: vehicleForm.notes,
    })
    setSelectedVehicle(vehicle)
    setVehicleDialog(false)
    toast.success('Veículo cadastrado')
    setStep(3)
  }

  function saveOrder() {
    if (!selectedCustomer || !selectedVehicle) {
      toast.error('Selecione cliente e veículo')
      return
    }
    const order = serviceOrderService.create({
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicle.id,
      entryDate,
      deliveryForecast: deliveryForecast || null,
      currentKm: currentKm ? Number(currentKm) : null,
      customerRequest,
      internalNotes,
      items,
      discount: orderDiscount,
    })
    toast.success(`OS #${order.number} criada`)
    navigate(`/ordens/${order.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Nova Ordem de Serviço"
        description="Fluxo rápido: cliente → veículo → itens"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              step === n ? 'bg-primary text-white' : step > n ? 'bg-primary-light text-primary-dark' : 'bg-muted text-muted-foreground'
            }`}
          >
            Passo {n}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>1. Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label>Pesquisar cliente (nome, CPF ou telefone)</Label>
              <Input
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                placeholder="Ex.: João da Silva"
              />
            </div>
            <div className="space-y-2">
              {customers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(c)
                    setSelectedVehicle(null)
                    setStep(2)
                  }}
                  className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left hover:bg-muted"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.phone} · {c.document || 'Sem documento'}
                    </p>
                  </div>
                  <span className="text-sm text-primary">Selecionar</span>
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setCustomerDialog(true)}>
              + Cadastrar novo cliente
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 && selectedCustomer ? (
        <Card>
          <CardHeader>
            <CardTitle>2. Veículo — {selectedCustomer.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1.5">
              <Label>Buscar pela placa</Label>
              <Input
                className="font-mono uppercase"
                value={plateQuery}
                onChange={(e) => setPlateQuery(formatPlate(e.target.value))}
                placeholder="ABC1D23"
              />
              {plateMatch ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVehicle(plateMatch)
                    setSelectedCustomer(
                      customerService.getById(plateMatch.customerId) ?? selectedCustomer,
                    )
                    setStep(3)
                  }}
                  className="mt-2 rounded-md border border-primary/30 bg-primary-light px-4 py-3 text-left"
                >
                  Encontrado: {plateMatch.brand} {plateMatch.model} — {plateMatch.plate}
                </button>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Veículos do cliente</Label>
              {customerVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
              ) : (
                customerVehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVehicle(v)
                      setStep(3)
                    }}
                    className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">
                        {v.brand} {v.model} {v.year ?? ''}
                      </p>
                      <p className="text-sm text-muted-foreground">{v.color || 'Sem cor'}</p>
                    </div>
                    <span className="rounded bg-graphite px-2 py-1 font-mono text-xs text-white">
                      {v.plate}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button variant="outline" onClick={() => setVehicleDialog(true)}>
                + Cadastrar novo veículo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 && selectedCustomer && selectedVehicle ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>3. Dados da OS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted/60 p-4 text-sm">
                <p>
                  <strong>Cliente:</strong> {selectedCustomer.name} · {selectedCustomer.phone}
                </p>
                <p className="mt-1">
                  <strong>Veículo:</strong> {selectedVehicle.brand} {selectedVehicle.model}{' '}
                  <span className="ml-2 rounded bg-graphite px-1.5 py-0.5 font-mono text-xs text-white">
                    {selectedVehicle.plate}
                  </span>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label>Data de entrada</Label>
                  <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>KM atual</Label>
                  <Input
                    type="number"
                    value={currentKm}
                    onChange={(e) => setCurrentKm(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Previsão de entrega</Label>
                  <Input
                    type="date"
                    value={deliveryForecast}
                    onChange={(e) => setDeliveryForecast(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Solicitação do cliente</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={customerRequest}
                  onChange={(e) => setCustomerRequest(e.target.value)}
                  placeholder="Descreva o que o cliente solicitou..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Observações internas</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens da ordem</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsEditor
                items={items}
                onChange={setItems}
                orderDiscount={orderDiscount}
                onOrderDiscountChange={setOrderDiscount}
                suggestedWarrantyStart={deliveryForecast || entryDate}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Voltar
            </Button>
            <Button onClick={saveOrder}>Salvar Ordem de Serviço</Button>
          </div>
        </div>
      ) : null}

      <Dialog open={customerDialog} onOpenChange={setCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Nome *</Label>
              <Input
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>CPF/CNPJ</Label>
              <Input
                value={customerForm.document}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, document: maskDocument(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Telefone *</Label>
              <Input
                value={customerForm.phone}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, phone: maskPhone(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createCustomer}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={vehicleDialog} onOpenChange={setVehicleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar veículo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Placa *</Label>
              <Input
                className="font-mono uppercase"
                value={vehicleForm.plate}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, plate: formatPlate(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Marca *</Label>
                <Input
                  value={vehicleForm.brand}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Modelo *</Label>
                <Input
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Ano</Label>
                <Input
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Cor</Label>
                <Input
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createVehicle}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
