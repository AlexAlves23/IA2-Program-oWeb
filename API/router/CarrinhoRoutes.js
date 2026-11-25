//route/CarrinhoRoutes.js
const router = require('express').Router();
const CarrinhoController = require('../controller/CarrinhoController.js');

//cria um carrinho vazio
router.post('/create', CarrinhoController.create);
//busca o carrinho com itens e total
router.get('/getById/:id', CarrinhoController.getById);
//adiciona um produto ao carrinho
router.post('/addItem/:id', CarrinhoController.addItem);
//altera a quantidade de um item
router.patch('/updateItem/:id/:itemId', CarrinhoController.updateItem);
//remove um item do carrinho
router.delete('/removeItem/:id/:itemId', CarrinhoController.removeItem);
//esvazia o carrinho
router.delete('/clear/:id', CarrinhoController.clear);

module.exports = router;
