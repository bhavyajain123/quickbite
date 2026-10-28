
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQYgM1EgfkXb7gkw8vEW5cgp8Km-fdkuY",
  authDomain: "quickbite-76785.firebaseapp.com",
  projectId: "quickbite-76785",
  storageBucket: "quickbite-76785.firebasestorage.app",
  messagingSenderId: "882667690932",
  appId: "1:882667690932:web:8dee212f2ac8ed89f0b0e1",
  measurementId: "G-9WR0NDQHDT"
};


const app = initializeApp(firebaseConfig);
export const auth= getAuth(app);
export default app;