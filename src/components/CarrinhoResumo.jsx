import React, { useState } from "react";

export default function CarrinhoResumo({
  subtotal,
  total,
  enviarPedidoAoFirebase
}) {
  const [observacaoPedido, setObservacaoPedido] = useState("");

  return (
    <div className="border-t border-stone-200 p-6 bg-white">

      <div className="mb-5">

        <label className="block text-sm font-semibold text-stone-700 mb-2">
          Observações do Pedido
        </label>

        <textarea
          rows={3}
          value={observacaoPedido}
          onChange={(e) => setObservacaoPedido(e.target.value)}
          placeholder="Ex.: entregar tudo junto, pouco sal, trazer ketchup..."
          className="w-full border border-stone-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-700"
        />

      </div>

      <div className="flex justify-between text-stone-600 mb-2">
        <span>Subtotal</span>
        <span>
          R$ {subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-2xl font-bold text-stone-800 mb-6">
        <span>Total</span>
        <span>
          R$ {total.toFixed(2)}
        </span>
      </div>

      <button
        onClick={() => enviarPedidoAoFirebase(observacaoPedido)}
        className="w-full bg-amber-900 hover:bg-amber-800 transition text-white py-4 rounded-2xl font-semibold text-lg shadow-lg"
      >
        Enviar Pedido
      </button>

    </div>
  );
}