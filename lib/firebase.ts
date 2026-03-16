import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBwpSxyuCWYfLlNejPPlld_psRD2NZWv1s",
    authDomain: "kantapongfirebase.firebaseapp.com",
    projectId: "kantapongfirebase",
    storageBucket: "kantapongfirebase.firebasestorage.app",
    messagingSenderId: "887945568190",
    appId: "1:887945568190:web:bdf7e4d051261c867da3ef",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
