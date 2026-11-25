//ProdutoCard/index.js
import { urlImagem } from '../../services/api';
import { formatarPreco } from '../../utils/formatar';

const ProdutoCard = ({ produto, onAdicionar }) => {
    const imagem = urlImagem(produto.imagem);
    return (
        <div className="card h-100">
            {imagem
                ? <img src={imagem} alt={produto.nome} className="card-img-top produto-img" />
                : <div className="produto-img sem-imagem">sem imagem</div>}
            <div className="card-body d-flex flex-column">
                <h5 className="card-title fs-6">{produto.nome}</h5>
                <p className="card-text fw-bold">{formatarPreco(produto.preco)}</p>
                <button className="btn btn-primary btn-sm mt-auto" onClick={() => onAdicionar(produto)}>
                    Adicionar ao carrinho
                </button>
            </div>
        </div>
    );
}

export default ProdutoCard;
