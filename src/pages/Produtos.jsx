import React, { useEffect, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  excluirProduto
} from "../services/produtosService";
import { db } from "../firebase"; 
import { doc, updateDoc } from "firebase/firestore";

export default function Produtos() {
  
  const { empresa } = useEmpresa();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    categoria: "",
    secao: "",
    descricao: "",
    quantidade: "",
    preco: "",
    precoVariacoes: [],
    disponivel: true
  });

  useEffect(() => {
    if (!empresa?.id) return;

    async function carregarProdutos() {
      try {
        setCarregando(true);

        const lista = await listarProdutos(empresa.id);

        setProdutos(lista);
      } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, [empresa]);

  const limparFormulario = () => {
    setNovoProduto({
      nome: "",
      categoria: "",
      secao: "",
      descricao: "",
      quantidade: "",
      preco: "",
      precoVariacoes: [],
      disponivel: true
    });
  };

  const atualizarCampo = (campo, valor) => {
    setNovoProduto((prev) => ({
      ...prev,
      [campo]: valor
    }));
  };

  const adicionarVariacao = () => {
    setNovoProduto((prev) => ({
      ...prev,
      precoVariacoes: [
        ...prev.precoVariacoes,
        {
          nome: "",
          preco: ""
        }
      ]
    }));
  };

  const alterarVariacao = (indice, campo, valor) => {
    setNovoProduto((prev) => ({
      ...prev,
      precoVariacoes: prev.precoVariacoes.map((item, i) =>
        i === indice
          ? {
              ...item,
              [campo]: valor
            }
          : item
      )
    }));
  };

  const removerVariacao = (indice) => {
    setNovoProduto((prev) => ({
      ...prev,
      precoVariacoes: prev.precoVariacoes.filter(
        (_, i) => i !== indice
      )
    }));
  };

  const adicionarProduto = async () => {
    if (!empresa?.id) return;

    if (!novoProduto.nome.trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    const temPreco =
      novoProduto.preco !== "" ||
      novoProduto.precoVariacoes.some(
        (item) => item.preco !== ""
      );

    if (!temPreco) {
      alert("Informe pelo menos um preço.");
      return;
    }

    try {
      setSalvando(true);

      const variacoes = novoProduto.precoVariacoes
        .filter(
          (item) =>
            item.nome.trim() !== "" &&
            item.preco !== ""
        )
        .map((item) => ({
          nome: item.nome.trim(),
          preco: Number(item.preco)
        }));

      const produto = {
        nome: novoProduto.nome.trim(),
        categoria: novoProduto.categoria.trim(),
        secao: novoProduto.secao.trim(),
        descricao: novoProduto.descricao.trim(),
        quantidade: novoProduto.quantidade.trim(),
        preco:
          novoProduto.preco === ""
            ? null
            : Number(novoProduto.preco),
        precoVariacoes: variacoes,
        disponivel: true
      };

      const resultado = await criarProduto(
        empresa.id,
        produto
      );

      setProdutos((prev) => [
        ...prev,
        {
          id: resultado.id,
          ...produto
        }
      ]);

      limparFormulario();
    } catch (erro) {
      console.error("Erro ao criar produto:", erro);
      alert("Não foi possível cadastrar o produto.");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmar) return;

    try {
      await excluirProduto(empresa.id, id);

      setProdutos((prev) =>
        prev.filter((produto) => produto.id !== id)
      );
    } catch (erro) {
      console.error("Erro ao excluir produto:", erro);
      alert("Não foi possível excluir o produto.");
    }
  };
  // ESTADOS E FUNÇÕES DE EDIÇÃO DENTRO DE PRODUTOS.JSX
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [nomeEdit, setNomeEdit] = useState("");
  const [precoEdit, setPrecoEdit] = useState("");
  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [categoriaEdit, setCategoriaEdit] = useState("");

  const iniciarEdicaoProduto = (prod) => {
    setProdutoEditando(prod.id);
    setNomeEdit(prod.nome || "");
    setPrecoEdit(prod.preco || "");
    setDescricaoEdit(prod.descricao || "");
    setCategoriaEdit(prod.categoria || "");
  };

  const atualizarProduto = async (e) => {
    e.preventDefault();
    if (!empresa?.id || !produtoEditando) return;

    try {
      // Importações necessárias do firestore presumidas no topo (doc, updateDoc, db)
      const docRef = doc(db, "restaurantes", empresa.id, "produtos", produtoEditando);
      await updateDoc(docRef, {
        nome: nomeEdit,
        preco: Number(precoEdit) || 0,
        descricao: descricaoEdit,
        categoria: categoriaEdit,
        timestampAtualizacao: new Date()
      });
      
      // Atualiza a listagem na tela local sem precisar recarregar a página
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produtoEditando
            ? { ...p, nome: nomeEdit, preco: Number(precoEdit), descricao: descricaoEdit, categoria: categoriaEdit }
            : p
        )
      );
      
      setProdutoEditando(null);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
    }
  };

  const alternarDisponibilidade = async (produto) => {
    try {
      const novoStatus = !produto.disponivel;

      await atualizarProduto(
        empresa.id,
        produto.id,
        {
          disponivel: novoStatus
        }
      );

      setProdutos((prev) =>
        prev.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                disponivel: novoStatus
              }
            : item
        )
      );
    } catch (erro) {
      console.error(
        "Erro ao alterar disponibilidade:",
        erro
      );

      alert(
        "Não foi possível alterar o status."
      );
    }
  };

  const formatarPreco = (produto) => {
    if (
      Array.isArray(produto.precoVariacoes) &&
      produto.precoVariacoes.length > 0
    ) {
      return produto.precoVariacoes
        .map(
          (item) =>
            `${item.nome}: R$ ${Number(
              item.preco || 0
            ).toFixed(2)}`
        )
        .join(" • ");
    }

    if (
      produto.preco !== null &&
      produto.preco !== undefined &&
      produto.preco !== ""
    ) {
      return `R$ ${Number(
        produto.preco
      ).toFixed(2)}`;
    }

    return "-";
  };

  if (!empresa) {
    return (
      <div className="min-h-screen bg-stone-100 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8 text-center">
          <p className="text-stone-500">
            Nenhuma empresa selecionada.
          </p>
        </div>
      </div>
    );
  }

    const iniciarEdicaoProduto = (produto) => {
    setProdutoEditando(produto.id);
    setNomeEdit(produto.nome || "");
    setPrecoEdit(produto.preco || "");
    setDescricaoEdit(produto.descricao || "");
    setCategoriaEdit(produto.categoria || "");
  };

  const atualizarProduto = async (e) => {
    e.preventDefault();
    const idRestaurante = empresa?.id; // Verifique se seu arquivo usa 'empresa.id' ou passe o ID dinâmico dele
    if (!idRestaurante || !produtoEditando) return;

    try {
      const docRef = doc(db, "restaurantes", idRestaurante, "produtos", produtoEditando);
      await updateDoc(docRef, {
        nome: nomeEdit,
        preco: Number(precoEdit) || 0,
        descricao: descricaoEdit,
        categoria: categoriaEdit,
        timestampAtualizacao: new Date()
      });
      setProdutoEditando(null);
      console.log("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">
            Produtos
          </h1>

          <p className="text-stone-500 mt-1">
            Gerencie os produtos de{" "}
            {empresa.nome || "sua empresa"}
          </p>
        </div>

        {/* NOVO PRODUTO */}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <h2 className="text-xl font-bold text-stone-800 mb-6">
            Novo Produto
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              className="border border-stone-300 rounded-xl p-3"
              placeholder="Nome do produto"
              value={novoProduto.nome}
              onChange={(e) =>
                atualizarCampo(
                  "nome",
                  e.target.value
                )
              }
            />

            <input
              className="border border-stone-300 rounded-xl p-3"
              placeholder="Categoria"
              value={novoProduto.categoria}
              onChange={(e) =>
                atualizarCampo(
                  "categoria",
                  e.target.value
                )
              }
            />

            <input
              className="border border-stone-300 rounded-xl p-3"
              placeholder="Seção"
              value={novoProduto.secao}
              onChange={(e) =>
                atualizarCampo(
                  "secao",
                  e.target.value
                )
              }
            />

            <input
              className="border border-stone-300 rounded-xl p-3"
              placeholder="Quantidade / tamanho"
              value={novoProduto.quantidade}
              onChange={(e) =>
                atualizarCampo(
                  "quantidade",
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              step="0.01"
              className="border border-stone-300 rounded-xl p-3"
              placeholder="Preço"
              value={novoProduto.preco}
              onChange={(e) =>
                atualizarCampo(
                  "preco",
                  e.target.value
                )
              }
            />

            <textarea
              className="border border-stone-300 rounded-xl p-3 md:col-span-2"
              rows={3}
              placeholder="Descrição"
              value={novoProduto.descricao}
              onChange={(e) =>
                atualizarCampo(
                  "descricao",
                  e.target.value
                )
              }
            />

          </div>

          {/* VARIAÇÕES */}

          <div className="mt-6 border-t pt-6">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h3 className="font-bold text-stone-800">
                  Variações de preço
                </h3>

                <p className="text-sm text-stone-500">
                  Ex.: 300ml, 500ml, Individual, Família
                </p>
              </div>

              <button
                type="button"
                onClick={adicionarVariacao}
                className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-xl"
              >
                + Variação
              </button>

            </div>

            <div className="space-y-3">

              {novoProduto.precoVariacoes.map(
                (variacao, indice) => (

                  <div
                    key={indice}
                    className="flex gap-3"
                  >

                    <input
                      className="flex-1 border border-stone-300 rounded-xl p-3"
                      placeholder="Nome da variação"
                      value={variacao.nome}
                      onChange={(e) =>
                        alterarVariacao(
                          indice,
                          "nome",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-40 border border-stone-300 rounded-xl p-3"
                      placeholder="Preço"
                      value={variacao.preco}
                      onChange={(e) =>
                        alterarVariacao(
                          indice,
                          "preco",
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removerVariacao(indice)
                      }
                      className="px-4 rounded-xl bg-red-100 text-red-600 font-bold"
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

          <button
            onClick={adicionarProduto}
            disabled={salvando}
            className="mt-6 w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl py-3 font-bold"
          >
            {salvando
              ? "Salvando..."
              : "Adicionar Produto"}
          </button>

        </div>

        {/* LISTAGEM */}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {carregando ? (

            <div className="p-10 text-center text-stone-500">
              Carregando produtos...
            </div>

          ) : produtos.length === 0 ? (

            <div className="p-10 text-center text-stone-500">
              Nenhum produto cadastrado.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-stone-200">

                  <tr>
                    <th className="p-4 text-left">
                      Produto
                    </th>

                    <th className="p-4 text-left">
                      Categoria
                    </th>

                    <th className="p-4 text-left">
                      Seção
                    </th>

                    <th className="p-4 text-left">
                      Preço
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                    <th className="p-4 text-center">
                      Ações
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {produtos.map((produto) => (

                    <tr
                      key={produto.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >

                      <td className="p-4">

                        <div className="font-semibold text-stone-800">
                          {produto.nome}
                        </div>

                        {produto.descricao && (
                          <div className="text-xs text-stone-500 mt-1 max-w-xs">
                            {produto.descricao}
                          </div>
                        )}

                        {produto.quantidade && (
                          <div className="text-xs text-stone-400 mt-1">
                            {produto.quantidade}
                          </div>
                        )}

                      </td>

                      <td className="p-4 text-stone-600">
                        {produto.categoria || "-"}
                      </td>

                      <td className="p-4 text-stone-600">
                        {produto.secao || "-"}
                      </td>

                      <td className="p-4 font-semibold text-stone-800">
                        {formatarPreco(produto)}
                      </td>

                      <td className="p-4">

                        <button
                          onClick={() =>
                            alternarDisponibilidade(
                              produto
                            )
                          }
                          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                            produto.disponivel
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {produto.disponivel
                            ? "Disponível"
                            : "Indisponível"}
                        </button>

                      </td>

                     {/* Subistitua a coluna de Ações por esta versão estruturada */}
                     <td className="p-4 text-center">
                     {/* ADICIONE ESTA LINHA EXATAMENTE ACIMA DO BOTÃO DE EXCLUIR QUE JÁ EXISTE NO SEU ARQUIVO */}
                     <button
                      type="button"
                      onClick={() => iniciarEdicaoProduto(produto)} 
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1 rounded-lg text-xs uppercase transition mr-2"
                   >
                       📝 Editar
                    </button>

                    <button onClick={() => excluir(produto.id)} className="text-red-600 font-bold">
                       Excluir
                    </button>
                   </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}