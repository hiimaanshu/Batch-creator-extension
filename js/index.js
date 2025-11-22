// document.getElementById('enter').addEventListener('click', () => {
//     console.log("enter clicked");
//     chrome.tabs.create({ url: "dashboard/index.html" });
// });

import { db, totalAccounts, getActiveUser } from './dexie.fn.js';
try {
  const acctiveUser = await getActiveUser(db);
  const accTotal = await totalAccounts(db);
  if (accTotal > 0 && acctiveUser.length == 0) {
    console.log("No active account found. Please login to your account first.");
    window.location.href = 'login.html';
  }
  else if (accTotal > 0 && acctiveUser.length > 0) {
    console.log("Welcome user : ", acctiveUser[0].loginId);
    window.location.href = 'main.html';
    history.replaceState(null, "", "main.html");
  }
  else {
    console.log("No account found. Please create a new account");
    window.location.href = 'signup.html';
  }
}
catch (error) {
  console.error('Error:', error);
}

