//services/api.js
//Funções que conversam com a API (http://localhost:5000)
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function request(caminho, opcoes = {}) {
    const res = await fetch(`${API_URL}${caminho}`, opcoes);
    let dados = null;
    try { dados = await res.json(); } catch (e) { /* resposta sem corpo */ }
    if (!res.ok) {
        throw new Error((dados && dados.message) || 'Erro ao comunicar com a API');
    }
    return dados;
}

const json = (metodo, corpo) => ({
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo)
});

export const urlImagem = (nomeArquivo) => nomeArquivo ? `${API_URL}/uploads/${nomeArquivo}` : null;

// ---------- produtos (CRUD) ----------
// criar/atualizar recebem FormData (nome, preco, imagem)
export const listarProdutos = () => request('/produto/getAll');
export const criarProduto = (formData) => request('/produto/create', { method: 'POST', body: formData });
export const atualizarProduto = (id, formData) => request(`/produto/update/${id}`, { method: 'PATCH', body: formData });
export const excluirProduto = (id) => request(`/produto/delete/${id}`, { method: 'DELETE' });

// ---------- carrinho ----------
export const criarCarrinho = () => request('/carrinho/create', { method: 'POST' });
export const buscarCarrinho = (id) => request(`/carrinho/getById/${id}`);
export const adicionarItem = (id, produtoId, quantidade = 1) => request(`/carrinho/addItem/${id}`, json('POST', { produtoId, quantidade }));
export const atualizarItem = (id, itemId, quantidade) => request(`/carrinho/updateItem/${id}/${itemId}`, json('PATCH', { quantidade }));
export const removerItem = (id, itemId) => request(`/carrinho/removeItem/${id}/${itemId}`, { method: 'DELETE' });
export const limparCarrinho = (id) => request(`/carrinho/clear/${id}`, { method: 'DELETE' });

// ---------- venda ----------
export const finalizarVenda = (dados) => request('/venda/checkout', json('POST', dados));
