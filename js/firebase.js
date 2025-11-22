import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyC1J48V4ItXUTeSI5T5txnCwmRL1emABaY",
    authDomain: "batch-creator-extension.firebaseapp.com",
    databaseURL: "https://batch-creator-extension-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "batch-creator-extension",
    storageBucket: "batch-creator-extension.firebasestorage.app",
    messagingSenderId: "868306305974",
    appId: "1:868306305974:web:898434a7bb03f5561db717"
};

// create a new account
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signUp = async (name, email, password) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                set(ref(database, "users/" + user.uid), {
                    username: name,
                    email: email
                })
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(error);
                alert(errorMessage, errorCode);
                // ..
            });
    } catch (error) {
        console.error("Error signing up:", error.message);
    }
};

// sign in to existing account
export const signIn = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(`User: ${email}`);
                window.location.href = 'sidepanel.html';
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorMessage);
                console.log(errorMessage);
            });
    } catch (error) {
        console.error("Error signing in:", error.message);
    }
};

export const signInWithEmail = async () => {
    try {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(`User: ${email}`);
                window.location.href = 'sidepanel.html';
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorMessage);
                console.log(errorMessage);
            });
    } catch (error) {
        console.error("Error signing in:", error.message);
    }
};
export const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const user = result.user;
                console.log(user);
                window.location.href = 'sidepanel.html';
                // ...
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    } catch (error) {
        console.error("Error signing in:", error.message);
    }
};

export const checkAuthState = async () => {
    try {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User logged in:', user);
                window.location.href = 'sidepanel.html';
            } else {
                console.log('No user logged in');
                window.location.href = 'loginPage.html';
            }
        });
    } catch (error) {
        console.error('Error in auth state:', error);
        window.location.href = 'loginPage.html';
    }
};