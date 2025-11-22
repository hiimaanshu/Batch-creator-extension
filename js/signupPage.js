import{signUp} from "../js/firebase.js"
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.querySelector('input[placeholder="Password"]');
    const confirmPasswordInput = document.querySelector('input[placeholder="Confirm Password"]');

    const validatePasswords = () => {
        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordInput.classList.add('input-error');
            confirmPasswordInput.classList.add('input-error');
        } else {
            passwordInput.classList.remove('input-error');
            confirmPasswordInput.classList.remove('input-error');
        }
    };

    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);

    document.querySelector('form').addEventListener('submit',async(e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        const name = document.querySelector('input[placeholder="Full Name"]')?.value || 'N/A';
        const email = document.querySelector('input[placeholder="Email"]').value;
        const password = passwordInput.value;

        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Confirm Password: ${confirmPasswordInput.value}`);

        // Ensure passwords match before submitting
        if (passwordInput.classList.contains('input-error')) {
            return; // Exit if there's a mismatch
        }
        await signUp(name,email, password);
    });
});