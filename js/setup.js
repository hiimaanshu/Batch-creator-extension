import { getActiveProfile, createProfile } from './storage.js';

// 1. Auto-Redirect Logic (The Gatekeeper)
async function checkLoginStatus() {
    const activeId = await getActiveProfile();
    
    if (activeId) {
        // Already Logged In? Go to Dashboard instantly.
        window.location.href = 'main.html';
    } else {
        // Not Logged In? Show the Setup Form.
        document.body.classList.remove('hidden');
    }
}

// Run the check immediately when page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);


// 2. Setup Form Logic
const saveBtn = document.getElementById('save-btn');
const idInput = document.getElementById('agent-id');
const nameInput = document.getElementById('agent-name');
const errorMsg = document.getElementById('error-msg');

saveBtn.addEventListener('click', async () => {
    const id = idInput.value.trim();
    const name = nameInput.value.trim() || "My Agency";

    if (id.length < 5) {
        errorMsg.style.display = 'block';
        return;
    }

    // Save to storage
    await createProfile(id, name);
    
    // CHANGE: Redirect to Import Page instead of Main
    window.location.href = 'import.html';
});

// Helper: Hide error when typing
idInput.addEventListener('input', () => {
    errorMsg.style.display = 'none';
});