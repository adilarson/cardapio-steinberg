import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function buscarAssinatura(empresaId) {
  if (!empresaId) throw new Error("empresaId é obrigatório para buscar a assinatura.");
  
  const referencia = doc(db, "restaurantes", empresaId, "assinatura", "dados");
  const snapshot = await getDoc(referencia);
  
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function criarAssinatura(empresaId, assinatura) {
  if (!empresaId) throw new Error("empresaId é obrigatório para criar a assinatura.");
  
  const referencia = doc(db, "restaurantes", empresaId, "assinatura", "dados");
  await setDoc(referencia, assinatura);
  return assinatura;
}

export async function atualizarAssinatura(empresaId, dados) {
  if (!empresaId) throw new Error("empresaId é obrigatório para atualizar a assinatura.");
  
  const referencia = doc(db, "restaurantes", empresaId, "assinatura", "dados");
  await updateDoc(referencia, dados);
  return dados;
}

export async function alterarPlano(empresaId, plano, valor) {
  return await atualizarAssinatura(empresaId, { plano, valor });
}

export async function alterarStatusAssinatura(empresaId, status) {
  return await atualizarAssinatura(empresaId, { status });
}
