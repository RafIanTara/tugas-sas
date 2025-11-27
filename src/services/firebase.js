import { initializeApp } from "firebase/app";
<<<<<<< HEAD
// PENTING: Pakai initializeFirestore biar bisa setting long polling
=======
// PENTING: Pakai initializeFirestore, bukan getFirestore biasa
>>>>>>> 0f8f8bfa1daf2a39386283c1a129574157099473
import { initializeFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
<<<<<<< HEAD
  // --- JANGAN UBAH API KEY INI (PAKE PUNYA KAMU) ---
  apiKey: "AIzaSyDFJUxguohW_tqPYDhDNeeOFMe9yo2yvUw", 
  authDomain: "web-kelas-sas.firebaseapp.com", 
  projectId: "web-kelas-sas", 
  storageBucket: "web-kelas-sas.firebasestorage.app", 
  messagingSenderId: "313755533054", 
  appId: "1:313755533054:web:28346a4ce3ab5002836faf", 
  measurementId: "G-Y81VXDEPP9" 
=======
  // ... KODE API KEY KAMU YANG LAMA JANGAN DIHAPUS ...
  apiKey: "AIzaSy...", 
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
>>>>>>> 0f8f8bfa1daf2a39386283c1a129574157099473
};

const app = initializeApp(firebaseConfig);

<<<<<<< HEAD
// --- OBAT KUAT KONEKSI ---
// experimentalForceLongPolling: true -> Ini maksa lewat jalur HTTP biasa (Anti Blokir)
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, 
=======
// --- BAGIAN INI OBATNYA WAK ---
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // <--- INI WAJIB ADA
>>>>>>> 0f8f8bfa1daf2a39386283c1a129574157099473
});

const storage = getStorage(app);

export { db, storage };