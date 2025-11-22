import { getProfiles, getCustomers } from './storage.js';

export async function initIdManager() {
    const container = document.getElementById('id-list-container');
    
    if (!container) {
        console.error("Error: #id-list-container not found.");
        return;
    }

    // 1. Clear previous list
    container.innerHTML = ''; 

    // 2. Fetch all saved Agent IDs
    const profiles = await getProfiles();

    if (profiles.length === 0) {
        container.innerHTML = '<p style="padding:20px; color:#888; text-align:center;">No IDs found. Click + to add one.</p>';
        return;
    }

    // 3. Loop through each ID and calculate Stats
    for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        
        // Fetch customers SPECIFIC to this Agent ID to calculate totals
        const customers = await getCustomers(profile.id);
        
        // Math: Calculate Total Amount & Count
        const totalCount = customers.length;
        const totalAmount = customers.reduce((sum, c) => sum + (c.denomination || 0), 0);

        // 4. Generate the Card HTML
        const card = document.createElement('div');
        card.className = 'card'; // Matches your css
        
        // Format currency (e.g. 50,000)
        const formattedAmount = totalAmount.toLocaleString('en-IN');

        card.innerHTML = `
            <div class="id-head">
                <h1>#${i + 1}</h1>
                <p class="id">${profile.id}</p>
            </div>

            <div class="details">
                <div>Total Amount: <span>${formattedAmount}</span></div>
                <div>Total Accounts: <span>${totalCount}</span></div>
            </div>
        `;

        // Optional: Click card to switch to that ID?
        // card.addEventListener('click', () => switchToProfile(profile.id));

        container.appendChild(card);
    }
}

// --- Add New ID Logic ---
const addBtn = document.getElementById('add-id-btn');
if (addBtn) {
    addBtn.addEventListener('click', () => {
        // Redirect to setup page to add a new one
        window.location.href = 'setup.html';
    });
}