import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";

export async function listarUsuarios(empresaId) {
  const snapshot = await getDocs(collection(db, "restaurantes", empresaId, "usuarios"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function criarUsuario(empresaId, usuario) {
  return await addDoc(collection(db, "restaurantes", empresaId, "usuarios"), usuario);
}

export async function atualizarUsuario(empresaId, id, usuario) {
  const docRef = doc(db, "restaurantes", empresaId, "usuarios", id);
  return await updateDoc(docRef, usuario);
}

export async function excluirUsuario(empresaId, id) {
  const docRef = doc(db, "restaurantes", empresaId, "usuarios", id);
  return await deleteDoc(docRef);
}
