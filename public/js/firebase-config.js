import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCvYC5BjCVPWOJbfLpKg5BFzaQdCKHzhm0",
  authDomain: "ineed-1759710490.firebaseapp.com",
  projectId: "ineed-1759710490",
  storageBucket: "ineed-1759710490.firebasestorage.app",
  messagingSenderId: "409469938749",
  appId: "1:409469938749:web:66c635d91f16ae868b8e54"
};

// Singleton: evita inicialização duplicada
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };
