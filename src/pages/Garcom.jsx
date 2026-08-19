import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";

export default function Garcom() {
  const { empresa, carregarRestaurantePorSlug } = useEmpresa();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [chamados, setChamados] = useState([]); // Estado para os chamados de tirar dúvidas e fechamento
  const { restaurantSlug } = useParams();

  useEffect(() => {
    if (restaurantSlug && (!empresa || empresa.slug !== restaurantSlug)) {
      carregarRestaurantePorSlug(restaurantSlug);
    }
  }, [restaurantSlug, empresa, carregarRestaurantePorSlug]);

  // Escuta ativa de pedidos prontos para entrega
  useEffect(() => {
    if (!empresa?.id) {
      setPedidos([]);
      return;
    }
    const q = query(
      collection(db, "restaurantes", empresa.id, "pedidos"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPedidos(listaPedidos);
    }, (error) => {
      console.error("Erro ao buscar pedidos:", error);
    });

    return () => unsubscribe();
  }, [empresa?.id]);

  // Escuta ativa e REATIVA dos chamados com áudio
  useEffect(() => {
    if (!empresa?.id) {
      setChamados([]);
      return;
    }
    const qChamados = query(
      collection(db, "restaurantes", empresa.id, "chamados"),
      orderBy("timestamp", "asc")
    );

    const unsubscribeChamados = onSnapshot(qChamados, (snapshot) => {
      const listaChamados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Toca um alerta sonoro de notificação caso entre um novo chamado
      if (listaChamados.length > chamados.length) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Tom agradável de campainha
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
          console.log("AudioContext bloqueado ou não suportado:", e);
        }
      }

      setChamados(listaChamados);
    });

    return () => unsubscribeChamados();
  }, [empresa?.id, chamados.length]);

    async function mudarStatusPedido(id, novoStatus) {
    if (!empresa?.id) return;
    try {
      const docRef = doc(db, "restaurantes", empresa.id, "pedidos", id);
      
      const pedidoAtual = pedidos.find(p => p.id === id);
      const atualizacao = { status: novoStatus };
      
      // Se for dinheiro, o garçom confirma o recebimento físico e finaliza
      if (novoStatus === "Entregue" && pedidoAtual?.metodoPagamento === "dinheiro") {
        atualizacao.status = "Finalizado";
        atualizacao.pago = true;
      }

      // CORREÇÃO AQUI: Passando o objeto correto 'atualizacao'
      await updateDoc(docRef, atualizacao); 
    } catch (e) {
      console.error("Erro ao alterar status do pedido:", e);
    }
  }


  async function atenderChamado(id) {
    if (!empresa?.id) return;
    try {
      const docRef = doc(db, "restaurantes", empresa.id, "chamados", id);
      await deleteDoc(docRef); // Remove da tela assim que o garçom dá ok e vai até a mesa
    } catch (e) {
      console.error("Erro ao remover chamado atendido:", e);
    }
  }

  if (!empresa) {
    return <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center font-bold">Carregando painel...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans p-4 pb-20">
      <header className="flex justify-between items-center border-b border-stone-300 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 font-serif">
            {empresa.nome.toUpperCase()} • GARÇOM
          </h1>
          <p className="text-xs text-stone-500">Monitor Operacional de Salão</p>
        </div>
        <button
          onClick={() => navigate(`/${empresa.slug}`)}
          className="bg-stone-300 hover:bg-stone-400 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Sair Painel
        </button>
      </header>
    <div className="max-w-md mx-auto space-y-6">
        {/* MONITOR DE CHAMADOS (SUPORTE E FECHAMENTO EM TEMPO REAL) */}
        {chamados.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 shadow-lg space-y-3">
            <h2 className="text-sm font-black text-red-700 tracking-wider uppercase animate-pulse flex items-center gap-2">
              🚨 ALERTAS OPERACIONAIS DE MESA:
            </h2>
            <div className="space-y-2">
              {chamados.map((chamado) => {
                const ehFechamento = chamado.tipo === "fechamento";
                return (
                  <div 
                    key={chamado.id} 
                    className={`p-3 rounded-lg border flex justify-between items-center shadow-sm ${
                      ehFechamento ? "bg-amber-50 border-amber-300 animate-pulse" : "bg-white border-red-200"
                    }`}
                  >
                    <div>
                      <span className={`font-serif font-black text-lg ${ehFechamento ? "text-amber-900" : "text-red-900"}`}>
                        MESA {chamado.mesa}
                      </span>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {ehFechamento ? "💰 SOLICITOU CONTA EM DINHEIRO" : `🙋 Suporte às ${chamado.hora}`}
                      </p>
                    </div>
                    <button
                      onClick={() => atenderChamado(chamado.id)}
                      className={`font-bold text-xs px-4 py-2 rounded-lg transition text-white ${
                        ehFechamento ? "bg-amber-700 hover:bg-amber-800" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {ehFechamento ? "Recebido ✓" : "Estou Indo ✓"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MONITOR DE ENTREGAS DOS PEDIDOS PRONTOS */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pratos para Servir</h2>
          
          {pedidos.filter(p => p.status === "Pronto" || p.status === "Aguardando Garçom").length === 0 ? (
            <p className="text-center text-sm text-stone-400 my-8 italic">Nenhum prato aguardando entrega no balcão.</p>
          ) : (
            pedidos
              .filter(p => p.status === "Pronto" || p.status === "Aguardando Garçom")
              .map(pedido => {
                const estaPago = pedido.pago === true || pedido.pago === "true";
                return (
                  <div 
                    key={pedido.id} 
                    className={`p-4 rounded-xl border shadow-md transition-all ${
                      pedido.status === "Aguardando Garçom" ? "bg-amber-50/60 border-amber-400" : "bg-white border-amber-300"
                    }`}
                  >
                                      <div className="flex justify-between items-start mb-3 pb-2 border-b border-stone-100">
                    <div>
                      <span className="text-lg font-bold text-amber-900 block">🔔 SERVIR MESA {pedido.mesa}</span>
                      
                      {/* BADGES FINANCEIROS NO SALÃO */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {estaPago ? (
                          <span className="bg-green-100 text-green-800 text-[9px] px-2 py-0.5 rounded font-black tracking-wide uppercase">
                            📱 PAGO ONLINE ({pedido.metodoPagamento})
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-[9px] px-2 py-0.5 rounded font-black tracking-wide uppercase">
                            💵 RECEBER COM O GARÇOM
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* CONTAINER DA DIREITA COM O STATUS E AS DATAS ATUALIZADAS */}
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[10px] bg-amber-100 px-2 py-0.5 text-amber-900 rounded font-black tracking-wide uppercase">
                        PRONTO
                      </span>
                      <span className="text-xs font-black text-stone-600 block leading-tight">
                        {pedido.hora || "00:00"}
                      </span>
                      <span className="text-[10px] text-stone-400 block leading-tight">
                        {pedido.timestamp?.toDate 
                          ? pedido.timestamp.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) 
                          : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  
                    {pedido.observacao && (
                      <p className="bg-amber-50 text-[#3d2314] text-xs p-2.5 rounded-lg border border-amber-200 mb-3 italic font-semibold">
                        📢 Obs Geral: "{pedido.observacao}"
                      </p>
                    )}

                    <ul className="text-sm text-stone-600 space-y-3 my-3 border-t border-b border-stone-100 py-3">
                      {pedido.itens.map((item, idx) => (
                        <li key={idx} className="bg-stone-50/60 p-2 rounded-lg border border-stone-100">
                          <div className="font-bold text-stone-800">
                            • {item.quantidade}x {item.nome}
                          </div>
                          
                          {item.configuracoes && Object.entries(item.configuracoes).map(([grupo, valor]) => (
                            <div key={grupo} className="ml-4 mt-0.5 text-xs text-stone-500">
                              <strong>{grupo}:</strong> {Array.isArray(valor) ? valor.join(", ") : valor}
                            </div>
                          ))}

                          {(item.observacao || item.observacaoDoConfigurador) && (
                            <div className="ml-4 mt-1 text-xs text-amber-800 italic font-medium bg-amber-50/50 inline-block px-2 py-0.5 rounded border border-amber-100">
                              📝 Nota: {item.observacao || item.observacaoDoConfigurador}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => mudarStatusPedido(pedido.id, "Entregue")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-black tracking-wide shadow transition"
                    >
                      {pedido.metodoPagamento === "dinheiro" ? "Confirmar Recebimento e Baixa" : "Marcar como Entregue"}
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
