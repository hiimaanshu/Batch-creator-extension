// js/storage.js

// --- 1. Profile Management (The Agent ID) ---

export async function getProfiles() {
    const result = await chrome.storage.local.get("agentProfiles");
    return result.agentProfiles || [];
}

export async function getActiveProfile() {
    // Returns the ID of the currently selected agent (if you have multiple)
    const result = await chrome.storage.local.get("activeProfileId");
    return result.activeProfileId || null;
}

export async function setActiveProfile(agentId) {
    await chrome.storage.local.set({ activeProfileId: agentId });
}

export async function createProfile(agentId, agentName = "My Agency") {
    // We use the REAL Agent ID (e.g., "DOP.MI.12345") as the key
    const profiles = await getProfiles();
    
    // Check if already exists to avoid duplicates
    if (!profiles.find(p => p.id === agentId)) {
        profiles.push({
            id: agentId, // The "DOP.MI..." string
            name: agentName,
            createdOn: new Date().toLocaleDateString()
        });
        await chrome.storage.local.set({ agentProfiles: profiles });
    }
    
    // Automatically set this new one as active
    await setActiveProfile(agentId);
    return agentId;
}

// --- 2. Customer Data (Linked to Agent ID) ---

export async function getCustomers(agentId) {
    const result = await chrome.storage.local.get("customers");
    const allCustomers = result.customers || [];
    // Filter: Only show customers belonging to this specific Agent ID
    return allCustomers.filter(c => c.agentId === agentId);
}

export async function saveCustomers(agentId, newCustomerList) {
    // newCustomerList = Array of objects { accountNo, name, denomination }
    const result = await chrome.storage.local.get("customers");
    let allCustomers = result.customers || [];

    // 1. Remove old customers for THIS agent (to avoid duplicates/stale data)
    //    We assume the "Import" provides a full, fresh list.
    allCustomers = allCustomers.filter(c => c.agentId !== agentId);

    // 2. Tag the new customers with the Agent ID
    const taggedCustomers = newCustomerList.map(c => ({
        ...c,
        agentId: agentId // This links the person to the "DOP.MI" ID
    }));

    // 3. Merge and Save
    const updatedList = [...allCustomers, ...taggedCustomers];
    await chrome.storage.local.set({ customers: updatedList });
}

// --- 3. Password Vault (Linked to Agent ID) ---

export async function savePassword(agentId, password) {
    const result = await chrome.storage.local.get("vault");
    const vault = result.vault || {};
    
    // Store the password under the Agent ID
    vault[agentId] = {
        currentPassword: password,
        lastUpdated: new Date().toLocaleDateString()
    };
    
    await chrome.storage.local.set({ vault: vault });
}

export async function getPassword(agentId) {
    const result = await chrome.storage.local.get("vault");
    const vault = result.vault || {};
    return vault[agentId] || null;
}