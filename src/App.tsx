import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/layouts/AppLayout'
import { ensureDatabase } from '@/services'
import { DashboardPage } from '@/pages/DashboardPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { CustomerDetailPage } from '@/pages/CustomerDetailPage'
import { VehiclesPage } from '@/pages/VehiclesPage'
import { VehicleDetailPage } from '@/pages/VehicleDetailPage'
import { ServiceOrdersPage } from '@/pages/ServiceOrdersPage'
import { ServiceOrderNewPage } from '@/pages/ServiceOrderNewPage'
import { ServiceOrderDetailPage } from '@/pages/ServiceOrderDetailPage'
import { ServiceOrderEditPage } from '@/pages/ServiceOrderEditPage'
import { ServiceOrderPrintPage } from '@/pages/ServiceOrderPrintPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { StockPage } from '@/pages/StockPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

ensureDatabase()

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" closeButton />
      <Routes>
        <Route path="/ordens/:id/imprimir" element={<ServiceOrderPrintPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ordens" element={<ServiceOrdersPage />} />
          <Route path="/ordens/nova" element={<ServiceOrderNewPage />} />
          <Route path="/ordens/:id" element={<ServiceOrderDetailPage />} />
          <Route path="/ordens/:id/editar" element={<ServiceOrderEditPage />} />
          <Route path="/clientes" element={<CustomersPage />} />
          <Route path="/clientes/:id" element={<CustomerDetailPage />} />
          <Route path="/veiculos" element={<VehiclesPage />} />
          <Route path="/veiculos/:id" element={<VehicleDetailPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/estoque" element={<StockPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
