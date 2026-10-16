import type { Quote, QuoteItem, QuoteStatus, WarrantyUnit } from '@/types'

function qItem(
  id: string,
  type: 'PRODUCT' | 'SERVICE',
  referenceId: string,
  description: string,
  quantity: number,
  unitPrice: number,
  discount = 0,
  warranty?: {
    duration: number
    unit: WarrantyUnit
    startDate: string
    endDate: string
  },
): QuoteItem {
  return {
    id,
    type,
    referenceId,
    description,
    quantity,
    unitPrice,
    discount,
    total: quantity * unitPrice - discount,
    ...(warranty
      ? {
          warrantyDuration: warranty.duration,
          warrantyUnit: warranty.unit,
          warrantyStartDate: warranty.startDate,
          warrantyEndDate: warranty.endDate,
        }
      : {}),
  }
}

function quote(partial: {
  id: string
  number: string
  customerId: string
  vehicleId: string
  status: QuoteStatus
  issueDate: string
  validUntil: string
  customerRequest: string
  notes?: string
  items: QuoteItem[]
  discount?: number
  convertedServiceOrderId?: string
  convertedServiceOrderNumber?: string
  createdAt: string
  updatedAt: string
}): Quote {
  const discount = partial.discount ?? 0
  const subtotal = partial.items.reduce((sum, i) => sum + i.total, 0)
  return {
    id: partial.id,
    number: partial.number,
    customerId: partial.customerId,
    vehicleId: partial.vehicleId,
    status: partial.status,
    issueDate: partial.issueDate,
    validUntil: partial.validUntil,
    customerRequest: partial.customerRequest,
    notes: partial.notes ?? '',
    items: partial.items,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    convertedServiceOrderId: partial.convertedServiceOrderId,
    convertedServiceOrderNumber: partial.convertedServiceOrderNumber,
    createdAt: partial.createdAt,
    updatedAt: partial.updatedAt,
  }
}

export const seedQuotes: Quote[] = [
  quote({
    id: 'quote_045',
    number: '00045',
    customerId: 'cust_001',
    vehicleId: 'veh_001',
    status: 'CONVERTED',
    issueDate: '2026-09-28',
    validUntil: '2026-10-05',
    customerRequest:
      'Cliente solicita instalação de multimídia e verificação da câmera de ré, que apresenta falhas intermitentes.',
    notes: 'Orçamento convertido na OS #00128.',
    items: [
      qItem('qi_045_1', 'PRODUCT', 'prod_001', 'Multimídia Pioneer DMH-A4480BT', 1, 1800, 0, {
        duration: 12,
        unit: 'MONTHS',
        startDate: '2026-10-05',
        endDate: '2027-10-05',
      }),
      qItem('qi_045_2', 'PRODUCT', 'prod_003', 'Câmera de Ré Universal', 1, 180, 0, {
        duration: 6,
        unit: 'MONTHS',
        startDate: '2026-10-05',
        endDate: '2027-04-05',
      }),
      qItem('qi_045_3', 'SERVICE', 'svc_001', 'Instalação de multimídia', 1, 250),
    ],
    convertedServiceOrderId: 'os_001',
    convertedServiceOrderNumber: '00128',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z',
  }),
  quote({
    id: 'quote_046',
    number: '00046',
    customerId: 'cust_002',
    vehicleId: 'veh_002',
    status: 'APPROVED',
    issueDate: '2026-10-10',
    validUntil: '2026-10-17',
    customerRequest: 'Instalação de alarme automotivo.',
    notes: 'Cliente aprovou por WhatsApp.',
    items: [
      qItem('qi_046_1', 'PRODUCT', 'prod_005', 'Alarme Positron Exact 360', 1, 450, 0, {
        duration: 12,
        unit: 'MONTHS',
        startDate: '2026-10-17',
        endDate: '2027-10-17',
      }),
      qItem('qi_046_2', 'SERVICE', 'svc_004', 'Instalação de alarme', 1, 200),
    ],
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-10-12T15:00:00.000Z',
  }),
  quote({
    id: 'quote_047',
    number: '00047',
    customerId: 'cust_003',
    vehicleId: 'veh_004',
    status: 'SENT',
    issueDate: '2026-10-12',
    validUntil: '2026-10-19',
    customerRequest: 'Orçamento para multimídia com câmera de ré.',
    items: [
      qItem('qi_047_1', 'PRODUCT', 'prod_002', 'Multimídia Pioneer DMH-Z5380TV', 1, 2400, 100, {
        duration: 12,
        unit: 'MONTHS',
        startDate: '2026-10-20',
        endDate: '2027-10-20',
      }),
      qItem('qi_047_2', 'PRODUCT', 'prod_003', 'Câmera de Ré Universal', 1, 180),
      qItem('qi_047_3', 'SERVICE', 'svc_001', 'Instalação de multimídia', 1, 250),
    ],
    createdAt: '2026-10-12T09:30:00.000Z',
    updatedAt: '2026-10-12T09:30:00.000Z',
  }),
  quote({
    id: 'quote_048',
    number: '00048',
    customerId: 'cust_004',
    vehicleId: 'veh_005',
    status: 'DRAFT',
    issueDate: '2026-10-15',
    validUntil: '2026-10-22',
    customerRequest: 'Rastreador e instalação.',
    items: [
      qItem('qi_048_1', 'PRODUCT', 'prod_010', 'Rastreador Veicular', 1, 380),
      qItem('qi_048_2', 'SERVICE', 'svc_008', 'Instalação de rastreador', 1, 150),
    ],
    createdAt: '2026-10-15T14:00:00.000Z',
    updatedAt: '2026-10-15T14:00:00.000Z',
  }),
  quote({
    id: 'quote_049',
    number: '00049',
    customerId: 'cust_005',
    vehicleId: 'veh_006',
    status: 'REJECTED',
    issueDate: '2026-09-20',
    validUntil: '2026-09-27',
    customerRequest: 'Som completo com amplificador.',
    notes: 'Cliente optou por outra oficina.',
    items: [
      qItem('qi_049_1', 'PRODUCT', 'prod_008', 'Módulo Amplificador Taramps', 1, 520),
      qItem('qi_049_2', 'PRODUCT', 'prod_006', 'Kit Alto-Falante JBL Stage', 1, 580),
      qItem('qi_049_3', 'SERVICE', 'svc_005', 'Instalação de som', 1, 300),
    ],
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-25T16:00:00.000Z',
  }),
  quote({
    id: 'quote_050',
    number: '00050',
    customerId: 'cust_006',
    vehicleId: 'veh_007',
    status: 'SENT',
    issueDate: '2026-09-01',
    validUntil: '2026-09-08',
    customerRequest: 'Insulfilm G5 nos vidros laterais e traseiro.',
    notes: 'Validade expirada — aguardando retorno do cliente.',
    items: [
      qItem('qi_050_1', 'PRODUCT', 'prod_012', 'Insulfilm G5 Rolo 1,5m', 1, 420),
      qItem('qi_050_2', 'SERVICE', 'svc_007', 'Aplicação de insulfilm', 1, 450),
    ],
    createdAt: '2026-09-01T11:00:00.000Z',
    updatedAt: '2026-09-01T11:00:00.000Z',
  }),
  quote({
    id: 'quote_051',
    number: '00051',
    customerId: 'cust_007',
    vehicleId: 'veh_008',
    status: 'DRAFT',
    issueDate: '2026-08-15',
    validUntil: '2026-08-22',
    customerRequest: 'Sensor de estacionamento.',
    items: [
      qItem('qi_051_1', 'PRODUCT', 'prod_004', 'Sensor de Estacionamento 4 Pontos', 1, 250),
      qItem('qi_051_2', 'SERVICE', 'svc_003', 'Instalação de sensor de estacionamento', 1, 180),
    ],
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
  }),
  quote({
    id: 'quote_052',
    number: '00052',
    customerId: 'cust_008',
    vehicleId: 'veh_009',
    status: 'APPROVED',
    issueDate: '2026-10-14',
    validUntil: '2026-10-21',
    customerRequest: 'Kit LED H7 e instalação.',
    items: [
      qItem('qi_052_1', 'PRODUCT', 'prod_009', 'Kit LED H7', 1, 160, 0, {
        duration: 90,
        unit: 'DAYS',
        startDate: '2026-10-21',
        endDate: '2027-01-19',
      }),
      qItem('qi_052_2', 'SERVICE', 'svc_011', 'Instalação de LED / faróis', 1, 100),
    ],
    createdAt: '2026-10-14T13:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  }),
  quote({
    id: 'quote_053',
    number: '00053',
    customerId: 'cust_009',
    vehicleId: 'veh_010',
    status: 'SENT',
    issueDate: '2026-10-13',
    validUntil: '2026-10-20',
    customerRequest: 'Câmera de ré e instalação.',
    items: [
      qItem('qi_053_1', 'PRODUCT', 'prod_003', 'Câmera de Ré Universal', 1, 180, 0, {
        duration: 6,
        unit: 'MONTHS',
        startDate: '2026-10-20',
        endDate: '2027-04-20',
      }),
      qItem('qi_053_2', 'SERVICE', 'svc_002', 'Instalação de câmera de ré', 1, 150),
    ],
    createdAt: '2026-10-13T08:00:00.000Z',
    updatedAt: '2026-10-13T08:00:00.000Z',
  }),
  quote({
    id: 'quote_054',
    number: '00054',
    customerId: 'cust_010',
    vehicleId: 'veh_011',
    status: 'REJECTED',
    issueDate: '2026-10-01',
    validUntil: '2026-10-08',
    customerRequest: 'Troca de multimídia antiga.',
    notes: 'Preço acima do esperado pelo cliente.',
    items: [
      qItem('qi_054_1', 'PRODUCT', 'prod_001', 'Multimídia Pioneer DMH-A4480BT', 1, 1800),
      qItem('qi_054_2', 'SERVICE', 'svc_001', 'Instalação de multimídia', 1, 250),
    ],
    discount: 50,
    createdAt: '2026-10-01T16:00:00.000Z',
    updatedAt: '2026-10-03T11:00:00.000Z',
  }),
  quote({
    id: 'quote_055',
    number: '00055',
    customerId: 'cust_011',
    vehicleId: 'veh_012',
    status: 'DRAFT',
    issueDate: '2026-10-16',
    validUntil: '2026-10-23',
    customerRequest: 'Diagnóstico elétrico e orçamento de reparo.',
    items: [qItem('qi_055_1', 'SERVICE', 'svc_009', 'Manutenção elétrica', 1, 180)],
    createdAt: '2026-10-16T09:00:00.000Z',
    updatedAt: '2026-10-16T09:00:00.000Z',
  }),
  quote({
    id: 'quote_056',
    number: '00056',
    customerId: 'cust_012',
    vehicleId: 'veh_013',
    status: 'APPROVED',
    issueDate: '2026-10-08',
    validUntil: '2026-10-15',
    customerRequest: 'Módulo amplificador e instalação.',
    items: [
      qItem('qi_056_1', 'PRODUCT', 'prod_008', 'Módulo Amplificador Taramps', 1, 520, 0, {
        duration: 3,
        unit: 'MONTHS',
        startDate: '2026-10-15',
        endDate: '2027-01-15',
      }),
      qItem('qi_056_2', 'SERVICE', 'svc_006', 'Instalação de módulo', 1, 120),
    ],
    createdAt: '2026-10-08T12:00:00.000Z',
    updatedAt: '2026-10-10T09:00:00.000Z',
  }),
  quote({
    id: 'quote_057',
    number: '00057',
    customerId: 'cust_013',
    vehicleId: 'veh_014',
    status: 'SENT',
    issueDate: '2026-07-10',
    validUntil: '2026-07-17',
    customerRequest: 'Alarme completo.',
    items: [
      qItem('qi_057_1', 'PRODUCT', 'prod_005', 'Alarme Positron Exact 360', 1, 450),
      qItem('qi_057_2', 'SERVICE', 'svc_004', 'Instalação de alarme', 1, 200),
    ],
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
  }),
  quote({
    id: 'quote_058',
    number: '00058',
    customerId: 'cust_014',
    vehicleId: 'veh_015',
    status: 'DRAFT',
    issueDate: '2026-10-16',
    validUntil: '2026-10-23',
    customerRequest: 'Som + amplificador para pickup.',
    items: [
      qItem('qi_058_1', 'PRODUCT', 'prod_008', 'Módulo Amplificador Taramps', 1, 520),
      qItem('qi_058_2', 'PRODUCT', 'prod_006', 'Kit Alto-Falante JBL Stage', 2, 580),
      qItem('qi_058_3', 'SERVICE', 'svc_005', 'Instalação de som', 1, 300),
    ],
    createdAt: '2026-10-16T11:30:00.000Z',
    updatedAt: '2026-10-16T11:30:00.000Z',
  }),
  quote({
    id: 'quote_059',
    number: '00059',
    customerId: 'cust_003',
    vehicleId: 'veh_004',
    status: 'CONVERTED',
    issueDate: '2026-08-01',
    validUntil: '2026-08-08',
    customerRequest: 'Aplicação de insulfilm G20.',
    notes: 'Convertido na OS #00280.',
    items: [
      qItem('qi_059_1', 'PRODUCT', 'prod_011', 'Insulfilm G20 Rolo 1,5m', 1, 350, 0, {
        duration: 12,
        unit: 'MONTHS',
        startDate: '2026-08-15',
        endDate: '2027-08-15',
      }),
      qItem('qi_059_2', 'SERVICE', 'svc_007', 'Aplicação de insulfilm', 1, 100),
    ],
    convertedServiceOrderId: 'os_005',
    convertedServiceOrderNumber: '00280',
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
  }),
]
