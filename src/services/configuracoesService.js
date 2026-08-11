import {
doc,
setDoc,
getDoc
} from "firebase/firestore";
import { db } from "../firebase";

export async function salvarConfiguracoes(
empresaId,
config
){
await setDoc(
doc(
db,
"restaurantes",
empresaId,
"configuracoes",
"principal"
),
config
);
}
export async function carregarConfiguracoes(
empresaId
){
const documento = await getDoc(
doc(
db,
"restaurantes",
empresaId,
"configuracoes",
"principal"
)
);
if(documento.exists()){
return documento.data();
}
return null;
}