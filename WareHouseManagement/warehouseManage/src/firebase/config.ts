// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABAdQceyk0Z3E0Axl1wwo4_rvX1Chxnrs",
  authDomain: "flash-typing.firebaseapp.com",
  projectId: "flash-typing",
  storageBucket: "flash-typing.firebasestorage.app",
  messagingSenderId: "108811300815",
  appId: "1:108811300815:web:72d82867c3924f3b01ecba",
  measurementId: "G-LG5ZC19K7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export {auth};