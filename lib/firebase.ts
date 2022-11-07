const admin = require('firebase-admin');
const firestore = require('firebase-admin/firestore');

!admin.apps.length ? admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG!))
}) : admin.app();

export default {
  db: firestore.getFirestore()
}