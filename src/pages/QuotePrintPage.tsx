import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocumentSocialFooter } from '@/components/DocumentExtras'
import { Button } from '@/components/ui/button'
import {
  companySettingsService,
  customerService,
  quoteService,
  vehicleService,
} from '@/services'
import { formatCurrency, formatDate } from '@/utils/format'
import { formatWarrantyDuration, hasWarrantyInfo } from '@/utils/warranty'

export function QuotePrintPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const quote = id ? quoteService.getById(id) : undefined
  const customer = quote ? customerService.getById(quote.customerId) : undefined
  const vehicle = quote ? vehicleService.getById(quote.vehicleId) : undefined
  const settings = companySettingsService.get()

  useEffect(() => {
    if (quote) {
      const timer = window.setTimeout(() => window.print(), 400)
      return () => window.clearTimeout(timer)
    }
  }, [quote])

  if (!quote) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Orçamento não encontrado.</p>
        <Button onClick={() => navigate('/orcamentos')}>Voltar</Button>
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
          <img
            src={settings.logo || '/quality-logo.png'}
            alt={settings.name}
            className="h-14 w-auto object-contain"
          />
          <div className="text-right text-sm">
            <p className="font-semibold">{settings.name.toUpperCase()}</p>
            {settings.phone ? <p>Tel: {settings.phone}</p> : null}
            {settings.address ? <p>{settings.address}</p> : <p>Ribeirão Preto / SP</p>}
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-bold tracking-wide">
          ORÇAMENTO Nº {quote.number}
        </h1>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <p>
            <strong>Data de emissão:</strong> {formatDate(quote.issueDate)}
          </p>
          <p>
            <strong>Validade:</strong> {formatDate(quote.validUntil)}
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
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">
            Solicitação
          </h2>
          <p className="whitespace-pre-wrap text-sm">{quote.customerRequest || '—'}</p>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">Itens</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-300 text-left">
                <th className="py-2">Descrição</th>
                <th className="py-2">Qtd</th>
                <th className="py-2">Valor unitário</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-200 align-top">
                  <td className="py-2">
                    <div>{item.description}</div>
                    {item.type === 'PRODUCT' && hasWarrantyInfo(item) ? (
                      <div className="mt-1 text-xs text-neutral-600">
                        Garantia informada:{' '}
                        {formatWarrantyDuration(item.warrantyDuration!, item.warrantyUnit!)}
                        <br />
                        Início: {formatDate(item.warrantyStartDate)} · Vencimento:{' '}
                        {formatDate(item.warrantyEndDate)}
                      </div>
                    ) : null}
                  </td>
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
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto</span>
              <span>{formatCurrency(quote.discount)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-300 pt-2 text-base font-bold">
              <span>Valor total</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 border-b border-neutral-300 pb-1 text-sm font-bold uppercase">
            Observações
          </h2>
          <p className="whitespace-pre-wrap text-sm">{quote.notes || '—'}</p>
        </section>

        <DocumentSocialFooter settings={settings} />
      </div>
    </div>
  )
}
