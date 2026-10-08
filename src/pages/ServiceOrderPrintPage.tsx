import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/lib/constants'
import { customerService, serviceOrderService, vehicleService } from '@/services'
import { formatCurrency, formatDate } from '@/utils/format'

export function ServiceOrderPrintPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = id ? serviceOrderService.getById(id) : undefined
  const customer = order ? customerService.getById(order.customerId) : undefined
  const vehicle = order ? vehicleService.getById(order.vehicleId) : undefined

  useEffect(() => {
    if (order) {
      const timer = window.setTimeout(() => window.print(), 400)
      return () => window.clearTimeout(timer)
    }
  }, [order])

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">OS não encontrada.</p>
        <Button onClick={() => navigate('/ordens')}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="no-print flex justify-end gap-2 border-b p-4">
        <Button variant="outline" onClick={() => window.close()}>
          Fechar
        </Button>
        <Button onClick={() => window.print()}>Imprimir / Salvar PDF</Button>
      </div>

      <div className="print-area mx-auto max-w-3xl p-8">
        <div className="flex items-start justify-between border-b border-neutral-300 pb-4">
          <img src={BRAND.logo} alt={BRAND.name} className="h-14 w-auto object-contain" />
          <div className="text-right text-sm">
            <p className="font-semibold">{BRAND.name}</p>
            <p>Tel: {BRAND.phone}</p>
            <p>Ribeirão Preto / SP</p>
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-bold tracking-wide">
          ORDEM DE SERVIÇO Nº {order.number}
        </h1>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <p>
            <strong>Data de entrada:</strong> {formatDate(order.entryDate)}
          </p>
          <p>
            <strong>Previsão:</strong> {formatDate(order.deliveryForecast)}
          </p>
        </div>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">
            Dados do cliente
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Nome:</strong> {customer?.name ?? '—'}
            </p>
            <p>
              <strong>Telefone:</strong> {customer?.phone ?? '—'}
            </p>
            <p className="col-span-2">
              <strong>CPF/CNPJ:</strong> {customer?.document || '—'}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">
            Dados do veículo
          </h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <p>
              <strong>Marca:</strong> {vehicle?.brand ?? '—'}
            </p>
            <p>
              <strong>Modelo:</strong> {vehicle?.model ?? '—'}
            </p>
            <p>
              <strong>Ano:</strong> {vehicle?.year ?? '—'}
            </p>
            <p>
              <strong>Placa:</strong> {vehicle?.plate ?? '—'}
            </p>
            <p>
              <strong>Cor:</strong> {vehicle?.color || '—'}
            </p>
            <p>
              <strong>KM:</strong>{' '}
              {order.currentKm != null ? order.currentKm.toLocaleString('pt-BR') : '—'}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">
            Solicitação do cliente
          </h2>
          <p className="whitespace-pre-wrap text-sm">{order.customerRequest || '—'}</p>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">Itens</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left">
                <th className="py-2">Descrição</th>
                <th className="py-2">Qtd</th>
                <th className="py-2">Valor Unit.</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-200">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 ml-auto w-56 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto</span>
              <span>{formatCurrency(order.discount)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-300 pt-2 text-base font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">
            Observações
          </h2>
          <p className="whitespace-pre-wrap text-sm">{order.internalNotes || '—'}</p>
        </section>

        <div className="mt-16 grid grid-cols-2 gap-10 text-sm">
          <div className="text-center">
            <div className="mb-2 border-t border-neutral-500 pt-2">
              Responsável Quality Sound & Film
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 border-t border-neutral-500 pt-2">Cliente</div>
          </div>
        </div>
      </div>
    </div>
  )
}
