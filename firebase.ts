import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCHqnOhUHVzIdyGGMzrkG7LHsOsi9qx5tQ",
    authDomain: "diminui-ai.firebaseapp.com",
    projectId: "diminui-ai",
    storageBucket: "diminui-ai.firebasestorage.app",
    messagingSenderId: "487737216873",
    appId: "1:487737216873:web:53bb97b536f6bb051237f8",
    measurementId: "G-EHJX5DND5Y"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);