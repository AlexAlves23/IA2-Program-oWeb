# Loja – API + Front-end

Projeto da aula (React + Node/Express/Sequelize/MariaDB) com CRUD de produtos, imagens, carrinho e vendas.

## Estrutura
```
API/                 Express + Sequelize (model / controller / router)
front_end/aula2/     React (create-react-app)
```

## Como rodar
**Banco:** MariaDB com um banco chamado `loja` (usuário/senha `root`/`root`, como em `API/db/conn.js`).

> Se a tabela `Produtos` já existia da aula, adicione a coluna nova:
> `ALTER TABLE Produtos ADD COLUMN imagem VARCHAR(255) NULL;` (ou apague a tabela e deixe o Sequelize recriar).

```bash
cd API
npm install
npm start            # http://localhost:5000

cd front_end/aula2
npm install
npm start            # http://localhost:3000
```

## Telas
| Rota | O que é |
|---|---|
| `/home` | Painel de vendas: produtos, carrinho e finalização da venda |
| `/produtos` | CRUD de produtos com imagem (.jpeg/.png) |

## Endpoints
**Produto** `/produto` — `POST /create`, `GET /getAll`, `GET /getById/:id`, `PATCH /update/:id`, `DELETE /delete/:id`
(`create` e `update` usam `multipart/form-data`: `nome`, `preco`, `imagem`)

**Carrinho** `/carrinho`
- `POST /create` – cria carrinho
- `GET /getById/:id` – itens, subtotais e total
- `POST /addItem/:id` – `{ produtoId, quantidade }`
- `PATCH /updateItem/:id/:itemId` – `{ quantidade }`
- `DELETE /removeItem/:id/:itemId`
- `DELETE /clear/:id`

**Venda** `/venda`
- `POST /checkout` – `{ carrinhoId, nomeCliente, formaPagamento: pix|cartao|boleto }`
- `GET /getAll`, `GET /getById/:id`

## Validações
- Imagem: apenas JPEG (.jpeg/.jpg) e PNG, até 5 MB — conferida no front e na API (tipo, extensão e conteúdo real do arquivo).
- Preço: não aceita negativo (front bloqueia o `-` e valida; API responde 422).
