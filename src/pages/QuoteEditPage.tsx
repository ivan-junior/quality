import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { quoteService } from '@/services'
import type { QuoteItem } from '@/types'

export function QuoteEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = id ? quoteService.getById(id) : undefined

  const [issueDate, setIssueDate] = useState(existing?.issueDate ?? '')
  const [validUntil, setValidUntil] = useState(existing?.validUntil ?? '')
  const [customerRequest, setCustomerRequest] = useState(existing?.customerRequest ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [orderDiscount, setOrderDiscount] = useState(existing?.discount ?? 0)
  const [items, setItems] = useState<QuoteItem[]>(existing?.items ?? [])

  if (!existing) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Orçamento não encontrado.</p>
        <Button onClick={() => navigate('/orcamentos')}>Voltar</Button>
      </div>
    )
  }

  if (existing.status === 'CONVERTED') {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="mb-4">Orçamentos convertidos não podem ser editados.</p>
        <Button onClick={() => navigate(`/orcamentos/${existing.id}`)}>Voltar ao detalhe</Button>
      </div>
    )
  }

  function save() {
    quoteService.update(existing!.id, {
      issueDate,
      validUntil,
      customerRequest,
      notes,
      items,
      discount: orderDiscount,
    })
    toast.success('Orçamento atualizado')
    navigate(`/orcamentos/${existing!.id}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader title={`Editar orçamento #${existing.number}`} />

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Data de emissão</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Validade</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Solicitação</Label>
            <Textarea value={customerRequest} onChange={(e) => setCustomerRequest(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsEditor
            items={items}
            onChange={setItems}
            orderDiscount={orderDiscount}
            onOrderDiscountChange={setOrderDiscount}
            suggestedWarrantyStart={validUntil || issueDate}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(`/orcamentos/${existing.id}`)}>
          Cancelar
        </Button>
        <Button onClick={save}>Salvar alterações</Button>
      </div>
    </div>
  )
}
