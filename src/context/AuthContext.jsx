import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// GANTI DENGAN EMAIL ASLI ANDA
const SUPER_ADMIN_EMAIL = "rafiantara@gmail.com"; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. FUNGSI REGISTER (DAFTAR) ---
  const register = async (email, password, name, targetRole, kelasId) => {
    // Buat akun di Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Nama di Auth Profile
    await updateProfile(firebaseUser, { displayName: name });

    // Tentukan status awal
    // Jika emailnya email SUPER ADMIN, langsung ACTIVE & ADMIN. Selain itu PENDING & GUEST.
    const isSuper = email === SUPER_ADMIN_EMAIL;

    const userData = {
      uid: firebaseUser.uid,
      displayName: name,
      email: email,
      kelasId: kelasId, // Misal: "X", "XI", "XII"
      
      // LOGIKA UTAMA:
      role: isSuper ? 'ADMIN' : 'GUEST',   // Default Guest, kecuali Super Admin
      status: isSuper ? 'ACTIVE' : 'PENDING', // Default Pending
      targetRole: targetRole, // "GURU" atau "SISWA" (Permintaan user)
      jabatan: 'MEMBER',      // Default member
      
      createdAt: new Date().toISOString()
    };

    // Simpan data lengkap ke Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), userData);
    
    // Update state lokal
    setUser({ ...firebaseUser, ...userData });
    return userData;
  };

  // --- 2. FUNGSI LOGIN ---
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // --- 3. FUNGSI LOGOUT ---
  const logout = () => {
    return signOut(auth);
  };

  // --- 4. MONITOR STATUS USER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ambil data detail dari Firestore (Role, Jabatan, Status)
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const firestoreData = docSnap.data();
          
          // SAFETY CHECK: Jika email super admin, paksa jadi ADMIN & ACTIVE di state
          if (currentUser.email === SUPER_ADMIN_EMAIL) {
             firestoreData.role = 'ADMIN';
             firestoreData.status = 'ACTIVE';
          }

          setUser({ ...currentUser, ...firestoreData });
        } else {
          // Fallback jika data firestore tidak ada
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { user, register, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};