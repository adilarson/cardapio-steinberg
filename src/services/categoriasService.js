import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";

export async function listarCategorias(empresaId) {
  const snapshot = await getDocs(collection(db, "restaurantes", empresaId, "categorias"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function criarCategoria(empresaId, categoria) {
  return await addDoc(collection(db, "restaurantes", empresaId, "categorias"), categoria);
}

export async function atualizarCategoria(empresaId, id, categoria) {
  const docRef = doc(db, "restaurantes", empresaId, "categorias", id);
  return await updateDoc(docRef, categoria);
}

export async function excluirCategoria(empresaId, id) {
  const docRef = doc(db, "restaurantes", empresaId, "categorias", id);
  return await deleteDoc(docRef);
}
