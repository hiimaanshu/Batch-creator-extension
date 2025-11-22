import '../js/dexie.js';

const db = new Dexie("logindb");
db.version(1).stores({
    account: '++id,userName,loginID,passWord,loggedIn,lastLogin,rememberMe,recoveryPhrase',
    activeAccount: '++id,loginID,lastLogin,rememberMe'
});

export { db };

export async function useDatabase(db, callback) {
    try {
        // Open the database
        await openDatabase(db);

        // Execute the callback if it's a function
        if (typeof callback === 'function') {
            try {
                await callback();
            } catch (callbackError) {
                console.error("Error executing callback:", callbackError);
            }
        }

    } catch (openError) {
        console.error("Error opening database:", openError);
    } finally {
        // Ensure the database is closed
        try {
            await closeDatabase(db);
        } catch (closeError) {
            console.error("Error closing database:", closeError);
        }
    }
}

export async function openDatabase(db) {
    try {
        await db.open();
        console.log("Database opened successfully");
    } catch (error) {
        console.log("Error opening database:", error);
    }
}
export async function closeDatabase(db) {
    try {
        await db.close();
        console.log("Database closed");
    } catch (error) {
        console.log("Error closing database:", error);
    }
}

export async function addUserToDatabase(db, userDetails) {
    return await db.account.add(userDetails)
        .then(() => showSnackbar('Account added successfully', 'success'))
        .catch(error => showSnackbar(error, 'error'));
}

export async function checkAccount(db, id) {
    try {
        // Query the database
        const results = await db.account.where('loginID').equals(id).toArray();
        console.log(`Number of items found for loginID ${id}:`, results.length);
        return results.length > 0;
    } catch (error) {
        console.error(`Error querying database for loginID ${id}:`, error);
        return false; // Return false in case of an error to indicate the account was not found
    }
}

export function showSnackbar(message, type) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = message;

    // Set the background color based on the type
    if (type === 'success') {
        snackbar.style.backgroundColor = "#4CAF50";
    } else if (type === 'error') {
        snackbar.style.backgroundColor = "#f44336";
    } else {
        snackbar.style.backgroundColor = "#ff9800";
    }

    snackbar.classList.add("show");

    // Listen for the end of the fadeout animation
    snackbar.addEventListener('animationend', function handleAnimationEnd(event) {
        if (event.animationName === 'fadeout') {
            snackbar.classList.remove("show");
            snackbar.style.visibility = 'hidden'; // Ensure visibility is hidden after animation
            snackbar.removeEventListener('animationend', handleAnimationEnd);
        }
    });

    // Make sure the snackbar is visible initially
    snackbar.style.visibility = 'visible';
}

export async function getPasswordById(db, id) {
    try {
        const results = await db.account.where('loginID').equals(id).toArray();
        if (results.length > 0) {
            const acc = results[0];
            const password = acc.passWord;
            console.log('Password:', password);
            return password; // Return the password
        } else {
            console.log('Account does not exist');
            return -1; // Return null if the account does not exist
        }
    } catch (error) {
        console.error('Error retrieving item:', error);
        return null; // Return null in case of an error
    }
}

export async function getActiveUser(db) {
    try {
        await openDatabase(db);
        console.log('Getting active account....');
        const activeUserData = await db.activeAccount.toArray();
        const activeUser = activeUserData[0];
        if (activeUserData.length > 0) {
            console.log('Active Account Id:', activeUser.loginId);
        }
        else {
            console.log('No active account found.');
        }
        return activeUserData;
    }
    catch (error) {
        console.log('Error retrieving active account:', error);
    }
    finally {
        await closeDatabase(db);
    }
}
export async function totalAccounts(db) {
    try {
        await openDatabase(db);
        console.log("Getting number of total accounts....")
        const accLen = await db.account.toArray();
        console.log("Total accounts in database : ", accLen.length);
        return accLen.length;
    }
    catch (error) {
        console.log('Error retrieving account:', error);
    }
    finally {
        await closeDatabase(db);
    }
}

export async function updateDataById(database, storeName, id, data) {
    try {
        await openDatabase(database);
        await database.table(storeName).update(id, data)
            .then(() => {
                console.log('Record updated successfully');
            })
            .catch(error => {
                console.error('Error updating record:', error);
            });
    }
    catch (error) {
        console.log('Error updating record:', error);
    }
}
export async function addDataToDatabase(database, storeName, data) {
    try {
        await openDatabase(database);
        console.log('Adding data to database...');
        await database.table(storeName).add(data)
            .then(() => {
                console.log('Data added successfully.');
            });
    }
    catch (error) {
        console.log('Error adding data to database:', error);
    }
    finally {
        await closeDatabase(database);
    }
}