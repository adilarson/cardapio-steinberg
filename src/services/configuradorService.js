import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../firebase";

export async function carregarConfiguradoresDoProduto(
  empresaId,
  produtoId
) {

  // vínculos Produto ⇄ Configurador

  const vinculos = await getDocs(

    query(
      collection(db, "produto_configuradores"),
      where("empresaId", "==", empresaId),
      where("produtoId", "==", produtoId)
    )

  );

  const ids = vinculos.docs.map(doc => doc.data().configuradorId);

  if (ids.length === 0) return [];

  const todos = await getDocs(

    query(
      collection(db, "configuradores"),
      where("empresaId", "==", empresaId)
    )

  );

  return todos.docs

    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    .filter(c => ids.includes(c.id));

}