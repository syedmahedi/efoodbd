// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDB4kHTU4ES1D6RdxoMDZ8IsdiFzpFjwJM",
    authDomain: "ghorerkhabar0.firebaseapp.com",
    projectId: "ghorerkhabar0",
    storageBucket: "ghorerkhabar0.firebasestorage.app",
    messagingSenderId: "386343943554",
    appId: "1:386343943554:web:1cfb2896a8b944be9b239b",
    measurementId: "G-28VNBMY6ZH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
