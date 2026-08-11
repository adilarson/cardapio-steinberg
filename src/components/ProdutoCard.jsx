import React from "react";

export default function ProdutoCard({
  item,
  itemStatus,
  adicionarAoCarrinho
}) {
    const preco =
     typeof item.preco === "object"
    ? item.preco.preco
    : item.preco;

     const destaque = item.destaque === true;

     const possuiAdicionais =
       item.adicionais &&
       item.adicionais.length > 0;
  return (
    <div
  className={`

    ${
      destaque
        ? "border-2 border-amber-500 bg-amber-50"
        : "border border-stone-200 bg-white"
      }

          p-4
          rounded-xl
          shadow-sm
          flex
          flex-col
          justify-between
          transition-opacity
      ${!itemStatus?.aberto ? "opacity-60" : ""}
     `}
      >
        <div>

        <div className="flex justify-between items-start gap-2">

          <h3 className="font-serif text-lg font-bold text-stone-900">
            {item.nome}
          </h3>

          {!item.variacoes && item.preco !== undefined && (
           <span className="font-medium text-amber-900 whitespace-nowrap">
          R$ {Number(preco).toFixed(2)}
          </span>
       )}

        </div>
        <p className="text-sm text-stone-500 mt-1 leading-relaxed">
        {item.descricao}
        </p>

        {possuiAdicionais && (
        <p className="mt-2 text-xs text-amber-700 font-semibold">
          Personalize este prato →
        </p>
      )}

      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2">

        {item.variacoes ? (

          <div className="grid grid-cols-2 gap-2">

            {item.variacoes.map(v => (

              <button
                key={v.tamanho}
                disabled={!itemStatus?.aberto}
                onClick={() => adicionarAoCarrinho(item, v)}
                className={`text-xs py-2 px-3 rounded-lg font-medium flex justify-between ${
                  !itemStatus?.aberto
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-stone-100 hover:bg-amber-900 hover:text-white text-stone-800"
                }`}
              >
                <span>{v.tamanho}</span>
                <span>
                 R${Number(v.preco).toFixed(2)}
                 </span>
              </button>

            ))}

          </div>

        ) : (

          <button
            disabled={!itemStatus.aberto}
            onClick={() => adicionarAoCarrinho(item)}
            className={`w-full text-sm py-2 rounded-lg font-medium transition-colors ${
              !itemStatus?.aberto
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : "bg-amber-900 text-white hover:bg-amber-950"
            }`}
          >
            {!itemStatus?.aberto
              ? "Indisponível no Horário"
              : "Adicionar ao Pedido"}
          </button>

        )}

      </div>

    </div>
  );

}