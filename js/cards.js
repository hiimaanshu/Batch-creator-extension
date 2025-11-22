// js/cards.js
import { getCustomers, getActiveProfile } from './storage.js';

const container = document.getElementById('cards-container'); // Ensure this matches your HTML ID
const totalBadge = document.getElementById('total-users');
const searchInput = document.getElementById('card-search');
const noDataMsg = document.getElementById('no-data-msg');

let allCustomers = [];

export async function initCardView() {
    const activeId = await getActiveProfile();
    
    if (!activeId) {
        container.innerHTML = '<div class="empty-state">Please select an Agent ID</div>';
        return;
    }

    allCustomers = await getCustomers(activeId);
    if(totalBadge) totalBadge.textContent = allCustomers.length;
    renderList(allCustomers);
}

function renderList(customers) {
    // Clear current list
    container.innerHTML = ''; 

    // Handle Empty State
    if (customers.length === 0) {
        if(noDataMsg) noDataMsg.classList.remove('hide');
    } else {
        if(noDataMsg) noDataMsg.classList.add('hide');
    }

    const fragment = document.createDocumentFragment();

    customers.forEach(c => {
        const card = document.createElement('div');
        card.className = 'customer-card'; // Matches the new CSS
        
        // Logic for visual status (Red text if overdue/high amount)
        const dueClass = c.nextDueDate ? 'highlight' : '';

        card.innerHTML = `
            <div class="card-top">
                <div class="customer-info">
                    <div class="customer-name" title="${c.name}">${c.name}</div>
                    <div class="customer-acc">
                        <i class="fas fa-hashtag"></i> ${c.accountNo}
                    </div>
                </div>
                <div class="customer-amount">₹${c.denomination}</div>
            </div>
            
            <div class="card-divider"></div>

            <div class="card-bottom">
                <div class="stat-box">
                    <span class="stat-label">Paid Upto</span>
                    <span class="stat-value">${c.monthPaidUpto || '-'}</span>
                </div>
                <div class="stat-box right">
                    <span class="stat-label">Next Due</span>
                    <span class="stat-value ${dueClass}">${c.nextDueDate || 'N/A'}</span>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

// Search Logic
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allCustomers.filter(c => 
            c.name.toLowerCase().includes(term) || 
            c.accountNo.includes(term)
        );
        renderList(filtered);
    });
}