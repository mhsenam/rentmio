// Firebase configuration
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUgz-p-ChU5CbrzyMoUu50sI4a1wHcZ4c",
  authDomain: "rentalapp-8a840.firebaseapp.com",
  projectId: "rentalapp-8a840",
  storageBucket: "rentalapp-8a840.appspot.com",
  messagingSenderId: "87001392187",
  appId: "1:87001392187:web:516b39730e78fc5fc6e81e",
  measurementId: "G-CF9DS10R7B",
};

// Initialize Firebase only on client side and prevent multiple instances
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== "undefined") {
  // Client-side only code
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);

      auth = getAuth(app);
      setPersistence(auth, browserLocalPersistence).catch((error: Error) => {
        console.error("Error setting auth persistence:", error);
      });

      db = getFirestore(app);
      storage = getStorage(app);

      // Connect to emulators in development
      /* Commenting out emulator connections to use production Firebase
      if (process.env.NODE_ENV === "development") {
        try {
          connectAuthEmulator(auth, "http://localhost:9099");
          connectFirestoreEmulator(db, "localhost", 8080);
          console.log("Connected to Firebase emulators");
        } catch (err) {
          console.error("Error connecting to emulators:", err);
        }
      }
      */
    } else {
      app = getApps()[0];
      auth = getAuth();
      db = getFirestore();
      storage = getStorage();
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  // Server side
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
