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
- react-qr-code (QR de avaliação nos PDFs)

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
  components/     # UI compartilhada (StatusBadge, LineItemsEditor, NumberInput…)
  components/ui/  # Botões, dialogs, tables, selects etc.
  layouts/        # AppLayout (sidebar + header)
  pages/          # Telas do sistema (OS, orçamentos, configs…)
  services/       # Camada de acesso a dados (pronta para trocar por HTTP)
  storage/        # Abstração do localStorage + migração
  mocks/          # Seeds fixos de demonstração
  types/          # Tipagens TypeScript das entidades
  utils/          # Máscaras, datas, moeda, garantia, WhatsApp
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
- 32+ ordens de serviço (com exemplos de garantia vigente e vencida)
- 15 orçamentos em diversos status
- movimentações de estoque
- configurações da empresa (defaults)

Os IDs são **fixos** e os relacionamentos são coerentes. Exemplo de demonstração:

| Entidade | Valor |
|----------|-------|
| Cliente | João da Silva (`cust_001`) |
| Veículo | Honda Civic Touring 2020 |
| Placa | **ABC1D23** |
| Orçamento | `#00045` (convertido) |
| OS | `#00128` (finalizada, originada do orçamento) |

Os mocks **não** são regenerados a cada refresh. Se o storage já existir na versão anterior, a migração v2 adiciona orçamentos e configurações sem apagar os dados atuais.

## Como funciona o localStorage

Chaves versionadas sob o prefixo `quality.v1.*`:

- `quality.v1.customers`
- `quality.v1.vehicles`
- `quality.v1.products`
- `quality.v1.services`
- `quality.v1.orders`
- `quality.v1.quotes`
- `quality.v1.stockMovements`
- `quality.v1.companySettings`
- `quality.v1.meta` (`version: 2`)

Os **services** centralizam leitura/escrita. As páginas não acessam `localStorage` diretamente.

### Baixa automática de estoque

Ao alterar o status de uma OS para **Finalizada** ou **Entregue**, os itens do tipo `PRODUCT` geram movimentações de saída — apenas se `stockDeducted` ainda for `false`. Orçamentos e a conversão orçamento→OS **não** descontam estoque.

### Garantia de produtos

Nos itens `PRODUCT` da OS/orçamento é possível informar duração (dias/meses), unidade e data de início. O vencimento é calculado e armazenado. O status (em garantia / vencida / etc.) é calculado na tela com base na data atual — não é um campo salvo.

### Orçamentos → OS

Orçamentos aprovados podem ser convertidos em OS. A operação é atômica: cria a OS, marca o orçamento como convertido e grava os vínculos. Conversão duplicada é bloqueada.

### WhatsApp

Os botões abrem `wa.me` com mensagem pronta. O PDF deve ser baixado e anexado manualmente — não há envio automático de arquivos.

## Como restaurar os dados de demonstração

1. Abra **Configurações** no menu lateral
2. Clique em **Restaurar dados de demonstração**
3. Confirme no modal

Isso limpa o storage e reinsere todos os mocks (incluindo orçamentos e garantias).

## Principais funcionalidades

- Dashboard com cards, OS recentes, estoque baixo e resumo por status
- Busca global (Ctrl+K): cliente, telefone, CPF, placa, OS e orçamentos
- Clientes e veículos com histórico
- Ordens de Serviço com wizard (cliente → veículo → itens + garantia)
- Orçamentos com status, validade, PDF, WhatsApp e conversão em OS
- Impressão / PDF (OS e orçamento) via `@media print`
- QR Code de avaliação e redes sociais nos documentos (quando configurados)
- Produtos, serviços e estoque com movimentações
- Inputs numéricos com edição confortável (`NumberInput`)
- Interface responsiva

### Roteiro sugerido de demonstração

1. Abrir o Dashboard  
2. Buscar a placa `ABC1D23`  
3. Abrir o orçamento `#00045` e a OS `#00128` (vínculo)  
4. Conferir garantias vigentes na OS `#00128` e vencidas na `#00294`  
5. Criar um orçamento, gerar PDF e abrir WhatsApp  
6. Aprovar e converter em OS  
7. Em Configurações, cadastrar link de avaliação e gerar PDF da OS (QR Code)  
8. Criar produto/OS editando preços e quantidades sem travar no zero  
9. Restaurar dados de demonstração ao final  

## Próximos passos (backend)

Quando houver API real:

1. Manter as interfaces dos `services/`
2. Trocar implementações localStorage por `fetch`/`axios`
3. Adicionar autenticação e permissões
4. Armazenamento público de PDFs / WhatsApp Business API (se necessário)
5. Remover seeds do frontend (ou usá-los só em ambiente de demo)

## Identidade visual

- Verde principal: `#65B32E`
- Sidebar grafite/preto
- Conteúdo claro e profissional
- Logo: `/quality-logo.png`

Veja também o [CHANGELOG.md](./CHANGELOG.md).
