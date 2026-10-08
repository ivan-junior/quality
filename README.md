# Quality Sound & Film — Sistema de Gestão (MVP Frontend)

MVP frontend para demonstração do sistema de gestão da **Quality Sound & Film** (Ribeirão Preto/SP).

> Apenas frontend. Dados mockados com persistência em `localStorage`. Sem backend, banco ou autenticação real.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Lucide React
- Componentes no estilo shadcn/ui (Radix)
- Sonner (toasts)

## Como instalar

```bash
npm install
```

## Como executar

```bash
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

### Build de produção

```bash
npm run build
npm run preview
```

## Estrutura do projeto

```
src/
  components/     # UI compartilhada (StatusBadge, GlobalSearch, EmptyState…)
  components/ui/  # Botões, dialogs, tables, selects etc.
  layouts/        # AppLayout (sidebar + header)
  pages/          # Telas do sistema
  services/       # Camada de acesso a dados (pronta para trocar por HTTP)
  storage/        # Abstração do localStorage
  mocks/          # Seeds fixos de demonstração
  types/          # Tipagens TypeScript das entidades
  utils/          # Máscaras, datas, moeda
  hooks/          # Hooks auxiliares
  lib/            # cn(), constantes da marca
public/
  quality-logo.png
```

## Como funcionam os mocks

Na primeira carga, o app chama `ensureDatabase()` e grava no `localStorage` os dados de:

- 21 clientes
- 26 veículos
- 17 produtos
- 12 serviços
- 32 ordens de serviço
- movimentações de estoque

Os IDs são **fixos** e os relacionamentos são coerentes. Exemplo de demonstração:

| Entidade | Valor |
|----------|-------|
| Cliente | João da Silva (`cust_001`) |
| Veículo | Honda Civic Touring 2020 |
| Placa | **ABC1D23** |
| OS | `#00128` (finalizada) e `#00294` (entregue) |

Os mocks **não** são regenerados a cada refresh — só são carregados se o storage ainda não existir.

## Como funciona o localStorage

Chaves versionadas sob o prefixo `quality.v1.*`:

- `quality.v1.customers`
- `quality.v1.vehicles`
- `quality.v1.products`
- `quality.v1.services`
- `quality.v1.orders`
- `quality.v1.stockMovements`
- `quality.v1.meta`

Os **services** (`customerService`, `vehicleService`, `serviceOrderService`, `productService`, `stockService` etc.) centralizam leitura/escrita. As páginas não acessam `localStorage` diretamente.

### Baixa automática de estoque

Ao alterar o status de uma OS para **Finalizada** ou **Entregue**, os itens do tipo `PRODUCT` geram movimentações de saída — apenas se `stockDeducted` ainda for `false`, evitando desconto duplicado.

## Como restaurar os dados de demonstração

1. Abra **Configurações** no menu lateral
2. Clique em **Restaurar dados de demonstração**
3. Confirme no modal

Isso limpa o storage e reinsere todos os mocks originais — útil entre apresentações.

## Principais funcionalidades

- Dashboard com cards, OS recentes, estoque baixo e resumo por status
- Busca global (Ctrl+K): cliente, telefone, CPF, placa, modelo, nº OS
- Clientes com detalhe, veículos e histórico
- Veículos com histórico por placa
- Ordens de Serviço com wizard rápido (cliente → veículo → itens)
- Status com badges e histórico
- Impressão / PDF da OS via `@media print`
- Produtos, serviços e estoque com movimentações
- Página de histórico orientada à placa
- Interface responsiva (sidebar vira menu no mobile)

### Roteiro sugerido de demonstração

1. Abrir o Dashboard  
2. Buscar a placa `ABC1D23`  
3. Abrir o Honda Civic e ver o histórico  
4. Abrir João da Silva e seus veículos  
5. Cadastrar cliente e veículo novos  
6. Criar uma OS com produtos e serviços  
7. Alterar status → Em andamento → Finalizada  
8. Conferir baixa no Estoque  
9. Reabrir o veículo e ver a OS no histórico  
10. Imprimir / gerar PDF da OS  

## Próximos passos (backend)

Quando houver API real:

1. Manter as interfaces dos `services/`
2. Trocar implementações localStorage por `fetch`/`axios`
3. Adicionar autenticação e permissões
4. Migrar uploads, financeiro, orçamentos e NF conforme roadmap
5. Remover seeds do frontend (ou usá-los só em ambiente de demo)

## Identidade visual

- Verde principal: `#65B32E`
- Sidebar grafite/preto
- Conteúdo claro e profissional
- Logo: `/quality-logo.png`
