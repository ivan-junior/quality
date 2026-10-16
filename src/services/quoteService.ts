import { getQuotes } from '@/mocks'
import { STORAGE_KEYS, setItem } from '@/storage/localStorageRepository'
import type {
  Quote,
  QuoteFilterStatus,
  QuoteItem,
  QuoteStatus,
  ServiceOrder,
} from '@/types'
import {
  calcOrderTotals,
  generateId,
  normalizeSearch,
  nowISO,
  todayISODate,
} from '@/utils/format'
import { DEFAULT_QUOTE_VALIDITY_DAYS } from '@/lib/constants'
import { customerService } from './customerService'
import { productService } from './productService'
import { serviceOrderService } from './serviceOrderService'
import { vehicleService } from './vehicleService'

function save(quotes: Quote[]) {
  setItem(STORAGE_KEYS.quotes, quotes)
}

function nextQuoteNumber(): string {
  const quotes = getQuotes()
  const max = quotes.reduce((acc, quote) => {
    const n = Number.parseInt(quote.number, 10)
    return Number.isFinite(n) ? Math.max(acc, n) : acc
  }, 0)
  return String(max + 1).padStart(5, '0')
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function withTotals(quote: Quote, items: QuoteItem[], discount = quote.discount): Quote {
  const totals = calcOrderTotals(items, discount)
  return { ...quote, items, ...totals, updatedAt: nowISO() }
}

export function isQuoteExpired(quote: Quote, today = todayISODate()): boolean {
  return (
    (quote.status === 'DRAFT' || quote.status === 'SENT') && quote.validUntil < today
  )
}

export function getEffectiveQuoteStatus(
  quote: Quote,
  today = todayISODate(),
): QuoteStatus | 'EXPIRED' {
  if (isQuoteExpired(quote, today)) return 'EXPIRED'
  return quote.status
}

const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ['SENT', 'APPROVED', 'REJECTED'],
  SENT: ['DRAFT', 'APPROVED', 'REJECTED'],
  APPROVED: ['REJECTED', 'SENT'],
  REJECTED: ['DRAFT', 'SENT'],
  CONVERTED: [],
}

function cloneItems(items: QuoteItem[]): QuoteItem[] {
  return items.map((item) => ({
    ...structuredClone(item),
    id: generateId('osi'),
  }))
}

export type ConvertQuoteResult =
  | {
      ok: true
      quote: Quote
      order: ServiceOrder
      stockWarnings: string[]
    }
  | { ok: false; error: string }

export const quoteService = {
  list(): Quote[] {
    return getQuotes().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  getById(id: string): Quote | undefined {
    return getQuotes().find((q) => q.id === id)
  },

  search(query: string): Quote[] {
    const q = normalizeSearch(query)
    if (!q) return this.list()
    return this.list().filter((quote) => {
      const customer = customerService.getById(quote.customerId)
      const vehicle = vehicleService.getById(quote.vehicleId)
      const hay = normalizeSearch(
        `${quote.number} ${customer?.name ?? ''} ${customer?.phone ?? ''} ${customer?.whatsapp ?? ''} ${vehicle?.plate ?? ''} ${vehicle?.brand ?? ''} ${vehicle?.model ?? ''}`,
      )
      return hay.includes(q)
    })
  },

  filterByStatus(status: QuoteFilterStatus): Quote[] {
    if (status === 'ALL') return this.list()
    if (status === 'EXPIRED') {
      return this.list().filter((q) => isQuoteExpired(q))
    }
    return this.list().filter((q) => {
      if (isQuoteExpired(q)) return false
      return q.status === status
    })
  },

  create(input: {
    customerId: string
    vehicleId: string
    issueDate?: string
    validUntil?: string
    customerRequest?: string
    notes?: string
    items?: QuoteItem[]
    discount?: number
    status?: QuoteStatus
  }): Quote {
    const quotes = getQuotes()
    const issueDate = input.issueDate ?? todayISODate()
    const items = input.items ?? []
    const totals = calcOrderTotals(items, input.discount ?? 0)

    const quote: Quote = {
      id: generateId('quote'),
      number: nextQuoteNumber(),
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      status: input.status ?? 'DRAFT',
      issueDate,
      validUntil: input.validUntil ?? addDays(issueDate, DEFAULT_QUOTE_VALIDITY_DAYS),
      customerRequest: input.customerRequest ?? '',
      notes: input.notes ?? '',
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }

    quotes.push(quote)
    save(quotes)
    return quote
  },

  update(id: string, data: Partial<Quote>): Quote | undefined {
    const quotes = getQuotes()
    const index = quotes.findIndex((q) => q.id === id)
    if (index < 0) return undefined

    const current = quotes[index]
    if (current.status === 'CONVERTED') {
      return current
    }

    const { status: nextStatus, ...rest } = data
    let quote: Quote = { ...current, ...rest, id, status: current.status }

    if (nextStatus && nextStatus !== current.status) {
      const allowed = ALLOWED_TRANSITIONS[current.status]
      if (allowed.includes(nextStatus) && nextStatus !== 'CONVERTED') {
        quote = { ...quote, status: nextStatus }
      }
    }

    if (rest.items) {
      quote = withTotals(quote, rest.items, rest.discount ?? quote.discount)
    } else if (rest.discount !== undefined) {
      quote = withTotals(quote, quote.items, rest.discount)
    }

    quotes[index] = { ...quote, updatedAt: nowISO() }
    save(quotes)
    return quotes[index]
  },

  updateStatus(id: string, status: QuoteStatus): Quote | undefined {
    const quotes = getQuotes()
    const index = quotes.findIndex((q) => q.id === id)
    if (index < 0) return undefined

    const current = quotes[index]
    if (current.status === 'CONVERTED') return current
    if (status === 'CONVERTED') return current

    const allowed = ALLOWED_TRANSITIONS[current.status]
    if (!allowed.includes(status)) return current

    quotes[index] = { ...current, status, updatedAt: nowISO() }
    save(quotes)
    return quotes[index]
  },

  remove(id: string): boolean {
    const quotes = getQuotes()
    const quote = quotes.find((q) => q.id === id)
    if (!quote || quote.status === 'CONVERTED') return false
    const next = quotes.filter((q) => q.id !== id)
    save(next)
    return true
  },

  convertToServiceOrder(quoteId: string): ConvertQuoteResult {
    const quotes = getQuotes()
    const index = quotes.findIndex((q) => q.id === quoteId)
    if (index < 0) return { ok: false, error: 'Orçamento não encontrado.' }

    const quote = quotes[index]
    if (quote.status === 'CONVERTED' || quote.convertedServiceOrderId) {
      return { ok: false, error: 'Este orçamento já foi convertido em Ordem de Serviço.' }
    }
    if (quote.status !== 'APPROVED') {
      return { ok: false, error: 'Somente orçamentos aprovados podem ser convertidos.' }
    }

    const stockWarnings: string[] = []
    for (const item of quote.items) {
      if (item.type !== 'PRODUCT') continue
      const product = productService.getById(item.referenceId)
      if (!product) {
        stockWarnings.push(`${item.description}: produto não encontrado no estoque.`)
        continue
      }
      if (product.stock < item.quantity) {
        stockWarnings.push(
          `${item.description}: estoque insuficiente (disponível: ${product.stock}, necessário: ${item.quantity}).`,
        )
      }
    }

    const items = cloneItems(quote.items)

    let order: ServiceOrder
    try {
      order = serviceOrderService.create({
        customerId: quote.customerId,
        vehicleId: quote.vehicleId,
        customerRequest: quote.customerRequest,
        internalNotes: quote.notes
          ? `Originada do orçamento #${quote.number}. ${quote.notes}`
          : `Originada do orçamento #${quote.number}.`,
        items,
        discount: quote.discount,
        status: 'OPEN',
        sourceQuoteId: quote.id,
        sourceQuoteNumber: quote.number,
      })
    } catch {
      return { ok: false, error: 'Falha ao criar a Ordem de Serviço. O orçamento não foi alterado.' }
    }

    const updatedQuote: Quote = {
      ...quote,
      status: 'CONVERTED',
      convertedServiceOrderId: order.id,
      convertedServiceOrderNumber: order.number,
      updatedAt: nowISO(),
    }

    const latestQuotes = getQuotes()
    const latestIndex = latestQuotes.findIndex((q) => q.id === quoteId)
    if (latestIndex < 0) {
      serviceOrderService.remove(order.id)
      return { ok: false, error: 'Falha ao atualizar o orçamento. A conversão foi revertida.' }
    }

    latestQuotes[latestIndex] = updatedQuote
    save(latestQuotes)

    return { ok: true, quote: updatedQuote, order, stockWarnings }
  },
}
