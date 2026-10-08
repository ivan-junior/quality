import type { ServiceOrderStatus, StockStatus } from '@/types'

export const BRAND = {
  name: 'Quality Sound & Film',
  tagline: 'Sistema de Gestão',
  phone: '3024-0724',
  primary: '#65B32E',
  logo: '/quality-logo.png',
} as const

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
