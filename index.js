import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALFenoAnNJR8FMVPmNXYei6QhySXwRpss",
  authDomain: "nyhotdog-ashdod.firebaseapp.com",
  projectId: "nyhotdog-ashdod",
  storageBucket: "nyhotdog-ashdod.firebasestorage.app",
  messagingSenderId: "393826967148",
  appId: "1:393826967148:web:15baa7d165acd8b70a8249"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
