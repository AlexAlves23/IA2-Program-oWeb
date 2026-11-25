//model/Venda.js
const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');

const Venda = db.define('Venda', {
    nomeCliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    formaPagamento: {
        type: DataTypes.ENUM('pix', 'cartao', 'boleto'),
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = Venda;
