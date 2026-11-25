//controller/ProdutoController.js
const Produto = require('../model/Produto');
const { removerImagem } = require('../middleware/upload.js');

module.exports = class ProdutoController {
    static async create(req, res) {
        const { nome, preco } = req.body;

        if (!nome) {
            res.status(422).json({ message: 'o nome é obrigatorio!' });
            return;
        }
        if (!preco) {
            res.status(422).json({ message: 'o preço é obrigatorio!' });
            return;
        }

        if (Number(String(preco).replace(',', '.')) < 0) {
            if (req.file) removerImagem(req.file.filename);
            res.status(422).json({ message: 'o preço não pode ser negativo!' });
            return;
        }

        const produto = new Produto({
            nome: nome,
            preco: preco,
            imagem: req.file ? req.file.filename : null
        });

        try {
            await produto.save();
            res.status(201).json({ message: 'Produto criado com sucesso' });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao criar o produto: ' + err });

        }
    }

    static async getAll(req, res) {
        try {
            const produtos = await Produto.findAll();
            res.status(200).json(produtos);
        }

        catch (err) {
            res.status(500).json({ message: 'Erro ao buscar os produtos: ' + err });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        const produto = await Produto.findByPk(id);

        if (!produto) {
            res.status(422).json({ message: 'Produto não encontrado!'});
            return
        }

        res.status(200).json(produto);
    }

    static async update(req, res) {
        const { id } = req.params;
        const { nome, preco } = req.body;

        const produto = await Produto.findByPk(id);
        if(!produto) {
            res.status(422).json({ message: 'Produto não encontrado!' });
            return;
        }
        if (preco !== undefined && Number(String(preco).replace(',', '.')) < 0) {
            if (req.file) removerImagem(req.file.filename);
            res.status(422).json({ message: 'o preço não pode ser negativo!' });
            return;
        }
        const dadosImagem = req.file ? { imagem: req.file.filename } : {};
        const imagemAntiga = produto.imagem;
        try {
            await produto.update({ nome, preco, ...dadosImagem });
            if (req.file) removerImagem(imagemAntiga);
            res.status(200).json({ message: 'Produto atualizado com sucesso!' });
        }catch (err) {
            res.status(500).json({ message: 'Erro ao atualizar o produto: ' + err });
        }

    }

    static async delete(req, res) {
        const { id } = req.params;
        const produto = await Produto.findByPk(id);
        if (!produto) {
            res.status(422).json({ message: 'Produto não encontrado!' });
            return;
        }
        try {
            await produto.destroy();
            res.status(200).json({ message: 'Produto deletado com sucesso!' });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao deletar o produto: ' + err });
        }
    }

}   