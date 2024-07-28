import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-40a47.firebaseapp.com",
  projectId: "reactchat-40a47",
  storageBucket: "reactchat-40a47.appspot.com",
  messagingSenderId: "316266663230",
  appId: "1:316266663230:web:3a35f9dcaa664b9dc8f06f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
