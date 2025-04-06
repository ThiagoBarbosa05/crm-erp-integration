# Integração CRM (Ploomes) - ERP (Bling)

<p>Ferramenta de integração entre o CRM Ploomes e o ERP Bling para criação de contatos e tarefas.</p>

## ✅ Requisitos funcionais

1. A integração deve consultar as notas fiscais emitidas no ERP a cada dia.
2. Ao detectar uma nova nota fiscal, a integração deve:

   - Verificar se o cliente já existe no CRM.
   - Se não existir, criar um novo cliente no CRM com os dados da nota.
   - Criar uma tarefa associada a esse cliente no CRM.

3. A integração deve realizar chamadas à API do ERP (Bling) usando autenticação por token e à API do CRM (Ploomes) usando User Key:

   - Buscar access token armazenado no DynamoDB
   - Enviar access token no Header da requisição utilizando o formato Bearer
     token
   - Enviar User Key no Header da requisição
     - exemplo: `User-Key: ploomes-user-key`

4. Delay de 1 segundos para cada busca de cliente na API do Bling para evitar Timeout.
5. A integração deve retornar um status de sucesso ou erro após cada execução.

## 🛠️ Requisitos não funcionais

1. Todas as ações (criação de cliente, tarefas) devem ser logadas.
2. Logs no CloudWatch + métricas customizadas (tempo exec., falhas, etc).

## 🗺️ Diagrama

![Diagrama da arqitetura](./diagram.svg)
