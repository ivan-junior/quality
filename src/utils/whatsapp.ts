import { formatCurrency, formatDate, onlyDigits } from '@/utils/format'

export function normalizeBrazilWhatsApp(phone: string): string | null {
  let digits = onlyDigits(phone)
  if (!digits) return null

  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(0, 13)
  } else if (digits.length >= 10 && digits.length <= 11) {
    digits = `55${digits}`
  } else {
    return null
  }

  if (digits.length < 12 || digits.length > 13) return null
  return digits
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const normalized = normalizeBrazilWhatsApp(phone)
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function buildQuoteWhatsAppMessage(input: {
  customerName: string
  quoteNumber: string
  vehicleLabel: string
  plate: string
  total: number
  validUntil: string
}): string {
  const firstName = input.customerName.split(' ')[0] || input.customerName
  return [
    `Olá, ${firstName}! Tudo bem?`,
    '',
    'Aqui é da Quality Sound & Film.',
    '',
    `Seu orçamento #${input.quoteNumber} está pronto!`,
    '',
    `Veículo: ${input.vehicleLabel} - ${input.plate}`,
    '',
    `Valor total: ${formatCurrency(input.total)}`,
    `Validade: ${formatDate(input.validUntil)}`,
    '',
    'Qualquer dúvida, estamos à disposição!',
    '',
    'Quality Sound & Film',
  ].join('\n')
}

export function buildOrderWhatsAppMessage(input: {
  customerName: string
  orderNumber: string
  vehicleLabel: string
  plate: string
  total: number
}): string {
  const firstName = input.customerName.split(' ')[0] || input.customerName
  return [
    `Olá, ${firstName}!`,
    '',
    'Aqui é da Quality Sound & Film.',
    '',
    `Segue o resumo da sua Ordem de Serviço #${input.orderNumber}.`,
    '',
    `Veículo: ${input.vehicleLabel} - ${input.plate}`,
    `Valor total: ${formatCurrency(input.total)}`,
    '',
    'Obrigado pela preferência!',
  ].join('\n')
}
