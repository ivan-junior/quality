import type {
  QuoteStatus,
  ServiceOrderStatus,
  StockStatus,
  WarrantyStatus,
} from '@/types'
import type { CompanySettings } from '@/types'

export const BRAND = {
  name: 'Quality Sound & Film',
  tagline: 'Sistema de Gestão',
  phone: '3024-0724',
  primary: '#65B32E',
  logo: '/quality-logo.png',
} as const

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: BRAND.name,
  phone: BRAND.phone,
  whatsapp: '5516993875462',
  instagram: '@qualitysomeacessorios',
  facebook: '@qualitysomacessorios',
  website: 'https://qualitysoundefilm.com.br',
  googleReviewUrl: 'https://avalienogoogle.com.br/quality-sound-film',
  address: 'Rua Espírito Santo, 1407 — Ipiranga, Ribeirão Preto-SP',
  logo: BRAND.logo,
}

export const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  WAITING_PART: 'Aguardando peça',
  FINISHED: 'Finalizada',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelada',
}

export const STATUS_COLORS: Record<ServiceOrderStatus, string> = {
  OPEN: 'bg-sky-100 text-sky-800 border-sky-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
  WAITING_PART: 'bg-orange-100 text-orange-800 border-orange-200',
  FINISHED: 'bg-primary-light text-primary-dark border-primary/30',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus | 'EXPIRED', string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
  CONVERTED: 'Convertido em OS',
}

export const QUOTE_STATUS_COLORS: Record<QuoteStatus | 'EXPIRED', string> = {
  DRAFT: 'bg-slate-100 text-slate-800 border-slate-200',
  SENT: 'bg-sky-100 text-sky-800 border-sky-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  EXPIRED: 'bg-orange-100 text-orange-800 border-orange-200',
  CONVERTED: 'bg-primary-light text-primary-dark border-primary/30',
}

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string> = {
  ACTIVE: 'Em garantia',
  EXPIRED: 'Garantia vencida',
  NOT_STARTED: 'Garantia ainda não iniciada',
  NOT_INFORMED: 'Garantia não informada',
}

export const WARRANTY_STATUS_COLORS: Record<WarrantyStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  EXPIRED: 'bg-red-100 text-red-800 border-red-200',
  NOT_STARTED: 'bg-amber-100 text-amber-800 border-amber-200',
  NOT_INFORMED: 'bg-slate-100 text-slate-700 border-slate-200',
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  NORMAL: 'Normal',
  LOW: 'Baixo',
  OUT: 'Sem estoque',
}

export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  NORMAL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  LOW: 'bg-amber-100 text-amber-800 border-amber-200',
  OUT: 'bg-red-100 text-red-800 border-red-200',
}

export const PRODUCT_CATEGORIES = [
  'Multimídia',
  'Som',
  'Alto-falantes',
  'Câmeras',
  'Alarmes',
  'Sensores',
  'Iluminação',
  'Acessórios',
  'Insulfilm',
  'Outros',
] as const

export const SERVICE_CATEGORIES = [
  'Instalação',
  'Manutenção',
  'Diagnóstico',
  'Insulfilm',
  'Elétrica',
  'Outros',
] as const

export const DEFAULT_QUOTE_VALIDITY_DAYS = 7
