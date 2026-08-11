import React from "react";
import { NavLink } from "react-router-dom";
import { useEmpresa } from "../context/EmpresaContext";

export default function Sidebar({ tipo = "restaurante" }) {
  const { empresa } = useEmpresa();

  const linkClasse = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
      isActive 
        ? "bg-amber-500 text-stone-900 shadow-md font-bold" 
        : "text-stone-300 hover:bg-stone-800 hover:text-white"
    }`;

  if (tipo === "master") {
    return (
      <aside className="w-72 bg-stone-900 text-white flex flex-col min-h-screen">
        <div className="p-8 border-b border-stone-700">
          <h1 className="text-2xl font-serif font-bold text-amber-400">LARSON SAAS</h1>
          <p className="text-xs text-stone-400 mt-1">Painel Administrativo Global</p>
        </div>
        <nav className="flex-1 p-5 space-y-2">
          <NavLink to="/larson-master" className={linkClasse}>
            <span>🏢</span> Restaurantes Cadastrados
          </NavLink>
        </nav>
      </aside>
    );
  }

  // Define o prefixo dinâmico com o slug da empresa ativa (ex: /steinberg-eco-village)
  const prefixo = empresa?.slug ? `/${empresa.slug}` : "";

  return (
    <aside className="w-72 bg-stone-900 text-white flex flex-col min-h-screen">
      <div className="p-8 border-b border-stone-700">
        <h1 className="text-2xl font-serif font-bold text-amber-400">
          {empresa?.nome ? empresa.nome.toUpperCase() : "CARREGANDO..."}
        </h1>
        <p className="text-xs text-stone-400 mt-1">Restaurant Manager</p>
      </div>
      <nav className="flex-1 p-5 space-y-2">
        <NavLink to={`${prefixo}/painel/admin`} className={linkClasse}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to={`${prefixo}/painel/produtos`} className={linkClasse}>
          <span>🍽</span> Produtos
        </NavLink>
        <NavLink to={`${prefixo}/painel/categorias`} className={linkClasse}>
          <span>📂</span> Categorias
        </NavLink>
        <NavLink to={`${prefixo}/painel/pedidos`} className={linkClasse}>
          <span>🛒</span> Pedidos
        </NavLink>
        <NavLink to={`${prefixo}/painel/cozinha`} className={linkClasse}>
          <span>👨‍🍳</span> Cozinha
        </NavLink>
        <NavLink to={`${prefixo}/painel/garcom`} className={linkClasse}>
          <span>🧑‍💼</span> Garçons
        </NavLink>
        <NavLink to={`${prefixo}/painel/configuracoes`} className={linkClasse}>
          <span>⚙</span> Configurações
        </NavLink>
      </nav>
    </aside>
  );
}
