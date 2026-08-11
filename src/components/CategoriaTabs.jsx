import React from "react";

export default function CategoriaTabs({
  categorias,
  categoriaAtiva,
  setCategoriaAtiva,
}) {
  return (
    <div className="sticky top-0 z-20 bg-stone-100 py-3 px-2 border-b border-stone-200">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">

        {categorias.map((categoria) => {

          const nome =
            typeof categoria === "string"
              ? categoria
              : categoria.nome;

          return (
            <button
              key={nome}
              onClick={() => setCategoriaAtiva(nome)}
              className={`
                flex-shrink-0
                px-4
                py-2
                rounded-full
                text-sm
                font-semibold
                transition-all

                ${
                  categoriaAtiva === nome
                    ? "bg-amber-900 text-white shadow"
                    : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                }
              `}
            >
              {nome}
            </button>
          );
        })}
      </div>
    </div>
  );
}