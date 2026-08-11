import React from "react";

export default function CarrinhoVazio() {

  return (

    <div className="fixed inset-0 flex items-end justify-center pointer-events-none z-50">

      <div className="w-full max-w-md m-4">

        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 p-8 text-center">

          <div className="text-6xl mb-4">
            🛒
          </div>

          <h2 className="text-2xl font-bold text-stone-800">
            Seu carrinho está vazio
          </h2>

          <p className="text-stone-500 mt-3 leading-relaxed">
            Adicione produtos do cardápio para montar seu pedido.
          </p>

        </div>

      </div>

    </div>

  );

}