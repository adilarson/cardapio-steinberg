import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";
import { salvarConfiguradoresProduto } from "../services/configurarProdutoService";

export default function ConfigurarProduto() {
  const { empresa } = useEmpresa();
  const [produtos, setProdutos] = useState([]);
  const [configuradores, setConfiguradores] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [selecionados, setSelecionados] = useState([]);

  useEffect(() => {
    if (!empresa?.id) return;

    const unsubProdutos = onSnapshot(collection(db, "restaurantes", empresa.id, "produtos"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));
      setProdutos(lista);
    });

    const unsubConfiguradores = onSnapshot(collection(db, "restaurantes", empresa.id, "configuradores"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));
      setConfiguradores(lista);
    });

    return () => {
      unsubProdutos();
      unsubConfiguradores();
    };
  }, [empresa?.id]);

  const alterar = (id) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter(x => x !== id));
      return;
    }
    setSelecionados([...selecionados, id]);
  };

  const salvar = async () => {
    if (!produtoSelecionado) {
      alert("Selecione um produto.");
      return;
    }
    if (!empresa?.id) return;

    try {
      await salvarConfiguradoresProduto(empresa.id, produtoSelecionado, selecionados);
      alert("Configuração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      alert("Não foi possível salvar a configuração.");
    }
  };

  if (!empresa) {
    return (
      <div className="min-h-screen bg-stone-100 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <p className="text-stone-600">Nenhuma empresa selecionada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <h1 className="text-3xl font-bold mb-8">Configurar Produto</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <label className="block font-semibold mb-2">Produto</label>
        <select
          className="border rounded-lg p-3 w-full mb-8"
          value={produtoSelecionado}
          onChange={(e) => setProdutoSelecionado(e.target.value)}
        >
          <option value="">Selecione...</option>
          {produtos.map(produto => (
            <option key={produto.id} value={produto.id}>
              {produto.nome}
            </option>
          ))}
        </select>
        <h2 className="font-bold text-xl mb-4">Configuradores disponíveis</h2>
        <div className="space-y-3">
          {configuradores.map(config => (
            <label key={config.id} className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selecionados.includes(config.id)}
                onChange={() => alterar(config.id)}
              />
              <span>{config.nome}</span>
            </label>
          ))}
        </div>
        <button onClick={salvar} className="mt-8 bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-bold">
          Salvar Configuração
        </button>
      </div>
    </div>
  );
}
