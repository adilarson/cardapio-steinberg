import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function salvarConfiguradoresProduto(empresaId, produtoId, configuradores) {
  if (!empresaId || !produtoId) return;

  try {
    const produtoRef = doc(db, "restaurantes", empresaId, "produtos", produtoId);
    
    // Atualiza diretamente o array de configuradores dentro do produto correspondente
    await updateDoc(produtoRef, {
      configuradores: configuradores
    });
  } catch (error) {
    console.error("Erro ao salvar configuradores do produto:", error);
    throw error;
  }
}

export async function carregarConfiguradoresProduto(empresaId, produtoId) {
  if (!empresaId || !produtoId) return [];

  try {
    const produtoRef = doc(db, "restaurantes", empresaId, "produtos", produtoId);
    const snapshot = await getDoc(produtoRef);

    if (snapshot.exists()) {
      const dados = snapshot.data();
      return dados.configuradores || [];
    }
    return [];
  } catch (error) {
    console.error("Erro ao carregar configuradores do produto:", error);
    throw error;
  }
}
