import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsVbWtVxWKY-fkZu426wd0HllvoZkbFjA",
  authDomain: "youtinerary-6e346.firebaseapp.com",
  projectId: "youtinerary-6e346",
  storageBucket: "youtinerary-6e346.firebasestorage.app",
  messagingSenderId: "418578080264",
  appId: "1:418578080264:web:cca9237658f0774e8da7bd",
  measurementId: "G-3YK8B883QJ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };
