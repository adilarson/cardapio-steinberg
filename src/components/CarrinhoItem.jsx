import React from "react";

export default function CarrinhoItem({
  item,
  aumentar,
  diminuir,
  remover
}) {
  const [aberto, setAberto] = React.useState(false);
  const quantidade = item.quantidade ?? 1;
  const precoUnitario = item.precoFinal ?? item.preco;
  const subtotal = precoUnitario * quantidade;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3>
      {item.nome}
    </h3>
     {item.selecoes &&
      Object.entries(item.selecoes).map(([grupo, valor]) => (
     <div
      key={grupo}
      className="text-xs text-stone-600 mt-1"
     >
      <strong>{grupo}:</strong>{" "}
      {Array.isArray(valor)
        ? valor.join(", ")
        : valor}
     </div>
      ))}
       {item.observacao && (
        <p className="text-xs italic text-amber-700 mt-2">
        📝 {item.observacao}
        </p>
       )}
        </div>
        <button
          onClick={remover}
          className="text-red-500 hover:text-red-700 text-lg"
        >
          🗑
        </button>

      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={diminuir}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300"
          >
            −
          </button>

          <span className="font-bold text-lg">
            {quantidade}
          </span>

          <button
            onClick={aumentar}
            className="w-8 h-8 rounded-full bg-amber-700 text-white hover:bg-amber-800"
          >
            +
          </button>
        </div>
        <div className="text-right">

          <p className="text-xs text-stone-500">
            R$ {precoUnitario.toFixed(2)} cada
          </p>
          <p className="font-bold text-lg text-amber-900">
            R$ {subtotal.toFixed(2)}

          </p>
        </div>
      </div>

    </div>
  );
}