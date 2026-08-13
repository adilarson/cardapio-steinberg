import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function MasterAdmin() {
  const [novaEmpresa, setNovaEmpresa] = useState({
    nome: "",
    slug: "",
    cidade: "",
    segmento: "Restaurante",
    plano: "Bronze",
    status: "Ativo",
    totalMesas: 50,
    corPrimaria: "#92400e", // Padrão Amber do Steinberg
    corSecundaria: "#111827", // Padrão Stone escuro
  });

  const criarSlug = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9 -]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, "-") // Substitui espaços por hífen
      .replace(/-+/g, "-"); // Remove hífens duplicados
  };

  const handleNomeChange = (e) => {
    const nomeDigitado = e.target.value;
    setNovaEmpresa({
      ...novaEmpresa,
      nome: nomeDigitado,
      slug: criarSlug(nomeDigitado)
    });
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!novaEmpresa.nome || !novaEmpresa.slug || !novaEmpresa.cidade) {
      alert("Por favor, preencha o Nome e a Cidade.");
      return;
    }

    try {
      // Salva na coleção "restaurantes" usando o SLUG como ID do documento
      await setDoc(doc(db, "restaurantes", novaEmpresa.slug), {
        nome: novaEmpresa.nome,
        slug: novaEmpresa.slug,
        cidade: novaEmpresa.cidade,
        segmento: novaEmpresa.segmento,
        plano: novaEmpresa.plano,
        status: novaEmpresa.status,
        totalMesas: Number(novaEmpresa.totalMesas),
        corPrimaria: novaEmpresa.corPrimaria,
        corSecundaria: novaEmpresa.corSecundaria,
        criadoEm: new Date()
      });

      alert(`🚀 Licença Ativada! A empresa "${novaEmpresa.nome}" já pode acessar o SaaS.`);
      
      // Limpa o formulário
      setNovaEmpresa({
        nome: "", slug: "", cidade: "", segmento: "Restaurante",
        plano: "Bronze", status: "Ativo", totalMesas: 50,
        corPrimaria: "#92400e", corSecundaria: "#111827"
      });
    } catch (error) {
      console.error("Erro ao cadastrar empresa:", error);
      alert("Erro ao salvar no Firebase. Verifique o console.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2">
      <div className="bg-white rounded-2xl shadow border border-stone-100 p-8">
        <div className="border-b pb-4 mb-6">
          <h2 className="text-2xl font-black text-stone-800">Ativar Nova Empresa SaaS</h2>
          <p className="text-sm text-stone-500">Gere a estrutura completa do cliente de forma instantânea e automatizada.</p>
        </div>

        <form onSubmit={handleCadastrar} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Nome do Estabelecimento:</label>
              <input
                type="text" required
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-amber-700"
                placeholder="Ex: Pizzaria do João"
                value={novaEmpresa.nome}
                onChange={handleNomeChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Cidade Sede:</label>
              <input
                type="text" required
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-amber-700"
                placeholder="Ex: Gramado"
                value={novaEmpresa.cidade}
                onChange={(e) => setNovaEmpresa({ ...novaEmpresa, cidade: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Link de Acesso (Slug Autogerado):</label>
            <input
              type="text" readOnly
              className="w-full border bg-stone-50 text-stone-600 rounded-xl p-3 font-mono text-sm cursor-not-allowed"
              value={novaEmpresa.slug}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Segmento:</label>
              <select
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-amber-700 text-sm bg-white"
                value={novaEmpresa.segmento}
                onChange={(e) => setNovaEmpresa({ ...novaEmpresa, segmento: e.target.value })}
              >
                <option value="Restaurante">Restaurante</option>
                <option value="Pizzaria">Pizzaria</option>
                <option value="Hamburgueria">Hamburgueria</option>
                <option value="Quiosque de Praia">Quiosque de Praia</option>
                <option value="Sushi Bar">Sushi Bar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Plano:</label>
              <select
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-amber-700 text-sm bg-white"
                value={novaEmpresa.plano}
                onChange={(e) => setNovaEmpresa({ ...novaEmpresa, plano: e.target.value })}
              >
                <option value="Bronze">Bronze (Mesas)</option>
                <option value="Prata">Prata (Completo)</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Status:</label>
              <select
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-amber-700 text-sm bg-white"
                value={novaEmpresa.status}
                onChange={(e) => setNovaEmpresa({ ...novaEmpresa, status: e.target.value })}
              >
                <option value="Ativo">Ativo</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Qtd Mesas:</label>
              <input
                type="number" min="1" required
                className="w-full border rounded-xl p-3 focus:outline-none focus:border-amber-700 text-sm"
                value={novaEmpresa.totalMesas}
                onChange={(e) => setNovaEmpresa({ ...novaEmpresa, totalMesas: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Cor Primária (Cardápio):</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="w-12 h-12 border rounded-lg cursor-pointer"
                  value={novaEmpresa.corPrimaria}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, corPrimaria: e.target.value })}
                />
                <input
                  type="text"
                  className="border rounded-xl px-3 flex-1 text-sm font-mono uppercase"
                  value={novaEmpresa.corPrimaria}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, corPrimaria: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Cor Secundária (Fundo):</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="w-12 h-12 border rounded-lg cursor-pointer"
                  value={novaEmpresa.corSecundaria}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, corSecundaria: e.target.value })}
                />
                <input
                  type="text"
                  className="border rounded-xl px-3 flex-1 text-sm font-mono uppercase"
                  value={novaEmpresa.corSecundaria}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, corSecundaria: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-800 hover:bg-amber-900 text-white rounded-xl py-4 font-black text-lg transition shadow-md shadow-amber-800/10">
            🚀 Ativar Licença e Criar no Firestore
          </button>
        </form>
      </div>
    </div>
  );
}
