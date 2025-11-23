// Import the functions you need from the SDKs you need 
 import { initializeApp } from "firebase/app"; 
 import { getAnalytics } from "firebase/analytics"; 
 import { getFirestore } from "firebase/firestore";
 // TODO: Add SDKs for Firebase products that you want to use 
 // `https://firebase.google.com/docs/web/setup#available-libraries`  
  
 // Your web app's Firebase configuration 
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional 
 const firebaseConfig = { 
   apiKey: "AIzaSyDFJUxguohW_tqPYDhDNeeOFMe9yo2yvUw", 
   authDomain: "web-kelas-sas.firebaseapp.com", 
   projectId: "web-kelas-sas", 
   storageBucket: "web-kelas-sas.firebasestorage.app", 
   messagingSenderId: "313755533054", 
   appId: "1:313755533054:web:28346a4ce3ab5002836faf", 
   measurementId: "G-Y81VXDEPP9" 
 }; 
  
 // Initialize Firebase 
 const app = initializeApp(firebaseConfig); 
 const analytics = getAnalytics(app);
 export const db = getFirestore(app);