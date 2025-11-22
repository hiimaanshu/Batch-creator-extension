import { saveCustomers, getActiveProfile } from './storage.js';

const fileInput = document.getElementById('file-input');
const importBtn = document.getElementById('import-btn');
const skipBtn = document.getElementById('skip-btn');
const fileNameDisplay = document.getElementById('file-name-display');
const statusMsg = document.getElementById('status-msg');

// --- 1. Handle File Selection ---
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        importBtn.disabled = false;
        importBtn.style.opacity = "1";
    }
});

// --- 2. The Import Logic ---
importBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // UI Feedback
    importBtn.disabled = true;
    importBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Importing...`;
    
    const reader = new FileReader();
    
    reader.onload = async function(event) {
        try {
            const htmlContent = event.target.result;
            const scrapedData = scrapeHtml(htmlContent);
            
            if (scrapedData.length === 0) {
                throw new Error("No accounts found. Check if this is the correct file.");
            }

            // Get current agent ID to link these customers to
            const activeId = await getActiveProfile();
            if (!activeId) {
                throw new Error("No active Agent ID found. Please restart.");
            }

            // Save to Storage
            await saveCustomers(activeId, scrapedData);

            // Success! Redirect.
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1000);

        } catch (err) {
            console.error(err);
            alert("Import Failed: " + err.message);
            importBtn.disabled = false;
            importBtn.innerHTML = `Import Data <i class="fa-solid fa-file-import"></i>`;
        }
    };

    reader.readAsText(file);
});

// --- 3. The Scraper Function ---
function scrapeHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // 1. Extract the "Printed on" date (Global for this batch)
    let printedOnDate = "Unknown";
    const dateEl = doc.querySelector('.paginationtxt'); // Finds "Printed on 10-Jun-2024..."
    if (dateEl) {
        printedOnDate = dateEl.textContent.replace('Printed on', '').trim();
    }

    // 2. Find the Table
    const table = doc.getElementById('SummaryList');
    if (!table) return [];

    const rows = table.querySelectorAll('tr');
    const customers = [];

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        
        // Ensure it's a data row (needs at least 6 columns)
        if (cells.length >= 6) {
            
            const accountNo = cells[1]?.textContent?.trim();
            const name = cells[2]?.textContent?.trim();
            const rawAmount = cells[3]?.textContent?.trim();
            const monthPaid = cells[4]?.textContent?.trim();
            const nextDueDate = cells[5]?.textContent?.trim();

            // Basic validation
            if (accountNo && rawAmount && !isNaN(parseFloat(accountNo))) {
                
                // Clean the Amount ("500.00 Cr." -> 500)
                let cleanAmount = rawAmount.replace(/,/g, '').replace(' Cr.', '').trim();
                let denomination = parseFloat(cleanAmount);

                customers.push({
                    accountNo: accountNo,
                    name: name,
                    denomination: denomination,
                    monthPaidUpto: monthPaid,   // <-- NEW FIELD
                    nextDueDate: nextDueDate,   // <-- NEW FIELD
                    lastUpdated: printedOnDate, // <-- NEW FIELD (Metadata)
                    active: true
                });
            }
        }
    });

    console.log(`Scraped ${customers.length} customers. Updated: ${printedOnDate}`);
    return customers;
}

// --- 4. Skip Logic ---
skipBtn.addEventListener('click', () => {
    window.location.href = 'main.html';
});