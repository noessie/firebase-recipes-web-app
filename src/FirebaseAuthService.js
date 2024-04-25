import firebase from "./FirebaseConfig";    

const auth = firebase.auth();
const registerUser = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
};

const loginUser = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
};

const logoutUser = () => {
    return auth.signOut();
};

const resetPassword = (email) => {
    return auth.sendPasswordResetEmail(email);
};

// const updatePassword = (password) => {
//     return auth.currentUser.updatePassword(password);
// };

const loginWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(provider);
};

const subscribeToAuthChanges = (handleAuthChange) => {
    auth.onAuthStateChanged((user) => {
        handleAuthChange(user);
    });
};

const FirebaseAuthService = {
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
    // updatePassword,
    loginWithGoogle,
    subscribeToAuthChanges
};

export default FirebaseAuthService;
