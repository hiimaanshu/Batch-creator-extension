
import {db,openDatabase,useDatabase,checkAccount,addUserToDatabase,showSnackbar} from '../js/dexie.fn.js';

var eyeIcon = document.getElementById("eyeIcon");
var nameField = document.getElementById("nameField");
var idField = document.getElementById('idField');
var passwordField = document.getElementById("pwd");
eyeIcon.addEventListener("click", function () {
    const type = passwordField.type === "password" ? "text" : "password";
    const source = eyeIcon.src.includes("open") ? "images/eye.png" : "images/open-eye.png";
    passwordField.type = type;
    eyeIcon.src = source;

});

const validatePasswords = () => {
    if (passwordField.value.length < 6) {
        passwordField.classList.add('input-error');
    } else {
        passwordField.classList.remove('input-error');
    }
};
passwordField.addEventListener('input', validatePasswords);

document.getElementById('signupForm').addEventListener('submit', event => {
    event.preventDefault(); // Prevent form from refreshing the page

    const name = nameField?.value || 'N/A';
    const email = idField.value;
    const password = passwordField.value;

    if (passwordField.classList.contains('input-error')) {
        showSnackbar("Password is too short.", "error");
        return; // Exit if there's a mismatch
    }
    else {
        useDatabase(db, async () => {
            console.log("Checking for existing account");
            try {
                const exists = await checkAccount(db, email);
                if (exists) {
                    console.log("Account already exists");
                    showSnackbar("Account already exists", "error");
                    return
                } else {
                    console.log("Adding new account");
                    const now = new Date();
                    const phrase = "recover me";
                    console.log("now: " + now);
                    console.log("phrase: " + phrase);

                    try {
                        await openDatabase(db);
                        console.log("Adding new account....");
                        await addUserToDatabase(db, {
                            name: name,
                            loginID: email,
                            passWord: password,
                            loggedIn: false,
                            lastLogin: now,
                            rememberMe: false,
                            recoveryPhrase: phrase
                        });
                        console.log("Added successfully");
                        nameField.value = "";
                        idField.value = "";
                        passwordField.value = "";

                    } catch (addError) {
                        console.error("Error adding account:", addError);
                    }
                }
            } catch (checkError) {
                console.error("Error checking account:", checkError);
            }
        }).catch(error => {
            console.error("Error in useDatabase:", error);
        });
    }

});

// Add an input event listener to the name field
nameField.addEventListener("input", function () {
    // Split the input value into words, capitalize the first letter of each word, and join them back
    nameField.value = nameField.value.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
    nameField.value = nameField.value.replace(/[^a-zA-Z\s]/g, '');
});


document.getElementById("idField").addEventListener("input", function(event) {
    // Define a regular expression pattern that matches allowed characters
    const pattern = /^[a-zA-Z0-9@_.]*$/;
    
    // Get the current value of the input field
    const currentValue = event.target.value;
    
    // Check if the current value matches the pattern
    if (!pattern.test(currentValue)) {
        // If not, remove the last character (the one that was just added)
        event.target.value = currentValue.slice(0, -1);
    }
});