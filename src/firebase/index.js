
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyAk7QRi6OFbIhxLtNrmIDuWJT2PL_wlVxE",
  authDomain: "petshop-b68eb.firebaseapp.com",
  databaseURL: "https://petshop-b68eb-default-rtdb.firebaseio.com",
  projectId: "petshop-b68eb",
  storageBucket: "petshop-b68eb.firebasestorage.app",
  messagingSenderId: "727227668021",
  appId: "1:727227668021:web:887fd37d50a945f4a2c37c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const googleProvider = new GoogleAuthProvider();

export { auth, database, googleProvider};
