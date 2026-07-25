import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBDf7TDS6g1dsrri0hcCgPUcUJfxWtwZX4",
    authDomain: "qr-project-c8dc1.firebaseapp.com",
    projectId: "qr-project-c8dc1",
    storageBucket: "qr-project-c8dc1.firebasestorage.app",
    messagingSenderId: "826436009026",
    appId: "1:826436009026:web:20ef0fbf2f24a1e8a241db",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);