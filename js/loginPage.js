import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyC1J48V4ItXUTeSI5T5txnCwmRL1emABaY",
  authDomain: "batch-creator-extension.firebaseapp.com",
  databaseURL: "https://batch-creator-extension-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "batch-creator-extension",
  storageBucket: "batch-creator-extension.firebasestorage.app",
  messagingSenderId: "868306305974",
  appId: "1:868306305974:web:898434a7bb03f5561db717"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
auth.languageCode = "en";
const provider = new GoogleAuthProvider();
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form from refreshing the page
  const email = document.querySelector('input[placeholder="Email"]').value;
  const password = document.querySelector('input[placeholder="Password"]').value;


  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);



  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      // ...
    } else {
      // User is signed out
      // ...
    }
  });

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

});
document.getElementById('google-login').addEventListener('click', () => {
  console.log("google-login clicked");
  // signInWithPopup(auth, provider)
  //   .then((result) => {
  //     const credential = GoogleAuthProvider.credentialFromResult(result);
  //     const token = credential.accessToken;
  //     const user = result.user;
  //     console.log(user);
  //     window.location.href = 'sidepanel.html';
  //     // ...
  //   }).catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     const email = error.customData.email;
  //     const credential = GoogleAuthProvider.credentialFromError(error);
  //     // ...
  //   });
});

console.log("login success");
