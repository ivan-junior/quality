# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

## [1.1.0] — 2026-10-16

### Adicionado

- Módulo completo de **Orçamentos** (listagem, cadastro, edição, detalhe, impressão/PDF)
- Conversão atômica de orçamento aprovado em Ordem de Serviço, com vínculo bidirecional
- Garantia de produtos nas OS e orçamentos (duração, unidade, início, vencimento calculado)
- Status visual dinâmico da garantia (em garantia, vencida, não iniciada, não informada)
- Envio de mensagem pronta pelo WhatsApp (OS e orçamento), sem envio automático de PDF
- Configurações editáveis da empresa (telefone, WhatsApp, redes, endereço, link de avaliação)
- QR Code de avaliação do Google no PDF da OS (somente com link válido configurado)
- Redes sociais no rodapé dos documentos impressos
- Componente `NumberInput` para edição confortável de campos numéricos
- 15 orçamentos de demonstração em diversos status, incluindo `#00045` → OS `#00128`
- Migração de storage para `meta.version` 2 (quotes + companySettings sem apagar dados existentes)
- Busca global também cobre orçamentos

### Alterado

- PDF da OS passa a exibir dados de garantia informados (sem status estático “Em garantia”)
- Restaurar dados de demonstração inclui orçamentos e garantias
- README atualizado com as novas funcionalidades

### Corrigido

- Campos numéricos que forçavam `0` ao apagar e atrapalhavam a digitação
