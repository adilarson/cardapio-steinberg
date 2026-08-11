import React, { useEffect, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";
import {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria
} from "../services/categoriasService";

export default function Categorias() {
  const { empresa } = useEmpresa();
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!empresa?.id) {
      setCategorias([]);
      setCarregando(false);
      return;
    }

    const carregar = async () => {
      try {
        setCarregando(true);
        const lista = await listarCategorias(empresa.id);

        setCategorias(
          [...lista].sort(
            (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)
          )
        );
      } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [empresa?.id]);

  const adicionarCategoria = async () => {
    const nome = novaCategoria.trim();

    if (!empresa?.id || !nome) return;

    if (
      categorias.some(
        categoria =>
          categoria.nome.toLowerCase() === nome.toLowerCase()
      )
    ) {
      alert("Essa categoria já existe.");
      return;
    }

    try {
      setSalvando(true);

      const nova = {
        nome,
        ordem: categorias.length,
        ativa: true
      };

      const resultado = await criarCategoria(
        empresa.id,
        nova
      );

      setCategorias(prev => [
        ...prev,
        {
          id: resultado.id,
          ...nova
        }
      ]);

      setNovaCategoria("");
    } catch (erro) {
      console.error("Erro ao criar categoria:", erro);
      alert("Não foi possível criar a categoria.");
    } finally {
      setSalvando(false);
    }
  };

  const atualizarOrdens = async lista => {
    if (!empresa?.id) return;

    await Promise.all(
      lista.map((categoria, indice) =>
        atualizarCategoria(
          empresa.id,
          categoria.id,
          { ordem: indice }
        )
      )
    );
  };

  const mover = async (indice, direcao) => {
    const novoIndice = indice + direcao;

    if (
      novoIndice < 0 ||
      novoIndice >= categorias.length
    ) {
      return;
    }

    const lista = [...categorias];

    [
      lista[indice],
      lista[novoIndice]
    ] = [
      lista[novoIndice],
      lista[indice]
    ];

    const atualizada = lista.map(
      (categoria, i) => ({
        ...categoria,
        ordem: i
      })
    );

    setCategorias(atualizada);

    try {
      await atualizarOrdens(atualizada);
    } catch (erro) {
      console.error(
        "Erro ao alterar ordem:",
        erro
      );
    }
  };

  const removerCategoria = async categoria => {
    if (!empresa?.id) return;

    const confirmar = window.confirm(
      `Excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmar) return;

    try {
      setSalvando(true);

      await excluirCategoria(
        empresa.id,
        categoria.id
      );

      const lista = categorias
        .filter(
          item => item.id !== categoria.id
        )
        .map((item, indice) => ({
          ...item,
          ordem: indice
        }));

      setCategorias(lista);

      await atualizarOrdens(lista);
    } catch (erro) {
      console.error(
        "Erro ao excluir categoria:",
        erro
      );

      alert(
        "Não foi possível excluir a categoria."
      );
    } finally {
      setSalvando(false);
    }
  };

  const salvarCategorias = async () => {
    if (!empresa?.id) return;

    try {
      setSalvando(true);

      await atualizarOrdens(categorias);

      alert(
        "Categorias salvas com sucesso!"
      );
    } catch (erro) {
      console.error(
        "Erro ao salvar categorias:",
        erro
      );

      alert(
        "Não foi possível salvar as categorias."
      );
    } finally {
      setSalvando(false);
    }
  };

  if (!empresa) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="text-stone-600">
          Nenhum restaurante selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-stone-800">
          Categorias
        </h1>

        <p className="text-sm text-stone-500 mt-1">
          Organize as categorias do cardápio de{" "}
          <strong>
            {empresa.nome || "seu restaurante"}
          </strong>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <div className="flex gap-3">
          <input
            value={novaCategoria}
            onChange={e =>
              setNovaCategoria(e.target.value)
            }
            onKeyDown={e => {
              if (e.key === "Enter") {
                adicionarCategoria();
              }
            }}
            placeholder="Nome da nova categoria"
            className="flex-1 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />

          <button
            onClick={adicionarCategoria}
            disabled={
              salvando ||
              !novaCategoria.trim()
            }
            className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white px-6 rounded-xl font-bold"
          >
            + Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-lg font-bold text-stone-800">
            Categorias do cardápio
          </h2>

          <p className="text-xs text-stone-500 mt-1">
            Use as setas para definir a ordem exibida
            para os clientes.
          </p>
        </div>

        {carregando ? (
          <div className="p-10 text-center text-stone-500">
            Carregando categorias...
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-10 text-center text-stone-500">
            Nenhuma categoria cadastrada.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {categorias.map(
              (categoria, indice) => (
                <div
                  key={categoria.id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-500">
                      {indice + 1}
                    </span>

                    <div>
                      <p className="font-semibold text-stone-800">
                        {categoria.nome}
                      </p>

                      <p className="text-xs text-stone-400">
                        {categoria.ativa === false
                          ? "Inativa"
                          : "Ativa"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        mover(indice, -1)
                      }
                      disabled={
                        indice === 0 ||
                        salvando
                      }
                      className="w-9 h-9 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() =>
                        mover(indice, 1)
                      }
                      disabled={
                        indice ===
                          categorias.length - 1 ||
                        salvando
                      }
                      className="w-9 h-9 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() =>
                        removerCategoria(
                          categoria
                        )
                      }
                      disabled={salvando}
                      className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className="border-t border-stone-200 p-5 flex justify-end">
          <button
            onClick={salvarCategorias}
            disabled={
              salvando ||
              carregando ||
              categorias.length === 0
            }
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-7 py-3 rounded-xl font-bold"
          >
            {salvando
              ? "Salvando..."
              : "Salvar Categorias"}
          </button>
        </div>
      </div>
    </div>
  );
}