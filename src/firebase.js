import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

// Suas credenciais reais do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA3STspLuSTkS1ipsi8lc7loi9x1pX_uVI",
  authDomain: "cardapio-steinberg.firebaseapp.com",
  projectId: "cardapio-steinberg",
  storageBucket: "cardapio-steinberg.firebasestorage.app",
  messagingSenderId: "271355504630",
  appId: "1:271355504630:web:2abe89da6abcde872bc9d7"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o Banco de Dados Firestore
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache()
});
