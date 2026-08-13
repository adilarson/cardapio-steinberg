import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function ContaMesa({ empresaId, numeroMesa, onClose }) {
  const [pedidosConsumidos, setPedidosConsumidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId || !numeroMesa) return;

    // Busca os pedidos ativos da mesa diretamente da subcoleção do inquilino SaaS
    const q = query(
      collection(db, "restaurantes", empresaId, "pedidos"),
      where("mesa", "==", numeroMesa),
      where("status", "!=", "Finalizado") // Ignora pedidos já encerrados em dias/turnos anteriores
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let itensAcumulados = [];
      snapshot.docs.forEach((doc) => {
        const dadosPedido = doc.data();
        if (dadosPedido.itens) {
          // Passa o campo observação adiante para exibir na conta do cliente se necessário
          itensAcumulados = [...itensAcumulados, ...dadosPedido.itens];
        }
      });
      setPedidosConsumidos(itensAcumulados);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [empresaId, numeroMesa]);

  // Calcula o total acumulado consumido na mesa
  const totalGeral = pedidosConsumidos.reduce((acc, item) => {
    const precoItem = item.precoFinal ?? item.preco ?? 0;
    return acc + (Number(precoItem) * Number(item.quantidade));
  }, 0);

  if (loading) {
    return <div className="p-4 text-center font-bold text-stone-600 bg-white rounded-xl shadow">Carregando consumo...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-5 border-b flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-xl font-black text-stone-800">Conta da Mesa {numeroMesa}</h2>
            <p className="text-xs text-stone-500">Confira o consumo atual dos seus pedidos</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl font-bold p-1">
            ✕
          </button>
        </div>

        {/* Listagem dos Itens Consumidos */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {pedidosConsumidos.length === 0 ? (
            <p className="text-center text-stone-400 my-8">Nenhum consumo registrado para esta mesa ainda.</p>
          ) : (
            pedidosConsumidos.map((item, index) => {
              const precoItem = item.precoFinal ?? item.preco ?? 0;
              return (
                <div key={index} className="flex justify-between items-start border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-center py-4 rounded-xl font-black text-lg transition shadow-lg shadow-emerald-600/20"
          >
            💳 Pagar e Fechar Conta
          </button>
        </div>

      </div>
    </div>
  );
}
