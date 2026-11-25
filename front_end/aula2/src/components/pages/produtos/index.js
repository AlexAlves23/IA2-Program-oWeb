import { useEffect, useState } from "react";
import InputGroup from "../../InputGroup";
import * as api from "../../../services/api";
import { formatarPreco } from "../../../utils/formatar";

const EXTENSOES_PERMITIDAS = ['.jpeg', '.jpg', '.png'];
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

//produtos/index.js
const Produtos = () => {
    const [produto, setProduto] = useState({ nome: '', preco: '' })
    const [imagem, setImagem] = useState(null)
    const [lstProdutos, setLstProdutos] = useState([])
    const [editandoId, setEditandoId] = useState(null)
    const [chaveArquivo, setChaveArquivo] = useState(0) //limpa o campo de arquivo

    function carregarProdutos() {
        api.listarProdutos()
            .then(setLstProdutos)
            .catch((err) => alert(err.message));
    }

    useEffect(() => { carregarProdutos(); }, [])

    function handleChange(e) {
        setProduto({ ...produto, [e.target.name]: e.target.value })
    }

    //não deixa digitar sinal de negativo no preço
    function bloquearTeclas(e) {
        if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) {
            setImagem(null);
            return;
        }
        const nomeArquivo = arquivo.name.toLowerCase();
        const extensaoOk = EXTENSOES_PERMITIDAS.some((ext) => nomeArquivo.endsWith(ext));

        if (!TIPOS_PERMITIDOS.includes(arquivo.type) || !extensaoOk) {
            alert("a imagem deve estar no formato .jpeg ou .png");
            setImagem(null);
            setChaveArquivo(chaveArquivo + 1);
            return;
        }
        if (arquivo.size > TAMANHO_MAXIMO) {
            alert("a imagem deve ter no máximo 5 MB");
            setImagem(null);
            setChaveArquivo(chaveArquivo + 1);
            return;
        }
        setImagem(arquivo);
    }

    function validateProduto(produto) {
        if (!produto.nome || !produto.nome.trim()) {
            alert("o campo nome é obrigatório");
            return false;
        }
        if (!produto.preco) {
            alert("o campo preco é obrigatorio")
            return false;
        }
        if (Number(produto.preco) < 0) {
            alert("o preço não pode ser negativo")
            return false;
        }
        if (Number(produto.preco) === 0) {
            alert("o preço deve ser maior que zero")
            return false;
        }
        return true;
    }

    function limparFormulario() {
        setProduto({ nome: '', preco: '' });
        setImagem(null);
        setEditandoId(null);
        setChaveArquivo(chaveArquivo + 1);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateProduto(produto)) return;

        const dados = new FormData();
        dados.append('nome', produto.nome.trim());
        dados.append('preco', produto.preco);
        if (imagem) dados.append('imagem', imagem);

        try {
            if (editandoId) await api.atualizarProduto(editandoId, dados);
            else await api.criarProduto(dados);
            limparFormulario();
            carregarProdutos();
        } catch (err) {
            alert(err.message);
        }
    }

    function handleEditar(p) {
        setEditandoId(p.id);
        setProduto({ nome: p.nome, preco: String(p.preco) });
        setImagem(null);
        setChaveArquivo(chaveArquivo + 1);
    }

    async function handleExcluir(p) {
        if (!window.confirm(`Excluir o produto "${p.nome}"?`)) return;
        try {
            await api.excluirProduto(p.id);
            if (editandoId === p.id) limparFormulario();
            carregarProdutos();
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div className="container">
            <h1 className="text-center fs-4">produtos</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        label="nome"
                        onChange={handleChange}
                        type="text"
                        placeholder="nome do produto"
                        name="nome"
                        value={produto.nome} />
                    <InputGroup label="preço"
                        onChange={handleChange}
                        type="number"
                        placeholder="preço do produto"
                        name="preco"
                        min="0"
                        step="0.01"
                        onKeyDown={bloquearTeclas}
                        value={produto.preco} />
                    <InputGroup label="imagem"
                        key={chaveArquivo}
                        onChange={handleImagem}
                        type="file"
                        name="imagem"
                        accept=".jpeg,.jpg,.png,image/jpeg,image/png" />
                    <button
                        className="btn btn-primary"
                        type="submit">{editandoId ? 'Atualizar' : 'Salvar'}</button>
                    {editandoId && (
                        <button
                            className="btn btn-outline-secondary ms-2"
                            type="button"
                            onClick={limparFormulario}>Cancelar</button>
                    )}
                </form>
            </div>
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>imagem</th>
                        <th>nome</th>
                        <th>preco</th>
                        <th>ações</th>
                    </tr>
                </thead>
                <tbody>
                    {lstProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">nenhum produto cadastrado</td>
                        </tr>)
                        : (
                            lstProdutos.map((produto) => (
                                <tr key={produto.id}>
                                    <td>{produto.imagem ? <img src={api.urlImagem(produto.imagem)} alt={produto.nome} className="miniatura" /> : '-'}</td>
                                    <td>{produto.nome}</td>
                                    <td>{formatarPreco(produto.preco)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(produto)}>Editar</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleExcluir(produto)}>Excluir</button>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Produtos;
