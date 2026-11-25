//model/ItemVenda.js
const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');

// Guarda uma "foto" do produto no momento da venda (nome e preço),
// assim alterar ou excluir o produto depois não muda o histórico de vendas.
const ItemVenda = db.define('ItemVenda', {
    nomeProduto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    }
});

module.exports = ItemVenda;
