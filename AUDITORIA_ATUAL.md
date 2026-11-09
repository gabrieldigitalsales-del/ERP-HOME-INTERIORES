# Auditoria atual — HOME ERP 2.19.0

## Base analisada
- ERP Home Interiores: projeto existente, preservado.
- ERP Lux Decor: usado somente como referência funcional e de usabilidade.
- Backup Git criado antes das alterações: `backup-before-lux-sync-2026-11-09`.

## Resultado
- Build de produção Vercel: aprovado.
- Release-check: 21/21 verificações aprovadas.
- Auditoria estática: aprovada.
- Identidade Home Interiores preservada.
- Nenhum dado da Lux Decor foi importado para a Home.

## Principais validações
- Venda somente pelo Caixa.
- Fluxo do PDV: produto → vendedora → cliente → PAGAMENTO → finalizar.
- Um único botão PAGAMENTO no fluxo principal.
- Produto sem estoque bloqueado, salvo regra de encomenda.
- Produto com preço pendente pode entrar no carrinho e recebe preço no pagamento.
- Pagamento misto, cartão parcelado e troco preservados.
- Vendedora ativa/PIN/auditoria preservados.
- Produtos e Estoque unificados na navegação e usando a mesma base.
- Movimentações e inventário preservados.
- Histórico de vendas sem segunda rota de venda.
- Notificações operacionais sem fiscal/NCM.
- NCM, NF-e, NFC-e e configurações fiscais removidos da interface.
- Dados fiscais históricos locais não são apagados pela atualização.
- Loading da Home aparece antes do login.

## Persistência
A versão atual do repositório Home continua usando armazenamento local/IndexedDB. A camada Supabase existente no ERP Lux Decor não foi copiada, evitando misturar projetos, tabelas ou credenciais. Uma futura migração cloud da Home deve usar recursos exclusivos do HOME ERP e backup prévio.

## Observação
O bundle principal ainda é grande e o Vite emite aviso de chunk acima de 500 kB. Não impede o build, mas code splitting é uma melhoria futura recomendada.
