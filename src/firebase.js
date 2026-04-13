import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// תמיכת אופליין — נתונים נשמרים על המכשיר ומסתנכרנים כשחוזרת קליטה
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // יותר מחלון אחד פתוח — אופליין עובד רק בחלון אחד
    console.warn("Firebase offline: multiple tabs open");
  } else if (err.code === "unimplemented") {
    // הדפדפן לא תומך
    console.warn("Firebase offline: browser not supported");
  }
});
