import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "edurova-e0867.firebaseapp.com",
  projectId: "edurova-e0867",
  storageBucket: "edurova-e0867.firebasestorage.app",
  messagingSenderId: "539689006987",
  appId: "1:539689006987:web:ba7707bee60ee3200e618e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}