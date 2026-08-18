import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, getDocs, where } from "firebase/firestore";
import DashboardCards from "../components/DashboardCards";
import ProdutosMaisVendidos from "../components/ProdutosMaisVendidos";
import UltimosPedidos from "../components/UltimosPedidos";
import { useEmpresa } from "../context/EmpresaContext";
import { useParams } from "react-router-dom";
import GeradorPdfPainel from "../components/GeradorPdfPainel";

export default function Dashboard() {
  const { restaurantSlug } = useParams();
  const { empresa, carregarRestaurantePorSlug } = useEmpresa();
  const [pedidos, setPedidos] = useState([]);
  
  // NOVOS ESTADOS: CONTROLE DE PERÍODO (MÊS E ANO)
  const dataAtual = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(dataAtual.getMonth() + 1); // 1 a 12
  const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());

  // ESTADOS: FECHAMENTO DE CAIXA DIÁRIO
  const [modalCaixaAberto, setModalCaixaAberto] = useState(false);
  const [valoresDeclarados, setValoresDeclarados] = useState({ pix: "", cartao: "", dinheiro: "" });
  const [caixaConciliado, setCaixaConciliado] = useState(false);

  // ESTADOS: MÓDULO CONTÁBIL AVANÇADO (DRE / DESPESAS MENSAIS)
  const [modalDreAberto, setModalDreAberto] = useState(false);
  const [despesas, setDespesas] = useState([]);
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", valor: "", categoria: "Insumos" });

  useEffect(() => {
    if (restaurantSlug && (!empresa || empresa.slug !== restaurantSlug)) {
      carregarRestaurantePorSlug(restaurantSlug);
    }
  }, [restaurantSlug, empresa]);

  // Carrega Pedidos filtrando em tempo real (onSnapshot)
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

  // Carrega Despesas do Mês Selecionado (DRE) do Firebase
  useEffect(() => {
    if (!empresa?.id) return;

    const q = query(
      collection(db, "restaurantes", empresa.id, "despesas"),
      where("mes", "==", Number(mesSelecionado)),
      where("ano", "==", Number(anoSelecionado))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaDespesas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDespesas(listaDespesas);
    }, (error) => {
      console.error("Erro ao carregar despesas:", error);
    });

    return () => unsubscribe();
  }, [empresa?.id, mesSelecionado, anoSelecionado]);

  // ENGINE CONTÁBIL OTIMIZADA (Mais tolerante a variações de campos do Firebase)
    // ENGINE CONTÁBIL UNIVERSAL E CORRIGIDA
  const contabilidade = pedidos.reduce((acc, pedido) => {
    // 1. Extração segura da data do Firebase (evita erros de fuso horário ou conversão de milissegundos)
    let dataPedido = new Date();
    if (pedido.timestamp?.toDate) {
      dataPedido = pedido.timestamp.toDate();
    } else if (pedido.timestamp) {
      dataPedido = new Date(pedido.timestamp);
    } else {
      return acc; // Ignora se não houver registro de horário
    }

    // Alinhamento exato com o padrão do seletor (Janeiro = 1, Dezembro = 12)
    const mesPedido = dataPedido.getMonth() + 1;
    const anoPedido = dataPedido.getFullYear();

    // 2. Validação estrita do período selecionado na interface
    if (mesPedido === Number(mesSelecionado) && anoPedido === Number(anoSelecionado)) {
      
      // Validação tolerante para checar pagamento: aceita booleanos ou strings
      const estaPago = pedido.pago === true || pedido.pago === "true";
      
      // Qualquer status operável ou finalizado entra na contabilidade do turno
      const statusValido = ["Pendente", "Preparando", "Aguardando Garçom", "Pronto", "Entregue", "Entregues", "Finalizado"].includes(pedido.status);

      if (estaPago || statusValido) {
        // Normaliza a string do método para evitar falhas com acentuação ou caixa alta
        const metodo = String(pedido.metodoPagamento || "").toLowerCase().trim();
        
        // Soma o total do carrinho deste pedido
        const totalPedido = pedido.itens?.reduce((soma, item) => {
          const preco = item.precoFinal ?? item.preco ?? 0;
          return soma + (Number(preco) * Number(item.quantidade));
        }, 0) || 0;

        // Distribui o valor para a respectiva gaveta financeira
        if (metodo === "pix") {
          acc.pix += totalPedido;
        } else if (metodo === "cartao" || metodo === "cartão" || metodo === "credito" || metodo === "debito") {
          acc.cartao += totalPedido;
        } else if (metodo === "dinheiro") {
          acc.dinheiro += totalPedido;
        }
        
        // Faturamento bruto geral atualizado
        acc.faturamentoCalculado += totalPedido;
      }
    }
    return acc;
  }, { pix: 0, cartao: 0, dinheiro: 0, faturamentoCalculado: 0 });

  // Função para salvar nova despesa no Firestore
  const salvarDespesa = async (e) => {
    e.preventDefault();
    if (!novaDespesa.descricao || !novaDespesa.valor || !empresa?.id) return;

    try {
      await addDoc(collection(db, "restaurantes", empresa.id, "despesas"), {
        descricao: novaDespesa.descricao,
        valor: Number(novaDespesa.valor),
        categoria: novaDespesa.categoria,
        mes: Number(mesSelecionado),
        ano: Number(anoSelecionado),
        timestamp: new Date()
      });
      setNovaDespesa({ descricao: "", valor: "", categoria: "Insumos" });
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
    }
  };

  const totalDespesas = despesas.reduce((soma, d) => soma + Number(d.valor || 0), 0);
  const lucroLiquido = contabilidade.faturamentoCalculado - totalDespesas;

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
            
            {/* Bloco SaaS de Controle, Filtros e Fechamento */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Seletores de Período Mensal */}
              <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2 py-1.5 shadow-sm">
                <select 
                  value={mesSelecionado} 
                  onChange={(e) => { setMesSelecionado(Number(e.target.value)); setCaixaConciliado(false); }}
                  className="text-xs font-bold text-stone-700 bg-transparent outline-none cursor-pointer p-1"
                >
                  <option value={1}>Janeiro</option>
                  <option value={2}>Fevereiro</option>
                  <option value={3}>Março</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Maio</option>
                  <option value={6}>Junho</option>
                  <option value={7}>Julho</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Setembro</option>
                  <option value={10}>Outubro</option>
                  <option value={11}>Novembro</option>
                  <option value={12}>Dezembro</option>
                </select>
                <select 
                  value={anoSelecionado} 
                  onChange={(e) => { setAnoSelecionado(Number(e.target.value)); setCaixaConciliado(false); }}
                  className="text-xs font-bold text-stone-700 bg-transparent outline-none cursor-pointer p-1 border-l border-stone-200"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              <button
                onClick={() => setModalCaixaAberto(true)}
                className="bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold px-4 py-3 rounded-xl shadow-sm text-sm transition flex items-center gap-2"
              >
                📊 Fechamento Diário
              </button>

              <button
                onClick={() => setModalDreAberto(true)}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-4 py-3 rounded-xl shadow-sm text-sm transition flex items-center gap-2"
              >
                💼 DRE / Despesas
              </button>
              
              <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
                <p className="text-xs text-stone-400 uppercase tracking-wide">Empresa</p>
                <p className="font-semibold text-stone-800 text-sm">{empresa.nome}</p>
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
      {/* MODAL 1: FECHAMENTO DE CAIXA DIÁRIO & CONCILIAÇÃO       */}
      {/* ====================================================== */}
      {modalCaixaAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Conciliação Contábil & Fechamento de Caixa</h2>
                <p className="text-xs text-stone-500">Auditoria de recebimentos em tempo real para o período selecionado</p>
              </div>
              <button 
                onClick={() => { setModalCaixaAberto(false); setCaixaConciliado(false); }} 
                className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Corpo Técnico com a exibição dos valores corrigida */}
            <div className="p-6 overflow-y-auto space-y-6 bg-stone-50/50">
              
              {/* Grid Contabilidade Calculada pelo Sistema */}
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Valores Registrados no Sistema</span>
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
                    <span className="font-bold text-stone-700">Faturamento Bruto do Período:</span>
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
      {/* ====================================================== */}
      {/* MODAL 2: DRE MENSAL & GESTÃO DE DESPESAS             */}
      {/* ====================================================== */}
      {modalDreAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">DRE Mensal Avançado & Lançamento de Custos</h2>
                <p className="text-xs text-stone-500">Balanço do período: {mesSelecionado}/{anoSelecionado}</p>
              </div>
              <button onClick={() => setModalDreAberto(false)} className="text-stone-400 hover:text-stone-600 text-xl font-bold p-1">✕</button>
            </div>

            <div className="p-6 overflow-y-auto grid md:grid-cols-2 gap-6 bg-stone-50/50">
              {/* Painel Esquerdo: Lançador de Despesas */}
              <form onSubmit={salvarDespesa} className="bg-white border border-stone-200 p-5 rounded-xl space-y-4 h-fit shadow-sm">
                <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Novo Lançamento de Gasto</h3>
                
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Descrição</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Aluguel, Nota Insumos, Salários"
                    value={novaDespesa.descricao}
                    onChange={(e) => setNovaDespesa({ ...novaDespesa, descricao: e.target.value })}
                    className="w-full border border-stone-200 p-2 text-sm rounded-lg focus:outline-stone-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Valor (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0,00"
                      value={novaDespesa.valor}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, valor: e.target.value })}
                      className="w-full border border-stone-200 p-2 text-sm rounded-lg focus:outline-stone-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">Categoria</label>
                    <select
                      value={novaDespesa.categoria}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, categoria: e.target.value })}
                      className="w-full border border-stone-200 p-2 text-sm rounded-lg bg-white focus:outline-stone-800"
                    >
                      <option value="Insumos">Insumos / Produtos</option>
                      <option value="Pessoal">Salários / Pessoal</option>
                      <option value="Estrutural">Aluguel / Contas</option>
                      <option value="Marketing">Marketing / Tráfego</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition">
                  ➕ Registrar Despesa no Mês
                </button>
              </form>

              {/* Painel Direito: Resumo e Lista DRE */}
              <div className="space-y-4">
                {/* DRE Flash Resumo */}
                <div className="bg-stone-900 p-4 rounded-xl text-white space-y-2.5 shadow-md">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>(+) Faturamento Bruto:</span>
                    <span className="font-mono">{contabilidade.faturamentoCalculado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-400">
                    <span>(-) Custos Totais:</span>
                    <span className="font-mono">-{totalDespesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-700 flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400">(=) Lucro Líquido:</span>
                    <span className={`font-mono font-bold text-lg ${lucroLiquido >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {lucroLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>

                {/* Listagem de Itens Cadastrados */}
                <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Histórico de Lançamentos</span>
                  <div className="max-h-[180px] overflow-y-auto divide-y divide-stone-100 text-xs">
                    {despesas.length === 0 ? (
                      <p className="text-center text-stone-400 py-6">Nenhum custo lançado para este período.</p>
                    ) : (
                      despesas.map((d) => (
                        <div key={d.id} className="py-2 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-stone-800">{d.descricao}</p>
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">{d.categoria}</span>
                          </div>
                          <span className="font-mono text-red-600 font-bold">
                            -{Number(d.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button onClick={() => setModalDreAberto(false)} className="bg-stone-900 hover:bg-stone-800 text-amber-400 px-5 py-2 rounded-xl text-xs font-bold transition uppercase tracking-wider">
                Concluir Balanço
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
