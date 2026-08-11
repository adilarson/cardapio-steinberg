import {
    collection,
    getDocs,
    query,
    orderBy
} from "firebase/firestore";

import { db } from "../firebase";

export async function carregarCardapio(empresaId){
    if (!empresaId) return [];

    try {
        const snapshot = await getDocs(
            query(
                collection(
                    db,
                    "restaurantes",
                    empresaId,
                    "produtos"
                ),
                // Alterado de "categoria" para "nome" para evitar erros com campos inexistentes no banco,
                // ou mude para "ordem" se você usar um sistema de ordenação numérica.
                orderBy("nome", "asc") 
            )
        );
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Erro ao carregar o cardápio do Firebase:", error);
        return [];
    }
}
