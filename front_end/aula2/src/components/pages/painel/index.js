//painel/index.js  (rota /home) - painel de vendas
import { useEffect, useState } from 'react';
import ProdutoCard from '../../ProdutoCard';
import Carrinho from '../../Carrinho';
import * as api from '../../../services/api';
import { formatarPreco } from '../../../utils/formatar';

const CHAVE_CARRINHO = 'carrinhoId';

const Painel = () => {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState(null);
    const [erro, setErro] = useState('');
    const [venda, setVenda] = useState(null);
    const [finalizando, setFinalizando] = useState(false);
    const [checkout, setCheckout] = useState({ nomeCliente: '', formaPagamento: 'pix' });

    useEffect(() => {
        api.listarProdutos().then(setProdutos).catch((e) => setErro(e.message));

        // recupera o carrinho aberto da última visita (se existir)
        const id = localStorage.getItem(CHAVE_CARRINHO);
        if (id) {
            api.buscarCarrinho(id)
                .then((c) => { if (c.status === 'aberto') setCarrinho(c); else localStorage.removeItem(CHAVE_CARRINHO); })
                .catch(() => localStorage.removeItem(CHAVE_CARRINHO));
        }
    }, []);

    // executa uma ação na API e guarda o carrinho devolvido
    async function executar(acao) {
        setErro('');
        try {
            const resp = await acao();
            setCarrinho(resp.carrinho);
        } catch (e) {
            setErro(e.message);
        }
    }

    async function adicionar(produto) {
        setVenda(null);
        let id = carrinho && carrinho.id;
        if (!id) { // o carrinho só é criado na primeira compra
            try {
                const novo = await api.criarCarrinho();
                id = novo.carrinho.id;
                localStorage.setItem(CHAVE_CARRINHO, id);
            } catch (e) { setErro(e.message); return; }
        }
        executar(() => api.adicionarItem(id, produto.id, 1));
    }

    const alterarQuantidade = (item, qtd) => executar(() => api.atualizarItem(carrinho.id, item.id, qtd));
    const remover = (item) => executar(() => api.removerItem(carrinho.id, item.id));
    const limpar = () => executar(() => api.limparCarrinho(carrinho.id));

    async function concluir(e) {
        e.preventDefault();
        setErro('');
        if (!checkout.nomeCliente.trim()) {
            setErro('o nome do cliente é obrigatório');
            return;
        }
        try {
            const resp = await api.finalizarVenda({ carrinhoId: carrinho.id, ...checkout });
            setVenda(resp.venda);
            setCarrinho(null);
            setFinalizando(false);
            setCheckout({ nomeCliente: '', formaPagamento: 'pix' });
            localStorage.removeItem(CHAVE_CARRINHO);
        } catch (e2) {
            setErro(e2.message);
        }
    }

    return (
        <div className="container mt-3">
            <h1 className="text-center fs-4">Painel de vendas</h1>

            {erro && <div className="alert alert-danger">{erro}</div>}
            {venda && (
                <div className="alert alert-success">
                    Venda #{venda.id} finalizada para {venda.nomeCliente} ({venda.formaPagamento}). Total: {formatarPreco(venda.total)}
                </div>
            )}

            <div className="row">
                <div className="col-lg-8">
                    <div className="row g-3">
                        {produtos.length === 0 && <p className="text-center text-muted">nenhum produto cadastrado</p>}
                        {produtos.map((p) => (
                            <div className="col-6 col-md-4" key={p.id}>
                                <ProdutoCard produto={p} onAdicionar={adicionar} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-lg-4 mt-4 mt-lg-0">
                    <Carrinho
                        carrinho={carrinho}
                        onAlterarQuantidade={alterarQuantidade}
                        onRemover={remover}
                        onLimpar={limpar}
                        onFinalizar={() => setFinalizando(true)} />

                    {finalizando && carrinho && (
                        <form className="card card-body mt-3" onSubmit={concluir}>
                            <h2 className="fs-6">Finalizar venda</h2>
                            <input className="form-control mb-2" placeholder="nome do cliente" value={checkout.nomeCliente}
                                onChange={(e) => setCheckout({ ...checkout, nomeCliente: e.target.value })} />
                            <select className="form-select mb-2" value={checkout.formaPagamento}
                                onChange={(e) => setCheckout({ ...checkout, formaPagamento: e.target.value })}>
                                <option value="pix">Pix</option>
                                <option value="cartao">Cartão</option>
                                <option value="boleto">Boleto</option>
                            </select>
                            <button className="btn btn-success mb-2" type="submit">Confirmar {formatarPreco(carrinho.total)}</button>
                            <button className="btn btn-outline-secondary" type="button" onClick={() => setFinalizando(false)}>Voltar</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Painel;
