import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";

export default function ContaMesa({ restaurantSlug, numeroMesa, onClose }) {
  const { empresa } = useEmpresa();
  const [pedidosConsumidos, setPedidosConsumidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Garante que temos o ID do restaurante carregado pelo Context ou pelo Slug
    const idRestaurante = empresa?.id || restaurantSlug;
    if (!idRestaurante || !numeroMesa) return;

    // Busca os pedidos exatamente na subcoleção correta do seu Firebase
    const q = query(
      collection(db, "restaurantes", idRestaurante, "pedidos"),
      where("mesa", "==", numeroMesa),
      where("status", "!=", "Finalizado") // Ignora os pedidos antigos já fechados
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let itensAcumulados = [];
      snapshot.docs.forEach((doc) => {
        const dadosPedido = doc.data();
        if (dadosPedido.itens) {
          itensAcumulados = [...itensAcumulados, ...dadosPedido.itens];
        }
      });
      setPedidosConsumidos(itensAcumulados);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar extrato da mesa:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [empresa?.id, restaurantSlug, numeroMesa]);

  // Calcula o total acumulado consumido na mesa
  const totalGeral = pedidosConsumidos.reduce((acc, item) => {
    const precoItem = item.precoFinal ?? item.preco ?? 0;
    return acc + (Number(precoItem) * Number(item.quantidade));
  }, 0);

  // Força o retorno do carregamento a ficar estilizado como modal para não quebrar o layout
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl font-bold text-stone-700 animate-pulse text-center">
          ⏳ Carregando extrato da mesa...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
        
        {/* Cabeçalho */}
        <div className="p-5 border-b flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-xl font-black text-stone-800 font-serif">Mesa {numeroMesa} • Extrato</h2>
            <p className="text-xs text-stone-500">Confira o consumo atual dos seus pedidos</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl font-bold p-1">
            ✕
          </button>
        </div>

        {/* Listagem dos Itens Consumidos */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-[#faf9f6]">
          {pedidosConsumidos.length === 0 ? (
            <p className="text-center text-stone-400 my-8">Nenhum consumo registrado para esta mesa ainda.</p>
          ) : (
            pedidosConsumidos.map((item, index) => {
              const precoItem = item.precoFinal ?? item.preco ?? 0;
              return (
                <div key={index} className="flex justify-between items-start border-b border-stone-200/60 pb-3">
                  <div>
                    <h4 className="font-bold text-[#3d2314] text-sm font-serif">
                      {item.quantidade}x {item.nome}
                    </h4>
                    {item.observacao && (
                      <p className="text-[11px] text-amber-700 italic">Obs: {item.observacao}</p>
                    )}
                  </div>
                  <span className="font-mono text-sm text-stone-700 font-bold">
                    {(Number(precoItem) * Number(item.quantidade)).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé e Ação de Fechamento */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-stone-600 font-bold uppercase tracking-wider text-xs">Total Consumido:</span>
            <span className="text-2xl font-black text-stone-900 font-mono">
              {totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <button 
            disabled={pedidosConsumidos.length === 0}
            className="w-full bg-[#3d2314] hover:bg-[#2b180d] disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 text-center py-4 rounded-xl font-black text-lg transition shadow-lg"
          >
            💳 Pagar e Fechar Conta
          </button>
        </div>

      </div>
    </div>
  );
}
