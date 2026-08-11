import React from "react";

function Card({
  titulo,
  valor,
  icone,
  variacao,
  positiva,
  cor
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6">

      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ background: cor }}
      />

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm text-stone-500 font-medium">
            {titulo}
          </p>

          <h2 className="text-4xl font-bold text-stone-800 mt-3">
            {valor}
          </h2>

          <div
            className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${
              positiva
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {positiva ? "▲" : "▼"} {variacao}
          </div>

        </div>

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner"
          style={{
            background: cor
          }}
        >
          {icone}
        </div>

      </div>

    </div>
  );
}

export default function ResumoCards({

  receitaHoje,
  pedidosHoje,
  ticketMedio,
  totalProdutos

}) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <Card
        titulo="Receita Hoje"
        valor={`R$ ${receitaHoje}`}
        icone="💰"
        variacao="+18%"
        positiva={true}
        cor="linear-gradient(135deg,#16a34a,#4ade80)"
      />

      <Card
        titulo="Pedidos"
        valor={pedidosHoje}
        icone="🛒"
        variacao="+9%"
        positiva={true}
        cor="linear-gradient(135deg,#2563eb,#60a5fa)"
      />

      <Card
        titulo="Ticket Médio"
        valor={`R$ ${ticketMedio}`}
        icone="📊"
        variacao="-3%"
        positiva={false}
        cor="linear-gradient(135deg,#d97706,#facc15)"
      />

      <Card
        titulo="Produtos"
        valor={totalProdutos}
        icone="📦"
        variacao="+12"
        positiva={true}
        cor="linear-gradient(135deg,#7c3aed,#c084fc)"
      />

    </div>

  );

}