const functions = require('firebase-functions');
const admin = require('firebase-admin');

const FIREBASE_STORAGE_BUCKET = 'fir-recipes-95372.appspot.com';
const apiFirbaseOptions = {
    ...functions.config().api_firebase,
    credential: admin.credential.applicationDefault(),
};

admin.initializeApp(apiFirbaseOptions);

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

const storageBucket = admin.storage().bucket(FIREBASE_STORAGE_BUCKET);
const auth = admin.auth();

module.exports = {
    functions,
    firestore,
    storageBucket,
    auth,
    admin
};