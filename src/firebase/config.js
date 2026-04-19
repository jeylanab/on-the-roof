// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDv6xSUASuMFlhEpPW2dSAI3pT4vS-zn1Y",
  authDomain: "on-the-roof-2ccbb.firebaseapp.com",
  projectId: "on-the-roof-2ccbb",
  storageBucket: "on-the-roof-2ccbb.firebasestorage.app",
  messagingSenderId: "799820889097",
  appId: "1:799820889097:web:766fb8954d3251eb1d8cd8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;