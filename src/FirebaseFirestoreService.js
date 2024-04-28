import firebase from "./FirebaseConfig";
import 'firebase/compat/firestore';

const firestore = firebase.firestore();

const createDocument = (collection, document) => {
    return firestore.collection(collection).add(document);
};

const readDocuments = (collection) => {
    return firestore.collection(collection).get();
};

const FirebaseFirestoreService = {
    createDocument,
    readDocuments
};

export default FirebaseFirestoreService;