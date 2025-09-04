// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = { apiKey: "AIzaSyChtIb59I99XCQk_H8l1gwAIs25lwkbgW0", authDomain: "recycleapp-bf3b4.firebaseapp.com", projectId: "recycleapp-bf3b4", storageBucket: "recycleapp-bf3b4.appspot.com", messagingSenderId: "398261074869", appId: "1:398261074869:web:24a580d42ba80b22cd37fc", };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
export { auth };