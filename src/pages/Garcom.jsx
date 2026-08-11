import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useEmpresa } from "../context/EmpresaContext";

export default function Garcom() {
  const { empresa, carregarRestaurantePorSlug } = useEmpresa();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const { restaurantSlug } = useParams();

  useEffect(() => {
    if (restaurantSlug && (!empresa || empresa.slug !== restaurantSlug)) {
      carregarRestaurantePorSlug(restaurantSlug);
    }
  }, [restaurantSlug, empresa, carregarRestaurantePorSlug]);

  useEffect(() => {
    if (!empresa?.id) {
      setPedidos([]);
      return;
    }

    const q = query(
      collection(db, "restaurantes", empresa.id, "pedidos"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPedidos(listaPedidos);
    }, (error) => {
      console.error("Erro ao buscar pedidos:", error);
    });

    return () => unsubscribe();
  }, [empresa?.id]);

  async function mudarStatusPedido(id, novoStatus) {
    if (!empresa?.id) return;
    try {
      const docRef = doc(db, "restaurantes", empresa.id, "pedidos", id);
      await updateDoc(docRef, { status: novoStatus });
    } catch (e) {
      console.error("Erro ao alterar status do pedido:", e);
    }
  }

  if (!empresa) {
    return <div className="min-h-screen bg-stone-100 flex items-center justify-center font-bold">Nenhum restaurante carregado no painel do garçom.</div>;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans p-4">
      <header className="flex justify-between items-center border-b border-stone-300 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 font-serif">
            {empresa.nome.toUpperCase()} • GARÇOM
          </h1>
        </div>
        <button
          onClick={() => navigate(`/${empresa.slug}`)}
          className="bg-stone-300 hover:bg-stone-400 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Sair Painel
        </button>
      </header>
      <div className="space-y-4 max-w-md mx-auto">
        {pedidos
          .filter(p => p.status === "Pronto")
          .map(pedido => (
            <div key={pedido.id} className="bg-white p-4 rounded-xl border border-amber-300 shadow-md">
              <span className="text-lg font-bold text-amber-900 flex justify-between">
                🔔 SERVIR MESA {pedido.mesa}
                <span className="text-xs bg-amber-100 p-1 rounded font-bold">PRONTO</span>
              </span>
              <ul className="text-sm text-stone-600 space-y-1 my-3">
                {pedido.itens.map((item, idx) => (
                  <li key={idx}>• {item.quantidade}x {item.nome}</li>
                ))}
              </ul>
              <button
                onClick={() => mudarStatusPedido(pedido.id, "Entregue")}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold"
              >
                Marcar como Entregue
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
