import React from "react";
import restaurante from "../data/restaurante";

export default function Header({
  numeroMesa,
  handleLogoClick
}) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 px-4 py-6 text-center shadow-sm">

      <h1
        onClick={handleLogoClick}
        className="text-3xl font-serif tracking-widest text-amber-900 font-bold cursor-pointer"
      >
        {restaurante.nome}
      </h1>

      <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">
        {restaurante.slogan}
      </p>

      <p className="text-sm font-medium text-stone-600 mt-2">
        Olá! Seja bem-vindo à Mesa {numeroMesa}.
      </p>

    </header>
  );
}