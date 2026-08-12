import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";
import GeradorQR from "../components/GeradorQR";

export default function Configuracoes() {
  const { empresa } = useEmpresa();
  const [configuradores, setConfiguradores] = useState([]);
  const [novo, setNovo] = useState({
    nome: "",
    tipo: "radio",
    obrigatorio: false
  });

  useEffect(() => {
    if (!empresa?.id) return;

    const unsub = onSnapshot(collection(db, "restaurantes", empresa.id, "configuradores"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConfiguradores(lista);
    });
    return () => unsub();
  }, [empresa?.id]);

  const adicionar = async () => {
    if (!novo.nome || !empresa?.id) return;
    try {
      await addDoc(collection(db, "restaurantes", empresa.id, "configuradores"), {
        ...novo,
        opcoes: []
      });
      setNovo({ nome: "", tipo: "radio", obrigatorio: false });
    } catch (error) {
      console.error("Erro ao criar configurador:", error);
    }
  };

  const excluir = async (id) => {
    if (!empresa?.id) return;
    try {
      await deleteDoc(doc(db, "restaurantes", empresa.id, "configuradores", id));
    } catch (error) {
      console.error("Erro ao excluir configurador:", error);
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
      {/* O print:hidden esconde essa parte administrativa na hora de imprimir os códigos das mesas */}
      <div className="print:hidden">
        <h1 className="text-3xl font-bold mb-6">Configuradores</h1>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="font-bold text-xl mb-4">Novo Configurador</h2>
          <div className="grid gap-4">
            <input
              className="border rounded-lg p-3"
              placeholder="Nome"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            />
            <select
              className="border rounded-lg p-3"
              value={novo.tipo}
              onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
            >
              <option value="radio">Escolha Única</option>
              <option value="checkbox">Múltipla Escolha</option>
              <option value="textarea">Observação</option>
            </select>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={novo.obrigatorio}
                onChange={(e) => setNovo({ ...novo, obrigatorio: e.target.checked })}
              />
              Obrigatório
            </label>
            <button onClick={adicionar} className="bg-amber-700 hover:bg-amber-800 text-white rounded-lg py-3 font-bold">
              Criar Configurador
            </button>
          </div>
        </div>
        <div className="space-y-4 mb-8">
          {configuradores.map(config => (
            <div key={config.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-bold text-lg">{config.nome}</h2>
                  <p className="text-sm text-stone-500">Tipo: {config.tipo}</p>
                  <p className="text-sm">{config.obrigatorio ? "Obrigatório" : "Opcional"}</p>
                </div>
                <button onClick={() => excluir(config.id)} className="text-red-600 font-bold">
                  Excluir
                </button>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Opções</h4>
                {config.opcoes.length === 0 ? (
                  <p className="text-stone-400">Nenhuma opção cadastrada.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {config.opcoes.map((op, index) => (
                      <span key={index} className="bg-stone-200 rounded-full px-3 py-1 text-sm">
                        {op}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADICIONADO AQUI NO FINAL DO ARQUIVO: O componente gerador de QR Code original corrigido */}
      <div className="mt-8 border-t border-stone-300 pt-8">
        <GeradorQR />
      </div>
    </div>
  );
}
