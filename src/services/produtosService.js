import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";

export async function listarProdutos(empresaId) {
  const snapshot = await getDocs(collection(db, "restaurantes", empresaId, "produtos"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function criarProduto(empresaId, produto) {
  return await addDoc(collection(db, "restaurantes", empresaId, "produtos"), produto);
}

export async function atualizarProduto(empresaId, id, produto) {
  const docRef = doc(db, "restaurantes", empresaId, "produtos", id);
  return await updateDoc(docRef, produto);
}

export async function excluirProduto(empresaId, id) {
  const docRef = doc(db, "restaurantes", empresaId, "produtos", id);
  return await deleteDoc(docRef);
}
