import { initializeApp } from "firebase/app";
// PENTING: Pakai initializeFirestore, bukan getFirestore biasa
import { initializeFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // ... KODE API KEY KAMU YANG LAMA JANGAN DIHAPUS ...
  apiKey: "AIzaSy...", 
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);

// --- BAGIAN INI OBATNYA WAK ---
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // <--- INI WAJIB ADA
});

const storage = getStorage(app);

export { db, storage };