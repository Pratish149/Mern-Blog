// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-2a7f0.firebaseapp.com",
  projectId: "mern-blog-2a7f0",
  storageBucket: "mern-blog-2a7f0.appspot.com",
  messagingSenderId: "141632081791",
  appId: "1:141632081791:web:92fc38a9f8285677fed44a",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
