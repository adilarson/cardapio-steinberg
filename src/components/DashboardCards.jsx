import React from "react";

export default function DashboardCards({ pedidos = [] }) {
  const totalPedidos = pedidos.length;
  const faturamento = pedidos.reduce((total, pedido) => {
    if (!pedido.itens) return total;
    const valorPedido = pedido.itens.reduce((soma, item) => {
      return soma +
        ((item.precoFinal ?? item.preco) *
        (item.quantidade ?? 1));
    }, 0);
    return total + valorPedido;
  }, 0);
  const ticketMedio =
    totalPedidos > 0
      ? faturamento / totalPedidos
      : 0;
  const pendentes =
    pedidos.filter(p => p.status === "Pendente").length;
  const preparando =
    pedidos.filter(p => p.status === "Preparando").length;
  const prontos =
    pedidos.filter(p => p.status === "Pronto").length;
  const entregues =
    pedidos.filter(p => p.status === "Entregue").length;

  const cards = [
    {
      titulo: "Pedidos",
      valor: totalPedidos,
      cor: "bg-blue-600"
    },
    {
      titulo: "Faturamento",
      valor: `R$ ${faturamento.toFixed(2)}`,
      cor: "bg-green-600"
    },
    {
      titulo: "Ticket Médio",
      valor: `R$ ${ticketMedio.toFixed(2)}`,
      cor: "bg-amber-600"
    },
    {
      titulo: "Pendentes",
      valor: pendentes,
      cor: "bg-red-600"
    },
    {
      titulo: "Preparando",
      valor: preparando,
      cor: "bg-orange-600"
    },
    {
      titulo: "Prontos",
      valor: prontos,
      cor: "bg-purple-600"
    },
    {
      titulo: "Entregues",
      valor: entregues,
      cor: "bg-stone-700"
    }
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div
          key={card.titulo}
          className={`${card.cor} text-white rounded-2xl shadow-lg p-5`}
        >
          <div className="text-sm opacity-80">
            {card.titulo}
          </div>
          <div className="text-3xl font-bold mt-2">
            {card.valor}
          </div>
        </div>
      ))}
    </div>
  );
}