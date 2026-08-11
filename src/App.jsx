import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EmpresaProvider } from "./context/EmpresaContext";
import AdminLayout from "./layouts/AdminLayout";

import Cliente from "./pages/Cliente";
import Cozinha from "./pages/Cozinha";
import Garcom from "./pages/Garcom";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import Pedidos from "./pages/Pedidos";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import Assinatura from "./pages/Assinatura";
import ConfigurarProduto from "./pages/ConfigurarProduto";
import RestaurantesMaster from "./pages/RestaurantesMaster"; 

export default function App() {
  return (
    <EmpresaProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. ROTA MASTER GLOBAL DO SAAS */}
          <Route path="/larson-master" element={<AdminLayout tipo="master"><RestaurantesMaster /></AdminLayout>} />

          {/* 2. ROTAS DO CLIENTE FINAL (Cardápio Digital Dinâmico) */}
          <Route path="/:restaurantSlug" element={<Cliente />} />
          
          {/* 3. ROTAS ADMINISTRATIVAS E OPERACIONAIS DO INQUILINO (Vinculadas ao Slug) */}
          <Route path="/:restaurantSlug/painel/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/:restaurantSlug/painel/produtos" element={<AdminLayout><Produtos /></AdminLayout>} />
          <Route path="/:restaurantSlug/painel/categorias" element={<AdminLayout><Categorias /></AdminLayout>} />
          <Route path="/:restaurantSlug/painel/pedidos" element={<AdminLayout><Pedidos /></AdminLayout>} />
          <Route path="/:restaurantSlug/painel/garcons" element={<AdminLayout><Usuarios /></AdminLayout>} />
          <Route path="/:restaurantSlug/painel/configuracoes" element={<AdminLayout><Configuracoes /></AdminLayout>} />
          <Route path="/:restaurantSlug/painel/assinatura" element={<AdminLayout><Assinatura /></AdminLayout>} />
          <Route path="/:restaurantSlug/painel/configurar-product" element={<AdminLayout><ConfigurarProduto /></AdminLayout>} />
          
          <Route path="/:restaurantSlug/painel/cozinha" element={<Cozinha />} />
          <Route path="/:restaurantSlug/painel/garcom" element={<Garcom />} />

          <Route path="*" element={<div className="p-8 text-center text-xl font-bold">Por favor, acesse através do link do restaurante.</div>} />
        </Routes>
      </BrowserRouter>
    </EmpresaProvider>
  );
}
