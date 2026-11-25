//model/associations.js
//Relacionamentos entre as tabelas (carregado uma única vez no index.js)
const Produto = require('./Produto.js');
const Carrinho = require('./Carrinho.js');
const ItemCarrinho = require('./ItemCarrinho.js');
const Venda = require('./Venda.js');
const ItemVenda = require('./ItemVenda.js');

// Carrinho 1 --- N ItemCarrinho
Carrinho.hasMany(ItemCarrinho, { as: 'itens', foreignKey: { name: 'carrinhoId', allowNull: false }, onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Carrinho, { foreignKey: { name: 'carrinhoId', allowNull: false } });

// Produto 1 --- N ItemCarrinho (se o produto for excluído, sai dos carrinhos)
Produto.hasMany(ItemCarrinho, { foreignKey: { name: 'produtoId', allowNull: false }, onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Produto, { as: 'produto', foreignKey: { name: 'produtoId', allowNull: false } });

// Venda 1 --- N ItemVenda
Venda.hasMany(ItemVenda, { as: 'itens', foreignKey: { name: 'vendaId', allowNull: false }, onDelete: 'CASCADE' });
ItemVenda.belongsTo(Venda, { foreignKey: { name: 'vendaId', allowNull: false } });

// ItemVenda -> Produto (o histórico permanece mesmo se o produto for excluído)
Produto.hasMany(ItemVenda, { foreignKey: { name: 'produtoId', allowNull: true }, onDelete: 'SET NULL' });
ItemVenda.belongsTo(Produto, { foreignKey: { name: 'produtoId', allowNull: true } });

// Venda -> Carrinho de origem
Carrinho.hasOne(Venda, { foreignKey: { name: 'carrinhoId', allowNull: true }, onDelete: 'SET NULL' });
Venda.belongsTo(Carrinho, { foreignKey: { name: 'carrinhoId', allowNull: true } });

module.exports = { Produto, Carrinho, ItemCarrinho, Venda, ItemVenda };
