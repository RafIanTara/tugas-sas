// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { db } from '../services/firebase'; // Mengambil koneksi database
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const useFirestore = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query: Ambil data dari koleksi, urutkan (opsional, bisa dihapus orderBynya kalau error index)
    const q = query(collection(db, collectionName));

    // onSnapshot: Fitur Real-time (Dengar perubahan database terus-menerus)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setData(documents);
      setLoading(false);
    }, (error) => {
      console.error("Error ambil data:", error);
      setLoading(false);
    });

    // Bersihkan koneksi saat pindah halaman (biar gak berat)
    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading };
};

export default useFirestore;