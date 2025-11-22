function injectDialogCSS() {
    if (document.getElementById('dialog-styles')) return; // Avoid duplicate styles

    const link = document.createElement('link');
    link.id = 'dialog-styles';
    link.rel = 'stylesheet';
    link.href = 'css/dialog.css'; // Update this path to the actual path of your CSS file

    document.head.appendChild(link);
}


function createCustomDialog() {
    injectDialogCSS();
    if (document.getElementById('custom-confirm-dialog')) return;

    const dialogHTML = `
        <div id="custom-confirm-dialog" class="hidden">
            <div class="dialog-content">
                <h3>Are you sure?</h3>
                <hr />
                <p>Do you want to logout?</p>
                <div class="dialog-buttons">
                    <button id="confirm-no">Cancel</button>
                    <button id="confirm-yes">Logout</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
}


export function attachConfirmationDialog(selector) {
    createCustomDialog();
    const dialog = document.getElementById('custom-confirm-dialog');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');

    document.querySelectorAll(selector).forEach(button => {
        button.addEventListener('click', function (event) {
            const buttonId = this.getAttribute('id');
            if (buttonId === "logout") {
                updateDialogMessage("Do you want to log out?");
            }
            event.preventDefault();
            dialog.classList.remove('hidden');
            dialog.classList.add('visible');

            confirmYes.onclick = () => {
                dialog.classList.remove('visible');
                dialog.classList.add('hidden');
                const buttonId = this.getAttribute('id');
                if (buttonId && typeof window[buttonId] === 'function') {
                    window[buttonId]();
                }
            };
            confirmNo.onclick = () => {
                dialog.classList.remove('visible');
                dialog.classList.add('hidden');
            };
        });
    });
}



export function updateDialogMessage(newMessage) {
    const dialogMessageElement = document.querySelector('#custom-confirm-dialog p');
    if (dialogMessageElement) {
        dialogMessageElement.textContent = newMessage;
    }
}