//model/ItemCarrinho.js
const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');

// As chaves estrangeiras (carrinhoId e produtoId) são criadas em model/associations.js
const ItemCarrinho = db.define('ItemCarrinho', {
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 }
    }
}, {
    // o mesmo produto não pode aparecer duas vezes no mesmo carrinho
    indexes: [{ unique: true, fields: ['carrinhoId', 'produtoId'] }]
});

module.exports = ItemCarrinho;
