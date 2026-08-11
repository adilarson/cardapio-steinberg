import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase"; // Certifique-se de que o caminho está correto
import { collection, query, where, getDocs } from "firebase/firestore";

const EmpresaContext = createContext();

export function EmpresaProvider({ children }) {
  // Iniciamos como null para saber quando o sistema ainda está carregando os dados do banco
  const [empresa, setEmpresa] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Função para carregar qualquer restaurante dinamicamente pelo SLUG da URL
  const carregarRestaurantePorSlug = async (slug) => {
    try {
      setCarregando(true);
      const q = query(collection(db, "restaurantes"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setEmpresa({ id: docSnap.id, ...docSnap.data() });
      } else {
        setEmpresa(null); // Restaurante não encontrado no banco
      }
    } catch (error) {
      console.error("Erro ao buscar restaurante no Firebase:", error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <EmpresaContext.Provider value={{ empresa, setEmpresa, carregarRestaurantePorSlug, carregando }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}
