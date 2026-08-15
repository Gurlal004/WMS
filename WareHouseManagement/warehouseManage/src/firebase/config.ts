// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, setPersistence, browserLocalPersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2W97bmc9zX6HikeUjVZRo1r_8R74wcLQ",
  authDomain: "wms-work.firebaseapp.com",
  projectId: "wms-work",
  storageBucket: "wms-work.firebasestorage.app",
  messagingSenderId: "980440205178",
  appId: "1:980440205178:web:5f9cfab880bc3223f178c3",
  measurementId: "G-S7EF7KD7GV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth,  browserLocalPersistence).catch(console.error);
const db = getFirestore(app);

export {auth};  
export {db};