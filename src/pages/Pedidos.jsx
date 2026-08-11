import React, { useMemo, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";

export default function Pedidos() {
  const { empresa } = useEmpresa();
  const [pedidos, setPedidos] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!empresa?.id) return;
    const q = query(
      collection(db, "restaurantes", empresa.id, "pedidos"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPedidos(listaPedidos);
    }, (error) => {
      console.error("Erro ao buscar pedidos:", error);
    });
    return () => unsubscribe();
  }, [empresa?.id]);

  const pedidosFiltrados = useMemo(() => {
    if (!busca.trim()) return pedidos;
    const termo = busca.toLowerCase();
    return pedidos.filter(pedido => {
      const mesa = String(pedido.mesa || "").toLowerCase();
      const status = String(pedido.status || "").toLowerCase();
      return mesa.includes(termo) || status.includes(termo);
    });
  }, [pedidos, busca]);

  const calcularTotalPedido = (pedido) => {
    return (pedido.itens || []).reduce((soma, item) => {
      const preco = Number(item.precoFinal ?? item.preco ?? 0);
      const quantidade = Number(item.quantidade ?? 1);
      return soma + preco * quantidade;
    }, 0);
  };

  const totalVendas = pedidosFiltrados.reduce(
    (total, pedido) => total + calcularTotalPedido(pedido),
    0
  );

  if (!empresa) {
    return (
      <div className="min-h-screen bg-stone-100 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-stone-600 font-semibold">
            Nenhuma empresa selecionada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b p-6">
            <h1 className="text-3xl font-bold text-stone-900">
              Histórico de Pedidos
            </h1>
            <p className="text-stone-500 mt-1">
              Consulte todos os pedidos realizados de {empresa.nome || "sua empresa"}.
            </p>
          </div>

          <div className="p-6 flex flex-col md:flex-row gap-4">
            <input
              className="border border-stone-300 rounded-xl p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-amber-600"
              placeholder="Pesquisar por mesa ou status..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-3">
              <span className="block text-sm text-stone-500">
                Total vendido
              </span>
              <strong className="text-xl text-amber-900">
                R$ {totalVendas.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-100 border-y">
                <tr className="text-left text-sm text-stone-600">
                  <th className="p-4">Mesa</th>
                  <th className="p-4">Hora</th>
                  <th className="p-4">Itens</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-stone-500">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map(pedido => {
                    const totalPedido = calcularTotalPedido(pedido);

                    return (
                      <tr key={pedido.id} className="border-b hover:bg-stone-50">
                        <td className="p-4 font-semibold">
                          Mesa {pedido.mesa || "-"}
                        </td>

                        <td className="p-4 text-stone-600">
                          {pedido.hora || "-"}
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            {(pedido.itens || []).map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.quantidade ?? 1}x {item.nome}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 font-bold">
                          R$ {totalPedido.toFixed(2)}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              pedido.status === "Pronto" ||
                              pedido.status === "Entregue"
                                ? "bg-green-100 text-green-700"
                                : pedido.status === "Preparando"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {pedido.status || "Pendente"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}