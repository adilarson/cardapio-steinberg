import React, { useEffect, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";
import {
  buscarAssinatura,
  criarAssinatura,
  alterarPlano
} from "../services/assinaturaService";

const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    preco: 79.9,
    descricao: "Para pequenos estabelecimentos.",
    recursos: [
      "Cardápio digital",
      "Pedidos",
      "Gestão de produtos",
      "Categorias",
      "Dashboard"
    ]
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco: 149.9,
    descricao: "Para restaurantes em crescimento.",
    destaque: true,
    recursos: [
      "Tudo do plano Básico",
      "Gestão de usuários",
      "Painel da cozinha",
      "Configuradores de produtos",
      "Relatórios"
    ]
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    preco: 299.9,
    descricao: "Para operações maiores.",
    recursos: [
      "Tudo do Profissional",
      "Múltiplos usuários",
      "Recursos avançados",
      "Gestão SaaS",
      "Suporte prioritário"
    ]
  }
];

export default function Assinatura() {
  const { empresa } = useEmpresa();
  const [assinatura, setAssinatura] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!empresa?.id) return;
    async function carregarAssinatura() {
      try {
        setCarregando(true);
        const dados = await buscarAssinatura(empresa.id);
        setAssinatura(dados);
      } catch (erro) {
        console.error("Erro ao carregar assinatura:", erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarAssinatura();
  }, [empresa]);

  const contratarPlano = async (plano) => {
    if (!empresa?.id) return;
    try {
      setProcessando(true);
      const hoje = new Date();
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 30);
      const novaAssinatura = {
        plano: plano.id,
        status: "ativa",
        inicio: hoje.toISOString(),
        vencimento: vencimento.toISOString(),
        valor: plano.preco
      };
      await criarAssinatura(empresa.id, novaAssinatura);
      setAssinatura(novaAssinatura);
    } catch (erro) {
      console.error("Erro ao criar assinatura:", erro);
      alert("Não foi possível ativar o plano.");
    } finally {
      setProcessando(false);
    }
  };

  const trocarPlano = async (plano) => {
    if (!empresa?.id) return;
    try {
      setProcessando(true);
      await alterarPlano(empresa.id, plano.id, plano.preco);
      setAssinatura(prev => ({
        ...prev,
        plano: plano.id,
        valor: plano.preco
      }));
    } catch (erro) {
      console.error("Erro ao alterar plano:", erro);
      alert("Não foi possível alterar o plano.");
    } finally {
      setProcessando(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const planoAtual = PLANOS.find(plano => plano.id === assinatura?.plano);

  if (!empresa) {
    return (
      <div className="min-h-screen bg-stone-100 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-4xl mb-3">💳</div>
          <h1 className="text-xl font-bold text-stone-800">Nenhuma empresa selecionada</h1>
          <p className="text-stone-500 mt-2">Selecione uma empresa para gerenciar a assinatura.</p>
        </div>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-stone-100 p-8">
        <div className="max-w-6xl mx-auto text-center text-stone-500">Carregando assinatura...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-medium text-amber-700">SaaS</p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Assinatura</h1>
          <p className="text-stone-500 mt-2">
            Gerencie o plano de <strong className="text-stone-700">{empresa.nome || "sua empresa"}</strong>
          </p>
        </div>

        {assinatura && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400">Plano atual</p>
                <h2 className="text-2xl font-bold text-stone-800 mt-1">
                  {planoAtual?.nome || assinatura.plano}
                </h2>
                <p className="text-stone-500 mt-1">R$ {Number(assinatura.valor || 0).toFixed(2)} / mês</p>
              </div>
              <div className="text-left md:text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${assinatura.status === "ativa" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {assinatura.status === "ativa" ? "Assinatura ativa" : assinatura.status}
                </span>
                <p className="text-xs text-stone-400 mt-2">Vencimento: {formatarData(assinatura.vencimento)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PLANOS.map(plano => {
            const atual = assinatura?.plano === plano.id;
            return (
              <div key={plano.id} className={`relative bg-white rounded-2xl shadow-sm border p-6 ${plano.destaque ? "border-amber-500 ring-2 ring-amber-100" : "border-stone-200"}`}>
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-600 text-white text-xs font-bold px-4 py-1 rounded-full">MAIS POPULAR</span>
                  </div>
                )}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-stone-800">{plano.nome}</h2>
                  <p className="text-sm text-stone-500 mt-2">{plano.descricao}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-stone-800">R$ {plano.preco.toFixed(2)}</span>
                  <span className="text-stone-500"> / mês</span>
                </div>
                <div className="space-y-3 mb-8">
                  {plano.recursos.map((recurso, index) => (
                    <div key={index} className="flex gap-2 text-sm text-stone-600">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{recurso}</span>
                    </div>
                  ))}
                </div>
                <button
                  disabled={processando || atual}
                  onClick={() => (atual ? null : assinatura ? trocarPlano(plano) : contratarPlano(plano))}
                  className={`w-full py-3 rounded-xl font-bold transition ${atual ? "bg-green-100 text-green-700 cursor-default" : plano.destaque ? "bg-amber-700 hover:bg-amber-800 text-white" : "bg-stone-800 hover:bg-stone-900 text-white"}`}
                >
                  {atual ? "Plano Atual" : processando ? "Processando..." : assinatura ? "Mudar para este plano" : "Escolher Plano"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm text-amber-800">
            <strong>Importante:</strong> nesta primeira versão o gerenciamento de planos é feito diretamente pelo sistema. A integração com pagamentos online será adicionada em uma etapa posterior.
          </p>
        </div>
      </div>
    </div>
  );
}
