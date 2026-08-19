import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDocs, writeBatch, addDoc } from "firebase/firestore"; // Adicionado addDoc aqui
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

  const totalGeral = pedidosConsumidos.reduce((acc, item) => {
    const precoItem = item.precoFinal ?? item.preco ?? 0;
    return acc + (Number(precoItem) * Number(item.quantidade));
  }, 0);

  const valorPorPessoa = totalGeral / (quantidadePessoas || 1);

  // FUNÇÃO DE BAIXA ATUALIZADA (Força a gravação correta do método passado por parâmetro)
  const finalizarPedidosNoFirebase = async (metodoForcado) => {
  const idRestaurante = empresa?.id || restaurantSlug;
  
  // Captura o identificador exatamente como o componente recebeu na propriedade
  const mesaIdentificada = numeroMesa || "Principal";

  if (!idRestaurante) {
    console.error("Erro Crítico: ID do Restaurante ausente no fechamento.");
    return;
  }
  
  setProcessandoPagamento(true);
  // Garante que o método sempre seja injetado, mesmo se houver atraso de estado
  const metodoReal = metodoForcado || metodoSelecionado || "dinheiro";
  
  try {
    const mesaBusca = String(mesaIdentificada).trim();

    // Consulta flexível: busca pedidos que pertençam a esta mesa e que não estejam finalizados
    const q = query(
      collection(db, "restaurantes", idRestaurante, "pedidos"),
      where("status", "!=", "Finalizado")
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let atualizouAlgum = false;
    
    querySnapshot.docs.forEach((documento) => {
      const dadosAtuais = documento.data();
      
      const nomeMesaBanco = String(dadosAtuais.mesa || "").toLowerCase().trim();
      const nomeMesaBusca = mesaBusca.toLowerCase();
      
      // Validação tolerante para cobrir "Mesa Principal", "Principal", "02", etc.
      if (nomeMesaBanco === nomeMesaBusca || nomeMesaBanco.includes(nomeMesaBusca) || nomeMesaBusca.includes(nomeMesaBanco)) {
        const docRef = doc(db, "restaurantes", idRestaurante, "pedidos", documento.id);
        
        // Se escolheu dinheiro, muda o status para alertar o painel do garçom
        let novoStatus = dadosAtuais.status;
        if (metodoReal === "dinheiro") {
          novoStatus = "Aguardando Garçom";
        }
        
        batch.update(docRef, { 
          status: novoStatus,
          pago: metodoReal !== "dinheiro", // Pix/Cartão vira pago. Dinheiro fica falso até o garçom receber físico
          metodoPagamento: metodoReal,
          alertaFechamento: true
        });
        
        atualizouAlgum = true;
      }
    });
    
    if (atualizouAlgum) {
      await batch.commit();
    }
    
    // FLUXO DE FECHAMENTO FINANCEIRO DO BOTÃO "PAGAR COM O GARÇOM"
    if (metodoReal === "dinheiro") {
      const agora = new Date();
      const chamadosRef = collection(db, "restaurantes", idRestaurante, "chamados");
      
      // Envia o chamado mapeado com o tipo "fechamento" para acionar o painel do garçom
      await addDoc(chamadosRef, {
        mesa: mesaBusca,
        tipo: "fechamento", // <--- Isso dispara o card amarelo piscante do garçom
        hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        timestamp: new Date()
      });
    }

    // Avança a interface para a tela de sucesso
    setPassoPagamento("sucesso");
  } catch (error) {
    console.error("Erro ao processar fechamento de mesa no Firebase:", error);
  } finally {
    setProcessandoPagamento(false);
  }
};

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
                          {(Number(precoItem) * Number(item.quantidade)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* PASSO 2: SELEÇÃO DE MÉTODOS DE PAGAMENTO */}
          {passoPagamento === "opcoes" && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Selecione a Forma de Pagamento</span>
              
              <button 
                onClick={() => { setMetodoSelecionado("pix"); setPassoPagamento("pix"); }}
                className="w-full bg-white border-2 border-stone-200 hover:border-teal-600 p-4 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <h4 className="font-bold text-stone-800 group-hover:text-teal-700 transition">📱 Pix Dinâmico</h4>
                  <p className="text-xs text-stone-400 mt-0.5">Aprovação imediata e liberação automática</p>
                </div>
                <span className="text-stone-300 group-hover:text-teal-600 font-bold text-lg">➔</span>
              </button>

              <button 
                onClick={() => { setMetodoSelecionado("cartao"); setPassoPagamento("cartao"); }}
                className="w-full bg-white border-2 border-stone-200 hover:border-amber-700 p-4 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <h4 className="font-bold text-stone-800 group-hover:text-amber-800 transition">💳 Cartão de Crédito / Débito</h4>
                  <p className="text-xs text-stone-400 mt-0.5">Pague online com total segurança pelo celular</p>
                </div>
                <span className="text-stone-300 group-hover:text-amber-700 font-bold text-lg">➔</span>
              </button>

              <button 
                onClick={() => { setMetodoSelecionado("dinheiro"); finalizarPedidosNoFirebase(); }}
                className="w-full bg-white border-2 border-stone-200 hover:border-stone-700 p-4 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div>
                  <h4 className="font-bold text-stone-800 group-hover:text-stone-900 transition">💵 Pagar com o Garçom</h4>
                  <p className="text-xs text-stone-400 mt-0.5">Chama o atendente para pagar em Dinheiro ou Maquininha</p>
                </div>
                <span className="text-stone-300 group-hover:text-stone-800 font-bold text-lg">➔</span>
              </button>
            </div>
          )}
          {/* PASSO 3: TELA DO PIX DINÂMICO */}
          {passoPagamento === "pix" && (
            <div className="text-center py-4 space-y-4">
              <span className="bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Aguardando Pagamento Pix
              </span>
              <div className="w-44 h-44 bg-stone-200 mx-auto rounded-xl flex items-center justify-center border border-stone-300 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/10 to-transparent"></div>
                <span className="text-stone-400 text-xs px-4 text-center font-medium font-mono z-10">QR CODE PIX DINÂMICO DEMO</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border text-xs font-mono text-stone-600 break-all select-all cursor-pointer">
                00020101021226850014br.gov.bcb.pix2563pix.steinberg-demo-saas-total={totalGeral.toFixed(2)}
              </div>
              <p className="text-[11px] text-stone-400">Copie o código acima ou escaneie o QR Code no aplicativo do seu banco.</p>
               <button 
             onClick={() => finalizarPedidosNoFirebase("pix")} // <--- ADICIONE () => E O PARÂMETRO "pix" AQUI!
             className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
           >
             Simular Confirmação Bancária (Aprovar Pix)
             </button>
             </div>
          )}

          {/* PASSO 4: TELA DO CARTÃO ONLINE */}
          {passoPagamento === "cartao" && (
            <div className="space-y-4">
              <span className="bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider block text-center">
                Checkout de Cartão Seguro
              </span>
              <div className="space-y-3">
                <input type="text" placeholder="Número do Cartão" className="w-full border p-3 rounded-xl text-sm focus:outline-amber-800" disabled />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Validade (MM/AA)" className="w-full border p-3 rounded-xl text-sm focus:outline-amber-800" disabled />
                  <input type="text" placeholder="CVV" className="w-full border p-3 rounded-xl text-sm focus:outline-amber-800" disabled />
                </div>
                <input type="text" placeholder="Nome Impresso no Cartão" className="w-full border p-3 rounded-xl text-sm focus:outline-amber-800" disabled />
              </div>
              <button 
                onClick={() => finalizarPedidosNoFirebase("cartao")}
                className="w-full bg-[#3d2314] hover:bg-[#2b180d] text-amber-400 font-bold py-3 rounded-xl text-sm uppercase tracking-wider transition"
              >
                Simular Aprovação de Crédito
              </button>
            </div>
          )}

          {/* PASSO 5: TELA DE SUCESSO TOTAL */}
          {passoPagamento === "sucesso" && (
            <>
              ✓Mesa Finalizada!
              {metodoSelecionado === "dinheiro"
                ? "O chamado de fechamento foi enviado. O garçom está trazendo a sua conta na mesa!"
                : "Pagamento aprovado instantaneamente! Seu pedido já recebeu baixa automática no sistema."}
              <button 
                onClick={() => setPassoPagamento("extrato")} 
                className="block text-amber-800 underline font-bold mt-2 text-sm"
              >
                Voltar ao Cardápio
              </button>
            </>
          )}

        </div>

        {/* Rodapé Fixo de Valores (Oculto na tela de sucesso) */}
        {passoPagamento !== "sucesso" && (
          <div className="p-4 bg-white border-t border-stone-200">
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
