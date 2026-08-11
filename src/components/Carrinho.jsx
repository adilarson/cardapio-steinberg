import React, { useState } from "react";
import CarrinhoItem from "./CarrinhoItem";
import CarrinhoResumo from "./CarrinhoResumo";

export default function Carrinho({
  carrinho,
  numeroMesa,
  enviarPedidoAoFirebase,
  aumentarQuantidade,
  diminuirQuantidade,
  removerItem
}) {
  const [aberto, setAberto] = useState(false);

  /*
   * Quando o carrinho estiver vazio,
   * não mostramos nenhum painel sobre o cardápio.
   */
  if (carrinho.length === 0) {
    return null;
  }

  // Taxa de serviço
  const taxaServico = 0;

  // CORRIGIDO: Calcula o subtotal blindado contra textos e strings (Previne o NaN)
  const subtotal = carrinho.reduce((acumulado, item) => {
    const preco = Number(item.precoFinal ?? item.precoUnitario ?? item.preco) || 0;
    const quantidade = Number(item.quantidade) || 1;

    return acumulado + (preco * quantidade);
  }, 0);

  // Total final
  const total = subtotal + taxaServico;

  // CORRIGIDO: Quantidade total de produtos lendo estritamente números puros
  const quantidadeItens = carrinho.reduce(
    (acumulado, item) => acumulado + (Number(item.quantidade) || 1),
    0
  );

  return (
    <>
      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      <div
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md"
      >
        <button
          onClick={() => setAberto(true)}
          className="w-full bg-amber-900 hover:bg-amber-800 transition-all duration-300 rounded-2xl shadow-2xl text-white px-6 py-4 flex justify-between items-center"
        >

          <div className="text-left">

            <p className="text-sm opacity-90">
              🛒 {quantidadeItens}{" "}
              {quantidadeItens === 1 ? "item" : "itens"}
            </p>

            <p className="font-bold text-xl">
              Total R$ {total.toFixed(2)}
            </p>

          </div>

          <div className="font-semibold">
            Ver Pedido →
          </div>

        </button>
      </div>

      {/* DRAWER DO CARRINHO */}
      {aberto && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-end"
        >

          <div
            className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden animate-slide-up"
          >

            {/* CABEÇALHO */}
            <div className="flex justify-between items-center border-b border-stone-200 px-6 py-5">

              <div>

                <h2 className="text-2xl font-bold text-stone-800">
                  🛒 Meu Pedido
                </h2>

                <p className="text-xs text-stone-500 mt-1">
                  Confira seu pedido antes de enviar.
                </p>

              </div>

              <button
                onClick={() => setAberto(false)}
                className="text-3xl text-stone-500 hover:text-red-500 transition"
              >
                ✕
              </button>

            </div>

            {/* ITENS DO PEDIDO */}
            <div className="max-h-[55vh] overflow-y-auto p-4 space-y-4">

              {carrinho.map((item, index) => (
                <CarrinhoItem
                  key={`${item.id}-${index}`}
                  item={item}
                  aumentar={() => aumentarQuantidade(index)}
                  diminuir={() => diminuirQuantidade(index)}
                  remover={() => removerItem(index)}
                />
              ))}

            </div>

            {/* RESUMO */}
            <CarrinhoResumo
              numeroMesa={numeroMesa}
              subtotal={subtotal}
              taxaServico={taxaServico}
              total={total}
              enviarPedidoAoFirebase={enviarPedidoAoFirebase}
            />

          </div>

        </div>
      )}
    </>
  );
}
