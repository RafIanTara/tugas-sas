import { initializeApp } from "firebase/app";
// PENTING: Pakai initializeFirestore biar bisa setting long polling
import { initializeFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // --- JANGAN UBAH API KEY INI (PAKE PUNYA KAMU) ---
  apiKey: "AIzaSyDFJUxguohW_tqPYDhDNeeOFMe9yo2yvUw", 
  authDomain: "web-kelas-sas.firebaseapp.com", 
  projectId: "web-kelas-sas", 
  storageBucket: "web-kelas-sas.firebasestorage.app", 
  messagingSenderId: "313755533054", 
  appId: "1:313755533054:web:28346a4ce3ab5002836faf", 
  measurementId: "G-Y81VXDEPP9" 
};

const app = initializeApp(firebaseConfig);

// --- OBAT KUAT KONEKSI ---
// experimentalForceLongPolling: true -> Ini maksa lewat jalur HTTP biasa (Anti Blokir)
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, 
});

const storage = getStorage(app);

export { db, storage };