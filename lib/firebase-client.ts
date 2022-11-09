import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!));
const db = getFirestore(app);

export default {
  db
}
