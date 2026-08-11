import React, { useState } from "react";
import Dashboard from "./Dashboard";
import RestaurantesMaster from "./RestaurantesMaster";
import Restaurante from "./Restaurante";
import Categorias from "./Categorias";
import Pedidos from "./Pedidos";
import Usuarios from "./Usuarios";
import Configuracoes from "./Configuracoes";
import Assinatura from "./Assinatura";
import Produtos from "./Produtos";

export default function PainelMaster({ pedidos = [] }) {
  const [pagina, setPagina] = useState("dashboard");

  const menu = [
    { id: "dashboard", nome: "📊 Dashboard" },
    { id: "restaurantes", nome: "🏢 Restaurantes" },
    { id: "produtos", nome: "🍔 Produtos" },
    { id: "categorias", nome: "📂 Categorias" },
    { id: "pedidos", nome: "🧾 Pedidos" },
    { id: "usuarios", nome: "👥 Usuários" },
    { id: "configuracoes", nome: "⚙ Configurações" },
    { id: "assinatura", nome: "💳 Assinatura" }
  ];

  const renderPagina = () => {
    switch (pagina) {
      case "dashboard":
        return <Dashboard pedidos={pedidos} />;

      case "restaurantes":
        return <RestaurantesMaster />;

      case "produtos":
        return <Produtos />;

      case "categorias":
        return <Categorias />;

      case "pedidos":
        return <Pedidos pedidos={pedidos} />;

      case "usuarios":
        return <Usuarios />;

      case "configuracoes":
        return <Configuracoes />;

      case "assinatura":
        return <Assinatura />;

      default:
        return <Dashboard pedidos={pedidos} />;
    }
    };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      <aside className="w-64 bg-stone-950 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">
            Steinberg SaaS
          </h1>

          <p className="text-xs text-stone-400 mt-1">
            Painel Administrativo
          </p>
        </div>

        <nav className="space-y-2">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setPagina(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                pagina === item.id
                  ? "bg-amber-600 text-white"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              {item.nome}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-800">
          <p className="text-xs text-stone-500">
            Larson SaaS
          </p>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-stone-200 px-8 py-5">
          <h2 className="text-2xl font-bold text-stone-800">
            {menu.find((item) => item.id === pagina)?.nome}
          </h2>
        </header>

        <section className="p-8">
          {renderPagina()}
        </section>
      </main>
    </div>
  );
}