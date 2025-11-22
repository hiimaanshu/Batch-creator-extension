import { db, getPasswordById, getActiveUser, addDataToDatabase, updateDataById, showSnackbar } from "./dexie.fn.js";



document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const idField = document.getElementById("idField").value;
  const passwordField = document.getElementById("passwordField").value;
  const rememberMeCheckbox = document.getElementById("rememberMeCheckbox").checked;

  getPasswordById(db, idField).then(async (key) => {
    if (key == passwordField) {
      console.log("Login successful");
      try {
        const acctiveAccount = await getActiveUser(db);
        const now = new Date();
        const userData =
        {
          loginId: idField,
          lastLogin: now,
          rememberMe: rememberMeCheckbox
        }
        if (acctiveAccount.length > 0) {

          try {
            const activeUserID = acctiveAccount[0].id;
            console.log("active user: " + activeUserID);
            await updateDataById(db, "activeAccount", activeUserID, userData);
          }
          catch (error) {
            console.log("Error updating active user", error);
          }

        } else if (acctiveAccount.length == 0) {
          try {
            await addDataToDatabase(db, "activeAccount", userData);
          }
          catch (error) {
            console.log("Error adding active user", error);
          }
        }
        else {
          console.log("Something is wrong with ActiveAccount store");
        }
      }
      catch (error) {
        console.log("Error during updating active user : ", error);
      }
      window.location.href = 'main.html';
      history.replaceState(null, "", "main.html");
    }
    else if (key < 0) {
      showSnackbar("Account does not exist", "error");
    }
    else if (key == null) {
      showSnackbar("Something went wrong", "error");
    }
    else {
      console.log("Wrong password");
      showSnackbar("Wrong password", "error");
    }
  });
});

document.getElementById("idField").addEventListener("input", function (event) {
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
