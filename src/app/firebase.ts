import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsHWzc3_1j_kcFFDIiiLyckXMoqy51OPg",
  authDomain: "learneng-20588.firebaseapp.com",
  projectId: "learneng-20588",
  storageBucket: "learneng-20588.appspot.com",
  messagingSenderId: "371427006568",
  appId: "1:371427006568:web:13f796c0a2cc01061a83dd",
  measurementId: "G-LQMLTYG1V0"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
