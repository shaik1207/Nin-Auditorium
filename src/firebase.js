// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMYD4pcDHvJ5WNygMZQjDfFBR63Y9lANA",
  authDomain: "booking-halls-74fa7.firebaseapp.com",
  projectId: "booking-halls-74fa7",
  storageBucket: "booking-halls-74fa7.firebasestorage.app",
  messagingSenderId: "352328199915",
  appId: "1:352328199915:web:7535dfb1aa245fe4ec18ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);