//model/Carrinho.js
const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');

const Carrinho = db.define('Carrinho', {
    // aberto -> ainda pode receber itens | finalizado -> já virou uma venda
    status: {
        type: DataTypes.ENUM('aberto', 'finalizado'),
        allowNull: false,
        defaultValue: 'aberto'
    }
});

module.exports = Carrinho;
