//controller/CarrinhoController.js
const Carrinho = require('../model/Carrinho');
const ItemCarrinho = require('../model/ItemCarrinho');
const Produto = require('../model/Produto');
require('../model/associations.js');
const { urlImagem } = require('../middleware/upload.js');

const arredondar = (valor) => Math.round(valor * 100) / 100;

// Busca o carrinho com os itens e monta a resposta com subtotais e total
async function montarCarrinho(carrinhoId, req) {
    const carrinho = await Carrinho.findByPk(carrinhoId, {
        include: [{ model: ItemCarrinho, as: 'itens', include: [{ model: Produto, as: 'produto' }] }],
        order: [[{ model: ItemCarrinho, as: 'itens' }, 'id', 'ASC']]
    });
    if (!carrinho) return null;

    const itens = carrinho.itens.map((item) => {
        const preco = Number(item.produto.preco);
        return {
            id: item.id,
            produtoId: item.produtoId,
            nome: item.produto.nome,
            preco,
            imagemUrl: urlImagem(req, item.produto.imagem),
            quantidade: item.quantidade,
            subtotal: arredondar(preco * item.quantidade)
        };
    });

    return {
        id: carrinho.id,
        status: carrinho.status,
        itens,
        totalItens: itens.reduce((soma, i) => soma + i.quantidade, 0),
        total: arredondar(itens.reduce((soma, i) => soma + i.subtotal, 0))
    };
}

// quantidade precisa ser um inteiro >= 1
function quantidadeValida(q) {
    const n = Number(q);
    return Number.isInteger(n) && n >= 1 && n <= 999;
}

// Carrega o carrinho da URL e garante que ele existe e está aberto.
async function carrinhoAberto(req, res) {
    const carrinho = await Carrinho.findByPk(req.params.id);
    if (!carrinho) {
        res.status(404).json({ message: 'Carrinho não encontrado!' });
        return null;
    }
    if (carrinho.status !== 'aberto') {
        res.status(422).json({ message: 'Este carrinho já foi finalizado!' });
        return null;
    }
    return carrinho;
}

module.exports = class CarrinhoController {
    static async create(req, res) {
        try {
            const carrinho = await Carrinho.create();
            res.status(201).json({ message: 'Carrinho criado com sucesso', carrinho: await montarCarrinho(carrinho.id, req) });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao criar o carrinho: ' + err });
        }
    }

    static async getById(req, res) {
        try {
            const carrinho = await montarCarrinho(req.params.id, req);
            if (!carrinho) {
                res.status(404).json({ message: 'Carrinho não encontrado!' });
                return;
            }
            res.status(200).json(carrinho);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar o carrinho: ' + err });
        }
    }

    // POST /carrinho/addItem/:id  { produtoId, quantidade }
    static async addItem(req, res) {
        const { produtoId } = req.body || {};
        const quantidade = (req.body || {}).quantidade ?? 1;

        try {
            const carrinho = await carrinhoAberto(req, res);
            if (!carrinho) return;

            if (!produtoId) {
                res.status(422).json({ message: 'o produto é obrigatorio!' });
                return;
            }
            if (!quantidadeValida(quantidade)) {
                res.status(422).json({ message: 'a quantidade deve ser um número inteiro maior que zero!' });
                return;
            }
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                res.status(404).json({ message: 'Produto não encontrado!' });
                return;
            }

            // se o produto já está no carrinho, apenas soma a quantidade
            const item = await ItemCarrinho.findOne({ where: { carrinhoId: carrinho.id, produtoId: produto.id } });
            if (item) {
                const nova = item.quantidade + Number(quantidade);
                if (nova > 999) {
                    res.status(422).json({ message: 'a quantidade máxima por item é 999!' });
                    return;
                }
                await item.update({ quantidade: nova });
            } else {
                await ItemCarrinho.create({ carrinhoId: carrinho.id, produtoId: produto.id, quantidade: Number(quantidade) });
            }

            res.status(200).json({ message: 'Item adicionado ao carrinho!', carrinho: await montarCarrinho(carrinho.id, req) });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao adicionar o item: ' + err });
        }
    }

    // PATCH /carrinho/updateItem/:id/:itemId  { quantidade }
    static async updateItem(req, res) {
        const { itemId } = req.params;
        const { quantidade } = req.body || {};

        try {
            const carrinho = await carrinhoAberto(req, res);
            if (!carrinho) return;

            if (!quantidadeValida(quantidade)) {
                res.status(422).json({ message: 'a quantidade deve ser um número inteiro maior que zero!' });
                return;
            }
            const item = await ItemCarrinho.findOne({ where: { id: itemId, carrinhoId: carrinho.id } });
            if (!item) {
                res.status(404).json({ message: 'Item não encontrado no carrinho!' });
                return;
            }
            await item.update({ quantidade: Number(quantidade) });

            res.status(200).json({ message: 'Item atualizado com sucesso!', carrinho: await montarCarrinho(carrinho.id, req) });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao atualizar o item: ' + err });
        }
    }

    // DELETE /carrinho/removeItem/:id/:itemId
    static async removeItem(req, res) {
        const { itemId } = req.params;

        try {
            const carrinho = await carrinhoAberto(req, res);
            if (!carrinho) return;

            const item = await ItemCarrinho.findOne({ where: { id: itemId, carrinhoId: carrinho.id } });
            if (!item) {
                res.status(404).json({ message: 'Item não encontrado no carrinho!' });
                return;
            }
            await item.destroy();

            res.status(200).json({ message: 'Item removido do carrinho!', carrinho: await montarCarrinho(carrinho.id, req) });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao remover o item: ' + err });
        }
    }

    // DELETE /carrinho/clear/:id  (esvazia o carrinho)
    static async clear(req, res) {
        try {
            const carrinho = await carrinhoAberto(req, res);
            if (!carrinho) return;

            await ItemCarrinho.destroy({ where: { carrinhoId: carrinho.id } });

            res.status(200).json({ message: 'Carrinho esvaziado!', carrinho: await montarCarrinho(carrinho.id, req) });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao esvaziar o carrinho: ' + err });
        }
    }
}
