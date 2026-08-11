import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch, getDocs, deleteDoc } from "firebase/firestore";
import cardapioData from "../data/cardapio"; // Importa o seu arquivo gigante local

console.log("Quantidade de produtos:", cardapioData.length);
console.log(cardapioData);

export default function RestaurantesMaster() {

  alert("MASTER CARREGOU");

  const [restaurantes, setRestaurantes] = useState([]);
  const [importando, setImportando] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    cidade: "",
    plano: "Starter"
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "restaurantes"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRestaurantes(lista);
    });
    return () => unsub();
  }, []);

  async function cadastrar() {
    if (!novo.nome) return;
    
    const slugGerado = novo.nome
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-");

    try {
      await addDoc(collection(db, "restaurantes"), {
        ...novo,
        slug: slugGerado,
        status: "Ativo",
        corPrimaria: "#92400e",
        corSecundaria: "#111827"
      });
      
      setNovo({ nome: "", cidade: "", plano: "Starter" });
      alert("Restaurante cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar restaurante:", error);
      alert("Erro ao salvar no banco de dados.");
    }
  }

  async function alterarStatus(id, statusAtual) {
    try {
      const novoStatus = statusAtual === "Ativo" ? "Suspenso" : "Ativo";
      const docRef = doc(db, "restaurantes", id);
      await updateDoc(docRef, { status: novoStatus });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  }

  // 🔥 NOVA FUNÇÃO: Faz o upload em lote de todas as páginas do cardapioData
    async function realizarCargaCardapio(empresaId) {
    console.log("CONTEÚDO COMPLETO DO ARQUIVO LOCAL:", cardapioData);
    if (!cardapioData || cardapioData.length === 0) {
      alert("O arquivo cardapio.js está vazio ou inválido.");
      return;
    }

    const confirmar = window.confirm(`ATENÇÃO: Isso vai apagar o cardápio atual do Firebase deste restaurante e importar ${cardapioData.length} itens do arquivo local limpos. Deseja continuar?`);
    if (!confirmar) return;

    try {
      setImportando(true);

      // 1. LIMPEZA AUTOMÁTICA: Apaga categorias antigas para evitar duplicação
      const queryCategorias = await getDocs(collection(db, "restaurantes", empresaId, "categorias"));
      for (const docSnap of queryCategorias.docs) {
        await deleteDoc(doc(db, "restaurantes", empresaId, "categorias", docSnap.id));
      }

      // 2. LIMPEZA AUTOMÁTICA: Apaga produtos antigos
      const queryProdutos = await getDocs(collection(db, "restaurantes", empresaId, "produtos"));
      for (const docSnap of queryProdutos.docs) {
        await deleteDoc(doc(db, "restaurantes", empresaId, "produtos", docSnap.id));
      }

      // 3. Criar categorias únicas baseadas estritamente no seu cardapioData
      const categoriasUnicas = [...new Set(cardapioData.map(item => item.categoria).filter(Boolean))];
      for (let i = 0; i < categoriasUnicas.length; i++) {
        await addDoc(collection(db, "restaurantes", empresaId, "categorias"), {
          nome: categoriasUnicas[i],
          ordem: i,
          ativa: true
        });
      }

      // 4. Salvar os produtos usando lotes (Batches) estáveis
      let batch = writeBatch(db);
      let contador = 0;

      for (const item of cardapioData) {
        const novoDocRef = doc(collection(db, "restaurantes", empresaId, "produtos"));
        const { id, ...dadosProduto } = item; 
        
        batch.set(novoDocRef, {
          ...dadosProduto,
          disponivel: true
        });

        contador++;

        if (contador === 400) {
          await batch.commit();
          batch = writeBatch(db);
          contador = 0;
        }
      }

      await batch.commit();
      alert("Mágica concluída! O banco de dados foi limpo e o cardápio importado sem duplicações.");
    } catch (error) {
      console.error("Erro na importação limpa:", error);
      alert("Houve um erro durante a carga limpa dos dados.");
    } finally {
      setImportando(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Larson SaaS - Administração Master</h1>
      
      {importando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-xl font-bold">Processando carga em massa...</p>
          <p className="text-sm text-stone-300 mt-1">Enviando centenas de itens para o Firebase, não feche a aba.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-bold mb-4">Novo Restaurante</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            className="border rounded-lg p-3"
            placeholder="Nome"
            value={novo.nome}
            onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
          />
          <input
            className="border rounded-lg p-3"
            placeholder="Cidade"
            value={novo.cidade}
            onChange={(e) => setNovo({ ...novo, cidade: e.target.value })}
          />
          <select
            className="border rounded-lg p-3"
            value={novo.plano}
            onChange={(e) => setNovo({ ...novo, plano: e.target.value })}
          >
            <option>Starter</option>
            <option>Professional</option>
            <option>Premium</option>
            <option>Enterprise</option>
          </select>
        </div>
        <button onClick={cadastrar} className="mt-5 bg-amber-700 text-white px-6 py-3 rounded-xl">
          Cadastrar Restaurante
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-200">
            <tr>
              <th className="text-left p-4">Restaurante</th>
              <th className="text-left">Cidade</th>
              <th className="text-left">Plano</th>
              <th className="text-left">Status</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {restaurantes.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-4 font-semibold">{r.nome}</td>
                <td>{r.cidade}</td>
                <td>{r.plano}</td>
                <td>
                  <span className={`px-3 py-1 rounded-full text-sm ${r.status === "Ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  {/* 🔥 BOTÃO MÁGICO DE IMPORTAÇÃO AUTOMÁTICA */}
                  <button 
                    onClick={() => realizarCargaCardapio(r.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    📦 Importar Cardápio Local
                  </button>
                  <button onClick={() => alterarStatus(r.id, r.status)} className="bg-stone-800 text-white px-3 py-2 rounded-lg text-sm">
                    {r.status === "Ativo" ? "Suspender" : "Reativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
