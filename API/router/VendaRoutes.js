//route/VendaRoutes.js
const router = require('express').Router();
const VendaController = require('../controller/VendaController.js');

//finaliza a compra: transforma o carrinho em venda
router.post('/checkout', VendaController.checkout);
//lista todas as vendas
router.get('/getAll', VendaController.getAll);
//busca uma venda
router.get('/getById/:id', VendaController.getById);

module.exports = router;
