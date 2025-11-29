import { initializeApp } from "firebase/app";
// PENTING: Pakai initializeFirestore biar bisa setting long polling
import { initializeFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // <--- TAMBAHAN 1

const firebaseConfig = {
  // ... (Config Anda tetap sama, jangan diubah)
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
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, 
});

const storage = getStorage(app);
const auth = getAuth(app); // <--- TAMBAHAN 2

export { db, storage, auth }; // <--- TAMBAHAN 3 (Export auth)