import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import DashboardCards from "../components/DashboardCards";
import ProdutosMaisVendidos from "../components/ProdutosMaisVendidos";
import UltimosPedidos from "../components/UltimosPedidos";
import { useEmpresa } from "../context/EmpresaContext";
import { useParams } from "react-router-dom";
import GeradorPdfPainel from "../components/GeradorPdfPainel";

export default function Dashboard() {
  const { restaurantSlug } = useParams(); // Captura o slug da nova URL
  const { empresa, carregarRestaurantePorSlug } = useEmpresa();
  const [pedidos, setPedidos] = useState([]);
  
  // ESTADOS PARA O MÓDULO DE FECHAMENTO DE CAIXA
  const [modalCaixaAberto, setModalCaixaAberto] = useState(false);
  const [valoresDeclarados, setValoresDeclarados] = useState({ pix: "", cartao: "", dinheiro: "" });
  const [caixaConciliado, setCaixaConciliado] = useState(false);

  useEffect(() => {
    if (restaurantSlug && (!empresa || empresa.slug !== restaurantSlug)) {
      carregarRestaurantePorSlug(restaurantSlug);
    }
  }, [restaurantSlug, empresa]);

  useEffect(() => {
    if (!empresa?.id) return;

    const q = query(
      collection(db, "restaurantes", empresa.id, "pedidos"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(listaPedidos);
    }, (error) => {
      console.error("Erro ao carregar pedidos do dashboard:", error);
    });

    return () => unsubscribe();
  }, [empresa?.id]);

  // ENGINE CONTÁBIL AUTOMATIZADA (Varre os pedidos calculando os totais por método)
  const contabilidade = pedidos.reduce((acc, pedido) => {
    // Considera apenas pedidos pagos ou prontos/entregues que não estejam cancelados
    if (pedido.pago === true || pedido.status === "Pronto" || pedido.status === "Entregues") {
      const metodo = pedido.metodoPagamento || "não especificado";
      
      // Calcula o valor total deste pedido em específico
      const totalPedido = pedido.itens?.reduce((soma, item) => {
        const preco = item.precoFinal ?? item.preco ?? 0;
        return soma + (Number(preco) * Number(item.quantidade));
      }, 0) || 0;

      if (metodo === "pix") acc.pix += totalPedido;
      else if (metodo === "cartao") acc.cartao += totalPedido;
      else if (metodo === "dinheiro") acc.dinheiro += totalPedido;
      
      acc.faturamentoCalculado += totalPedido;
    }
    return acc;
  }, { pix: 0, cartao: 0, dinheiro: 0, faturamentoCalculado: 0 });

  // Calcula as discrepâncias contábeis (Calculado pelo Sistema vs Declarado pelo Operador)
  const diferencas = {
    pix: Number(valoresDeclarados.pix || 0) - contabilidade.pix,
    cartao: Number(valoresDeclarados.cartao || 0) - contabilidade.cartao,
    dinheiro: Number(valoresDeclarados.dinheiro || 0) - contabilidade.dinheiro,
  };

  if (!empresa) {
    return (
      <div className="min-h-screen bg-stone-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">🏢</div>
            <h1 className="text-xl font-bold text-stone-800">Nenhuma empresa selecionada</h1>
            <p className="text-stone-500 mt-2">Selecione uma empresa para visualizar o Dashboard.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-stone-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho do Dashboard */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Painel Administrativo</p>
              <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Dashboard</h1>
              <p className="text-stone-500 mt-2">
                Visão geral de <strong className="text-stone-700">{empresa.nome}</strong>
              </p>
            </div>
            
            {/* Bloco SaaS de Controle e Fechamento */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalCaixaAberto(true)}
                className="bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold px-4 py-3 rounded-xl shadow-sm text-sm transition flex items-center gap-2"
              >
                📊 Fechamento de Caixa
              </button>
              
              <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
                <p className="text-xs text-stone-400 uppercase tracking-wide">Empresa</p>
                <p className="font-semibold text-stone-800">{empresa.nome}</p>
                <p className="text-xs text-stone-400 mt-1">ID: {empresa.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Informativos Superiores */}
        <DashboardCards pedidos={pedidos} />

        {/* Gráficos e Tabelas Operacionais */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <ProdutosMaisVendidos pedidos={pedidos} />
          <UltimosPedidos pedidos={pedidos} />
        </div>

        {/* Gerador de PDF de Impressão */}
        <div className="mt-10">
          <GeradorPdfPainel />
        </div>

      </div>
      {/* ====================================================== */}
      {/* MODAL SAAS: FECHAMENTO DE CAIXA & CONCILIAÇÃO BANCÁRIA */}
      {/* ====================================================== */}
      {modalCaixaAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Conciliação Contábil & Fechamento de Caixa</h2>
                <p className="text-xs text-stone-500">Auditoria de recebimentos em tempo real baseado no Firebase</p>
              </div>
              <button 
                onClick={() => { setModalCaixaAberto(false); setCaixaConciliado(false); }} 
                className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Corpo Técnico */}
            <div className="p-6 overflow-y-auto space-y-6 bg-stone-50/50">
              
              {/* Grid Contabilidade Calculada pelo Sistema */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl">
                  <span className="text-xs font-semibold text-teal-800 block">📱 Pix Registrado</span>
                  <span className="text-lg font-mono font-bold text-teal-900">
                    {contabilidade.pix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <span className="text-xs font-semibold text-amber-800 block">💳 Cartão Registrado</span>
                  <span className="text-lg font-mono font-bold text-amber-900">
                    {contabilidade.cartao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="bg-stone-100 border border-stone-300 p-4 rounded-xl">
                  <span className="text-xs font-semibold text-stone-700 block">💵 Dinheiro (Garçom)</span>
                  <span className="text-lg font-mono font-bold text-stone-900">
                    {contabilidade.dinheiro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </div>

              {/* Formulário de Auditoria Operacional */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Declarar Valores Físicos / Extratos</h3>
                <p className="text-xs text-stone-400">Insira os totais reais apurados fisicamente para validar contra a base de dados:</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Total Pix Banco</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="R$ 0,00"
                      value={valoresDeclarados.pix}
                      onChange={(e) => setValoresDeclarados({ ...valoresDeclarados, pix: e.target.value })}
                      className="w-full border border-stone-200 p-2.5 rounded-lg text-sm font-mono focus:outline-stone-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Total Relatório Card</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="R$ 0,00"
                      value={valoresDeclarados.cartao}
                      onChange={(e) => setValoresDeclarados({ ...valoresDeclarados, cartao: e.target.value })}
                      className="w-full border border-stone-200 p-2.5 rounded-lg text-sm font-mono focus:outline-stone-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Total Gaveta Dinheiro</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="R$ 0,00"
                      value={valoresDeclarados.dinheiro}
                      onChange={(e) => setValoresDeclarados({ ...valoresDeclarados, dinheiro: e.target.value })}
                      className="w-full border border-stone-200 p-2.5 rounded-lg text-sm font-mono focus:outline-stone-800"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCaixaConciliado(true)}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  ⚙️ Processar Conciliação de Valores
                </button>
              </div>

              {/* Relatório Analítico de Divergências Contábeis */}
              {caixaConciliado && (
                <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3 shadow-sm">
                  <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Resultado da Auditoria Geral</h3>
                  
                  <div className="divide-y divide-stone-100 text-sm">
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-stone-600">Discrepância no fluxo Pix:</span>
                      <span className={`font-mono font-bold ${diferencas.pix === 0 ? "text-green-600" : diferencas.pix > 0 ? "text-blue-600" : "text-red-600"}`}>
                        {diferencas.pix === 0 ? "✓ Sem divergências" : diferencas.pix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-stone-600">Discrepância no fluxo Cartão:</span>
                      <span className={`font-mono font-bold ${diferencas.cartao === 0 ? "text-green-600" : diferencas.cartao > 0 ? "text-blue-600" : "text-red-600"}`}>
                        {diferencas.cartao === 0 ? "✓ Sem divergências" : diferencas.cartao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <span className="text-stone-600">Quebra de Caixa em Dinheiro:</span>
                      <span className={`font-mono font-bold ${diferencas.dinheiro === 0 ? "text-green-600" : diferencas.dinheiro > 0 ? "text-blue-600" : "text-red-600"}`}>
                        {diferencas.dinheiro === 0 ? "✓ Sem divergências" : diferencas.dinheiro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-700">Faturamento Real do Turno:</span>
                    <span className="font-mono font-bold text-stone-900 text-base">
                      {contabilidade.faturamentoCalculado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Rodapé Fixo da Modal */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => { setModalCaixaAberto(false); setCaixaConciliado(false); }}
                className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-5 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider"
              >
                Fechar Auditoria
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
