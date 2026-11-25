//controller/VendaController.js
const db = require('../db/conn.js');
const Carrinho = require('../model/Carrinho');
const ItemCarrinho = require('../model/ItemCarrinho');
const Produto = require('../model/Produto');
const Venda = require('../model/Venda');
const ItemVenda = require('../model/ItemVenda');
require('../model/associations.js');

const FORMAS_PAGAMENTO = ['pix', 'cartao', 'boleto'];

// erro de regra de negócio que vira resposta HTTP
class ErroVenda extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function serializar(venda) {
    const itens = (venda.itens || []).map((i) => {
        const precoUnitario = Number(i.precoUnitario);
        return {
            id: i.id,
            produtoId: i.produtoId,
            nome: i.nomeProduto,
            precoUnitario,
            quantidade: i.quantidade,
            subtotal: Math.round(precoUnitario * i.quantidade * 100) / 100
        };
    });
    return {
        id: venda.id,
        nomeCliente: venda.nomeCliente,
        formaPagamento: venda.formaPagamento,
        total: Number(venda.total),
        itens,
        createdAt: venda.createdAt
    };
}

module.exports = class VendaController {
    // POST /venda/checkout  { carrinhoId, nomeCliente, formaPagamento }
    // Transforma o carrinho aberto em uma venda e fecha o carrinho.
    static async checkout(req, res) {
        const { carrinhoId, nomeCliente, formaPagamento } = req.body || {};

        if (!carrinhoId) {
            res.status(422).json({ message: 'o carrinho é obrigatorio!' });
            return;
        }
        if (!nomeCliente || !String(nomeCliente).trim()) {
            res.status(422).json({ message: 'o nome do cliente é obrigatorio!' });
            return;
        }
        if (!FORMAS_PAGAMENTO.includes(formaPagamento)) {
            res.status(422).json({ message: 'forma de pagamento inválida! Use: ' + FORMAS_PAGAMENTO.join(', ') });
            return;
        }

        try {
            // transação: ou grava tudo (venda + itens + carrinho fechado) ou nada
            const vendaId = await db.transaction(async (t) => {
                const carrinho = await Carrinho.findByPk(carrinhoId, {
                    include: [{ model: ItemCarrinho, as: 'itens', include: [{ model: Produto, as: 'produto' }] }],
                    transaction: t
                });
                if (!carrinho) throw new ErroVenda(404, 'Carrinho não encontrado!');
                if (carrinho.status !== 'aberto') throw new ErroVenda(422, 'Este carrinho já foi finalizado!');
                if (carrinho.itens.length === 0) throw new ErroVenda(422, 'O carrinho está vazio!');

                // o preço é lido do produto agora e gravado na venda
                const itens = carrinho.itens.map((item) => ({
                    produtoId: item.produtoId,
                    nomeProduto: item.produto.nome,
                    precoUnitario: Number(item.produto.preco),
                    quantidade: item.quantidade
                }));
                const total = itens.reduce((soma, i) => soma + Math.round(i.precoUnitario * 100) * i.quantidade, 0) / 100;

                const venda = await Venda.create({
                    nomeCliente: String(nomeCliente).trim(),
                    formaPagamento,
                    total,
                    carrinhoId: carrinho.id
                }, { transaction: t });

                await ItemVenda.bulkCreate(itens.map((i) => ({ ...i, vendaId: venda.id })), { transaction: t });
                await carrinho.update({ status: 'finalizado' }, { transaction: t });

                return venda.id;
            });

            const venda = await Venda.findByPk(vendaId, { include: [{ model: ItemVenda, as: 'itens' }] });
            res.status(201).json({ message: 'Venda finalizada com sucesso!', venda: serializar(venda) });
        } catch (err) {
            if (err instanceof ErroVenda) {
                res.status(err.status).json({ message: err.message });
                return;
            }
            res.status(500).json({ message: 'Erro ao finalizar a venda: ' + err });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({
                include: [{ model: ItemVenda, as: 'itens' }],
                order: [['id', 'DESC']]
            });
            res.status(200).json(vendas.map(serializar));
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar as vendas: ' + err });
        }
    }

    static async getById(req, res) {
        try {
            const venda = await Venda.findByPk(req.params.id, { include: [{ model: ItemVenda, as: 'itens' }] });
            if (!venda) {
                res.status(404).json({ message: 'Venda não encontrada!' });
                return;
            }
            res.status(200).json(serializar(venda));
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar a venda: ' + err });
        }
    }
}
