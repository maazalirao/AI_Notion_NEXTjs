// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp  } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNzieTUzGPewvW7eyIdqNL0l9y2Ije9eI",
  authDomain: "notion-clone-9e504.firebaseapp.com",
  projectId: "notion-clone-9e504",
  storageBucket: "notion-clone-9e504.firebasestorage.app",
  messagingSenderId: "705402030969",
  appId: "1:705402030969:web:1f8b575c30f2d55744bda8"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };