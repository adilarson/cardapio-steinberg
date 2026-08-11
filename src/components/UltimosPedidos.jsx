import React from "react";

export default function UltimosPedidos({ pedidos }) {
  const ultimos = [...pedidos]
    .sort((a, b) => {
      const ta = a.timestamp?.seconds ?? 0;
      const tb = b.timestamp?.seconds ?? 0;
      return tb - ta;
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        Últimos Pedidos
      </h2>

      {ultimos.length === 0 ? (
        <p className="text-stone-500">
          Nenhum pedido encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {ultimos.map(pedido => (
            <div
              key={pedido.id}
              className="border rounded-xl p-3"
            >
              <div className="flex justify-between">
                <strong>
                  Mesa {pedido.mesa}
                </strong>

                <span className="text-sm">
                  {pedido.status}
                </span>
              </div>

              <div className="text-sm text-stone-500 mt-1">
                {pedido.itens?.length ?? 0} itens
              </div>

              <div className="text-xs text-stone-400">
                {pedido.hora}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}