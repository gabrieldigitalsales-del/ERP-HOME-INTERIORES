# HOME ERP — Home Interiores

ERP/PDV personalizado da Home Interiores, desenvolvido pela NEXOR.

## Versão
2.19.0

## Módulos principais
- Dashboard
- Caixa / PDV
- Histórico de vendas
- Pedidos
- Vendedoras
- Produtos e Estoque
- Movimentações
- Compras
- Clientes
- Fornecedores
- Financeiro
- Pós-venda
- Relatórios
- Configurações

## Fluxo de venda
Produto → Vendedora → Cliente → Pagamento → Finalizar venda.

A venda é realizada exclusivamente pelo Caixa. O histórico de vendas é destinado a consulta, rastreabilidade, troca autorizada de vendedora e cancelamento controlado.

## Fiscal
A versão atual não exibe NCM, NF-e, NFC-e ou etapas fiscais no fluxo operacional.

## Desenvolvimento
```bash
npm install
npm run dev
```

## Validação de release
```bash
npm run audit
npm run test:release
npm run build
```

O comando de build executa o release-check antes de gerar a versão de produção.

## Publicação
Projeto React + Vite integrado ao GitHub e Vercel.

## Dados
A versão atual utiliza armazenamento local e IndexedDB. Não utiliza o banco da Lux Decor e não compartilha namespaces de dados com outros ERPs.
