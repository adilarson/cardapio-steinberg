import React from "react";

export default function ProdutosMaisVendidos({ pedidos }) {
  const ranking = {};
  pedidos.forEach(pedido => {
    if (!pedido.itens) return;
    pedido.itens.forEach(item => {
      const nome = item.nome;
      if (!ranking[nome]) {
        ranking[nome] = {
          nome,
          quantidade: 0,
          faturamento: 0
        };
      }
      ranking[nome].quantidade += item.quantidade ?? 1;
      ranking[nome].faturamento +=
        (item.precoFinal ?? item.preco) *
        (item.quantidade ?? 1);
    });
  });
  const lista = Object.values(ranking)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  return (

    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">
        🔥 Produtos Mais Vendidos
      </h2>
      {lista.length === 0 ? (
        <p className="text-stone-500">
          Nenhum pedido encontrado.
        </p>
      ) : (
        <div className="space-y-4">
          {lista.map((produto, index) => (
            <div
              key={produto.nome}
              className="flex justify-between items-center border-b pb-3"
            >
              <div>
                <div className="font-semibold">
                  #{index + 1} {produto.nome}
                </div>
                <div className="text-sm text-stone-500">
                  {produto.quantidade} vendidos
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-700">
                  R$ {produto.faturamento.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}