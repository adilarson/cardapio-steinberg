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
            <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-stone-400 uppercase tracking-wide">Empresa</p>
              <p className="font-semibold text-stone-800">{empresa.nome}</p>
              <p className="text-xs text-stone-400 mt-1">ID: {empresa.id}</p>
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

        {/* ====================================================== */}
        {/* GERADOR DE PDF DE IMPRESSÃO - ACOPLADO AO PORTAL SAAS */}
        {/* ====================================================== */}
        <div className="mt-10">
          <GeradorPdfPainel />
        </div>

      </div>
    </div>
  );
}
