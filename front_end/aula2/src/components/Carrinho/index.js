//Carrinho/index.js
import { formatarPreco } from '../../utils/formatar';

const Carrinho = ({ carrinho, onAlterarQuantidade, onRemover, onLimpar, onFinalizar }) => {
    const itens = carrinho ? carrinho.itens : [];

    return (
        <div className="card">
            <div className="card-header fw-bold">
                Carrinho {carrinho && carrinho.totalItens > 0 && <span className="badge bg-primary">{carrinho.totalItens}</span>}
            </div>
            <ul className="list-group list-group-flush">
                {itens.length === 0 && <li className="list-group-item text-center text-muted">carrinho vazio</li>}
                {itens.map((item) => (
                    <li key={item.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                            <span>{item.nome}</span>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => onRemover(item)}>x</button>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <div>
                                <button className="btn btn-sm btn-outline-secondary" disabled={item.quantidade <= 1}
                                    onClick={() => onAlterarQuantidade(item, item.quantidade - 1)}>-</button>
                                <span className="mx-2">{item.quantidade}</span>
                                <button className="btn btn-sm btn-outline-secondary"
                                    onClick={() => onAlterarQuantidade(item, item.quantidade + 1)}>+</button>
                            </div>
                            <span>{formatarPreco(item.subtotal)}</span>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="card-body">
                <div className="d-flex justify-content-between fw-bold mb-3">
                    <span>Total</span>
                    <span>{formatarPreco(carrinho ? carrinho.total : 0)}</span>
                </div>
                <button className="btn btn-success w-100 mb-2" disabled={itens.length === 0} onClick={onFinalizar}>
                    Finalizar compra
                </button>
                <button className="btn btn-outline-secondary w-100" disabled={itens.length === 0} onClick={onLimpar}>
                    Esvaziar carrinho
                </button>
            </div>
        </div>
    );
}

export default Carrinho;
