//index.js
const express = require('express');
const app = express();
const port = 5000;
const conn = require('./db/conn.js');
const cors = require('cors');
const path = require('path');

app.use(express.json())
app.use(cors({ credentials: true, origin: '*' }));

const produtoRoutes = require('./router/ProdutoRoutes.js');
app.use('/produto', produtoRoutes);

//imagens dos produtos: http://localhost:5000/uploads/<arquivo>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//relacionamentos entre as tabelas (carrinho/venda)
require('./model/associations.js');
const carrinhoRoutes = require('./router/CarrinhoRoutes.js');
const vendaRoutes = require('./router/VendaRoutes.js');
app.use('/carrinho', carrinhoRoutes);
app.use('/venda', vendaRoutes);

conn
    .sync()
    .then(() => { app.listen(port) })
    .catch((err) => console.log(err));