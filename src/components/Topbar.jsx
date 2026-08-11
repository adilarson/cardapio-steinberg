import React from "react";
import { useEmpresa } from "../context/EmpresaContext";

export default function Topbar() {
  const { empresa } = useEmpresa();

  return (
    <header className="bg-white h-20 px-8 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">
          {empresa?.nome ? `Painel Administrativo` : "Painel Geral"}
        </h2>
        <p className="text-sm text-stone-500">
          {empresa?.nome ? `Gerenciamento completo do restaurante ${empresa.nome}` : "Gerenciamento global do ecossistema SaaS"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">Administrador</p>
          <p className="text-xs text-stone-500">Online</p>
        </div>
        <div className="w-11 h-11 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
}
            