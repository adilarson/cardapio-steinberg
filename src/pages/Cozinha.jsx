import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";

export default function Cozinha() {
  const { restaurantSlug } = useParams();
  const { empresa, carregarRestaurantePorSlug } = useEmpresa();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  
  useEffect(() => {
    if (restaurantSlug && (!empresa || empresa.slug !== restaurantSlug)) {
      carregarRestaurantePorSlug(restaurantSlug);
    }
  }, [restaurantSlug, empresa, carregarRestaurantePorSlug]);

  useEffect(() => {
    if (!empresa?.id) return;

    const q = query(
      collection(db, "restaurantes", empresa.id, "pedidos"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(listaPedidos);
    }, (error) => {
      console.error("Erro ao buscar pedidos:", error);
    });

    return () => unsubscribe();
  }, [empresa?.id]);

  async function mudarStatusPedido(id, novoStatus) {
    if (!empresa?.id) return;
    try {
      const docRef = doc(db, "restaurantes", empresa.id, "pedidos", id);
      await updateDoc(docRef, { status: novoStatus });
    } catch (e) {
      console.error("Erro ao alterar status do pedido:", e);
    }
  }

  if (!empresa) {
    return <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center font-bold">Nenhum restaurante carregado no painel da cozinha.</div>;
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white font-sans p-4">
      <header className="flex justify-between items-center border-b border-stone-700 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-500 font-serif">
            {empresa.nome.toUpperCase()} • COZINHA
          </h1>
          <p className="text-xs text-stone-400">Monitor de Preparo Cloud KDS</p>
        </div>
        <button
          onClick={() => navigate(`/${empresa.slug}`)}
          className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Sair Painel
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pedidos
          .filter(p => p.status === "Pendente" || p.status === "Preparando")
          .map(pedido => (
            <div
              key={pedido.id}
              className={`p-4 rounded-xl border shadow-xl transition-all duration-300 ${
                pedido.status === "Pendente"
                  ? "bg-red-950 border-red-500 animate-pulse"
                  : "bg-amber-950 border-amber-500"
              }`}
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-700">
                <div>
                  <span className="text-xl font-bold text-amber-400">MESA {pedido.mesa}</span>
                  <div className="mt-1">
                    {pedido.status === "Pendente" && (
                      <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full">🔴 AGUARDANDO</span>
                    )}
                    {pedido.status === "Preparando" && (
                      <span className="bg-yellow-500 text-black text-[10px] px-2 py-1 rounded-full">🟡 PREPARANDO</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-stone-400">{pedido.hora}</span>
              </div>
              {pedido.observacao && (
              <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold p-2.5 rounded-lg mb-4 italic">
             📢 OBSERVAÇÃO GERAL: "{pedido.observacao}"
             </div>
           )}
              <div className="space-y-4 mb-4 min-h-[80px]">
                {pedido.itens.map((item, index) => (
                  <div key={index} className="border-b border-stone-700 pb-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">{item.quantidade}x {item.nome}</span>
                      <span className="text-amber-400">R$ {(item.precoFinal ?? item.preco).toFixed(2)}</span>
                    </div>
                    
                    {item.configuracoes &&
                      Object.entries(item.configuracoes).map(([grupo, valor]) => (
                        <div key={grupo} className="ml-3 mt-1 text-xs text-stone-300">
                          <strong>{grupo}:</strong> {Array.isArray(valor) ? valor.join(", ") : valor}
                        </div>
                      ))}

                    {/* Exibe a observação na cozinha caso o Firebase a envie */}
                    {(item.observacao || item.observacaoDoConfigurador) && (
                      <div className="ml-3 mt-2 text-xs italic text-amber-300">
                        📝 {item.observacao || item.observacaoDoConfigurador}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                {pedido.status === "Pendente" && (
                  <button
                    onClick={() => mudarStatusPedido(pedido.id, "Preparando")}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-bold text-sm"
                  >
                    Começar Preparo
                  </button>
                )}
                {pedido.status === "Preparando" && (
                  <button
                    onClick={() => mudarStatusPedido(pedido.id, "Pronto")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm"
                  >
                    Concluir Pedido
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
