import { attachConfirmationDialog } from "../js/ui-injection.js";
import { initCardView } from './cards.js';
import { initIdManager } from './id-manager.js';

function p(...messages) {
    console.log(...messages);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    const menuIcon = document.getElementById('menu-show');

    // Toggle sidebar visibility
    sidebar.classList.toggle('hidden');

    // Toggle menu icon rotation
    menuIcon.classList.toggle('changed');

    // Adjust content margin based on sidebar visibility
    content.style.marginRight = sidebar.classList.contains('hidden') ? '-56px' : '0'; // Adjust based on sidebar width + gap
}

document.getElementById('menu-show').addEventListener('click', toggleSidebar);
document.getElementById('menu-hide').addEventListener('click', toggleSidebar);

document.addEventListener('DOMContentLoaded', () => {
    attachConfirmationDialog('.confirm');
});
// document.getElementById("settings"), () => {
//     chrome.tabs.query({}, function (tabs) {
//         const existingTab = tabs.find(tab => tab.id === currentTabId);
//         if (existingTab) {
//             chrome.tabs.remove(existingTab.id);
//             currentTabId = null;
//         } else {
//             chrome.tabs.create({ url: url }, function (tab) {
//                 currentTabId = tab.id;
//             });
//         }
//     });
// }

// Array to store the ID of the currently opened tab

function updateCard(serialNo, id, totalAmount, totalAccounts) {
    document.getElementById('serial').textContent = `#${serialNo}`;
    document.getElementById('id').textContent = id;
    document.getElementById('amount').textContent = totalAmount;
    document.getElementById('accounts').textContent = totalAccounts;
}

function showContent(pageId) {
    const contents = document.querySelectorAll('.pages > div');
    contents.forEach(content => content.classList.add('hide'));
    document.getElementById(pageId).classList.remove('hide');
}


let currentTabId = null;
const slider = document.getElementById("active-icon");

document.querySelectorAll('.icon').forEach((icon, index) => {
    icon.addEventListener('click', function () {
        const isActive = icon.classList.contains('active');
        let url;
        let page;
        const panel = this.dataset.panel;

        // Determine the URL based on the data-panel attribute
        switch (panel) {
            case 'dashboard':
                url = 'dashboard/index.html';
                page = "home-page";
                break;
            case 'batch-management':
                url = 'batch.management.html';
                page = "data-page";
                initCardView();
                break;
            case 'id-management':
                url = 'id.management.html';
                page = "id-management-page";
                initIdManager();
                break;
            case 'password-manager':
                url = 'password.management.html';
                page = "password-management-page";
                break;
            case 'database-management':
                url = 'database.management.html';
                page = "database-management-page";
                break;
            case 'settings':
                url = 'settings.html';
                break;
        }
        if (page){
            showContent(page);
        }

        if (url) {
            chrome.tabs.query({}, function (tabs) {
                const existingTab = tabs.find(tab => tab.id === currentTabId);

                if (isActive) {
                    // If the icon is active, deactivate it and close the tab
                    icon.classList.remove('active');
                    if (panel !== 'settings') {
                        slider.style.display = "none";
                    }
                    if (existingTab) {
                        chrome.tabs.remove(existingTab.id).then(function () {
                            slider.style.display = "none";
                            currentTabId = null;
                        });;
                        currentTabId = null;
                    }
                } else {
                    // If the icon is not active, activate it
                    document.querySelectorAll('.icon').forEach(i => i.classList.remove('active'));
                    icon.classList.add('active');

                    if (panel !== 'settings') {
                        slider.style.display = "block";
                        slider.style.top = `${45 + index * 60}px`;
                    }else{
                        slider.style.display = "none";
                    }

                    if (existingTab) {
                        // Update the existing tab's URL
                        chrome.tabs.update(existingTab.id, { url: url });
                    } else {
                        // Open a new tab and store its ID
                        chrome.tabs.create({ url: url }, function (tab) {
                            currentTabId = tab.id;
                        });
                    }
                }
            });
        }
    });
});
