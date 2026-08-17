import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDocs, writeBatch } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";

export default function ContaMesa({ restaurantSlug, numeroMesa, onClose }) {
  const { empresa } = useEmpresa();
  const [pedidosConsumidos, setPedidosConsumidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NOVOS ESTADOS PARA O MÓDULO DE PAGAMENTO E SPLIT (DIVISÃO)
  const [quantidadePessoas, setQuantidadePessoas] = useState(1);
  const [passoPagamento, setPassoPagamento] = useState("extrato"); // extrato, opcoes, pix, cartao, dinheiro, sucesso
  const [metodoSelecionado, setMetodoSelecionado] = useState("");
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  useEffect(() => {
    const idRestaurante = empresa?.id || restaurantSlug;
    if (!idRestaurante || !numeroMesa) return;

    const q = query(
      collection(db, "restaurantes", idRestaurante, "pedidos"),
      where("mesa", "==", numeroMesa),
      where("status", "!=", "Finalizado")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let itensAcumulados = [];
      snapshot.docs.forEach((doc) => {
        const dadosPedido = doc.data();
        if (dadosPedido.itens) {
          // Anexa o ID do documento pai em cada item para sabermos de qual pedido ele veio
          const itensComId = dadosPedido.itens.map(item => ({
            ...item,
            pedidoDocId: doc.id
          }));
          itensAcumulados = [...itensAcumulados, ...itensComId];
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

  // Calcula o valor por pessoa no Split the Bill
  const valorPorPessoa = totalGeral / (quantidadePessoas || 1);

  // Função para simular a baixa automatizada no Firebase (Garante o fluxo real no Admin/Cozinha)
  const finalizarPedidosNoFirebase = async () => {
    const idRestaurante = empresa?.id || restaurantSlug;
    if (!idRestaurante || !numeroMesa) return;
    
    setProcessandoPagamento(true);
    
    try {
      // Busca todos os pedidos ativos da mesa para atualizar o status em lote (Batch)
      const q = query(
        collection(db, "restaurantes", idRestaurante, "pedidos"),
        where("mesa", "==", numeroMesa),
        where("status", "!=", "Finalizado")
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((documento) => {
        const docRef = doc(db, "restaurantes", idRestaurante, "pedidos", documento.id);
        // Atualiza para Finalizado se pago em dinheiro com o garçom ou mantém na tela com marcador se pago online
        batch.update(docRef, { 
          status: metodoSelecionado === "dinheiro" ? "Finalizado" : "Pronto",
          pago: true,
          metodoPagamento: metodoSelecionado
        });
      });
      
      await batch.commit();
      
      // Se o cliente escolheu dinheiro, avisa o garçom criando um chamado de fechamento
      if (metodoSelecionado === "dinheiro") {
        const agora = new Date();
        const chamadosRef = collection(db, "restaurantes", idRestaurante, "chamados");
        // O código do Garcom.jsx já detecta e lista esse aviso em tempo real
        await addDoc(chamadosRef, {
          mesa: numeroMesa,
          tipo: "fechamento",
          hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          timestamp: new Date()
        });
      }

      setPassoPagamento("sucesso");
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
    } finally {
      setProcessandoPagamento(false);
    }
  };

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
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-5 border-b flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-xl font-black text-stone-800 font-serif">Mesa {numeroMesa} • Extrato</h2>
            <p className="text-xs text-stone-500">Confira o consumo e realize o pagamento</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl font-bold p-1">
            ✕
          </button>
        </div>

        {/* Corpo Dinâmico baseado no passo do pagamento */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-[#faf9f6]">
          
          {/* PASSO 1: EXTRATO TRADICIONAL + SPLIT THE BILL */}
          {passoPagamento === "extrato" && (
            <>
              {/* Bloco do Split (Dividir a Conta) */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  👥 Dividir a conta (Split the Bill)
                </span>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs text-stone-600">Quantas pessoas na mesa?</div>
                  <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                    <button 
                      onClick={() => setQuantidadePessoas(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-sm text-stone-800 min-w-[32px] text-center">
                      {quantidadePessoas}
                    </span>
                    <button 
                      onClick={() => setQuantidadePessoas(prev => prev + 1)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black"
                    >
                      +
                    </button>
                  </div>
                </div>
                {quantidadePessoas > 1 && (
                  <div className="pt-2 border-t border-stone-200/60 flex justify-between items-center text-xs font-medium text-amber-800">
                    <span>Valor por pessoa:</span>
                    <span className="font-mono font-bold text-sm">
                      {valorPorPessoa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                )}
              </div>

              {/* Listagem de Produtos */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Itens Consumidos</span>
                {pedidosConsumidos.length === 0 ? (
                  <p className="text-center text-stone-400 my-8">Nenhum consumo registrado para esta mesa ainda.</p>
                ) : (
                  pedidosConsumidos.map((item, index) => {
                    const precoItem = item.precoFinal ?? item.preco ?? 0;
                                        return (
                      <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-stone-100">
                        <div>
                          <span className="font-bold text-stone-800">{item.quantidade}x</span> <span className="text-stone-700">{item.nome}</span>
                        </div>
                        <span className="font-mono text-stone-600">
                          {(precoItem * item.quantidade).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* PASSO 5: TELA DE SUCESSO TOTAL */}
          {passoPagamento === "sucesso" && (
            <>
              ✓Mesa Finalizada!
              {metodoSelecionado === "dinheiro"
                ? "O chamado de fechamento foi enviado. O garçom está trazendo a sua conta na mesa!"
                : "Pagamento aprovado instantaneamente! Seu pedido já recebeu baixa automática no sistema."}
              Voltar ao Cardápio
            </>
          )}

        </div>

        {/* Rodapé Fixo de Valores (Oculto na tela de sucesso) */}
        {passoPagamento !== "sucesso" && (
          <div className="p-4 bg-white border-t">
            <div className="flex justify-between items-center mb-2">
              <span>{quantidadePessoas > 1 ? `Sua Cota (${quantidadePessoas}x):` : "Total da Mesa:"}</span>
              <span className="font-bold text-xl">
                {(quantidadePessoas > 1 ? valorPorPessoa : totalGeral).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>

            {quantidadePessoas > 1 && (
              <div className="flex justify-between items-center text-xs text-stone-500 mb-4">
                <span>Total Geral:</span>
                <span>{totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
            )}

            {passoPagamento === "extrato" ? (
              <button
                disabled={pedidosConsumidos.length === 0 || processandoPagamento}
                onClick={() => setPassoPagamento("opcoes")}
                className="w-full bg-[#3d2314] hover:bg-[#2b180d] disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 text-center py-4 rounded-xl font-black text-lg transition shadow-lg flex items-center justify-center gap-2"
              >
                💳 Escolher Forma de Pagamento
              </button>
            ) : (
              <button
                disabled={processandoPagamento}
                onClick={() => setPassoPagamento("opcoes")}
                className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition"
              >
                ⬅ Voltar Opções
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
