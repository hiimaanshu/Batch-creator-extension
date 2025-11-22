const url = "https://script.google.com/macros/s/AKfycbzkCJ1BD4PLTa0fOXJyPtykJ0w93Wd-Uan44B8oy6HvHuUmvzP8LJQzbZ0RaKj1ZRKe4w/exec"
let jsonData = [];
let sortDirection = {};
const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
const searchTableContent = document.getElementById('searchTableContent').getElementsByTagName('tbody')[0];
const searchInput = document.getElementById('searchInput');
const searchTable = document.getElementById('searchTableContent');
const filterSelect = document.getElementById('filterSelect');
const batchFilter = document.getElementById('batchFilter');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const cancelEdit = document.getElementById('cancelEdit');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const cancelAdd = document.getElementById('cancelAdd');
const updateAll = document.getElementById('updateAll');
const addAccountBtn = document.getElementById('addAccountBtn');
const message = document.getElementById('message');
const notFound = document.getElementById('notFound');
const selectAll = document.getElementById('select-all');
const editName = document.getElementById('editName');
const editAccountNumber = document.getElementById('editAccountNumber');
const addName = document.getElementById('editName');
const addAccountNumber = document.getElementById('editAccountNumber');
const sortIcons = document.querySelectorAll('th[data-sort]');
const tableBody = document.getElementById('tableBody');
let selectedAccounts = [];
//================================================================//
//----------------------  Data Processing   ----------------------//
//================================================================//
function print(...args) {
    console.log(...args);
}
function showLoader(show) {
    const overlay = document.getElementById("overlay");
    const loader = document.getElementById("loader");
    if (show) {
        overlay.style.display = 'block';
        loader.style.display = 'block';
    }
    else {
        overlay.style.display = 'none';
        loader.style.display = 'none';
    }
}
async function fetchData() {
    const scriptURL = url + '?action=get';
    const response = await fetch(scriptURL);
    const data = await response.json();
    return data;
}
function populateDropdown(dropdown, options) {
    dropdown.innerHTML = '<option value="">All Batches</option><option value="N/A">N/A</option>';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        dropdown.appendChild(optionElement);
    });
}
function populateBatchFilter() {
    const batches = [...new Set(jsonData.map(row => row[4].toString()))];
    populateDropdown(batchFilter, batches);
}
function populateBatchDropdowns() {
    const batches = [...new Set(jsonData.map(row => row[4].toString()))];
    populateDropdown(document.getElementById('editBatchNumber'), batches);
    populateDropdown(document.getElementById('addBatchNumber'), batches);
}
function filterData() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterType = filterSelect.value;
    const batchNumber = batchFilter.value;
    const filteredData = jsonData.filter(row => {
        const matchesSearch = searchTerm === '' || row.some(cell => cell.toString().toLowerCase().includes(searchTerm));
        const matchesFilter = !filterType || (
            (filterType === 'id' && row[5].toString().includes(searchTerm)) ||
            (filterType === 'batchNumber' && row[4].toString().includes(searchTerm)) ||
            (filterType === 'rdAmount' && row[2].toString().includes(searchTerm))
        );
        const matchesBatch = !batchNumber || row[4].toString() === batchNumber;
        return matchesSearch && matchesFilter && matchesBatch;
    });
    if (batchNumber !== "") {
        const nonBatchFilteredData = jsonData.filter(row => {
            const matchesSearch = searchTerm !== '' && row.some(cell => cell.toString().toLowerCase().includes(searchTerm));
            const matchesFilter = !filterType || (
                (filterType === 'id' && row[5].toString().includes(searchTerm)) ||
                (filterType === 'batchNumber' && row[4].toString().includes(searchTerm)) ||
                (filterType === 'rdAmount' && row[2].toString().includes(searchTerm))
            );
            const doesNotMatchBatch = row[4].toString() !== batchNumber;
            return matchesSearch && matchesFilter && doesNotMatchBatch;
        });
        if (nonBatchFilteredData.length === 0 && searchTerm.length > 0) {
            showNotFound(true);
            //showSearchResults(false);
        } else {
            showNotFound(false);
        }
        // if (nonBatchFilteredData.length === 0 && searchTerm.length==="")
        //     {showSearchResults(false);}
        // if (nonBatchFilteredData.length >0 )
        //     {showSearchResults(true);}
        const batchFilteredData = jsonData.filter(row => row[4].toString() === batchNumber);
        renderSearch(nonBatchFilteredData, searchTerm);
        renderTable(batchFilteredData, searchTerm);
    } else {
        if (filteredData.length === 0 && searchTerm.length > 0) {
            print(notFound.style.display);
            showNotFound(true);
        } else {
            showNotFound(false);
        }
        renderTable(filteredData, searchTerm);
    }
}
function showNotFound(show) {
    if (show) {
        notFound.style.display = 'block';
    }
    else {
        notFound.style.display = 'none';
    }
}
function calculateTotalAmount(data) {
    let totalAmount = 0;
    for (let i = 0; i < data.length; i++) {
        totalAmount += data[i][2];
    }
    return totalAmount;
}
function addToBatch(row, batch) {
    const index = jsonData.findIndex(r => r[1] === row[1]);  // Assuming Account Number is unique
    console.log('row:', row, index);
    if (index > -1) {
        jsonData[index][4] = batch;
        filterData();
    }
}
function renderSearch(data, text) {
    searchTableContent.innerHTML = '';
    const fragment = document.createDocumentFragment();
    data.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.className = 'center-align';
            tr.appendChild(td);
        });
        const actionsTd = document.createElement('td');
        const editBtn = createButton('Add to batch', 'add-to-batch', () => addToBatch(row, batchFilter.value));
        actionsTd.appendChild(editBtn);
        actionsTd.className = 'center-align';
        tr.appendChild(actionsTd);
        fragment.appendChild(tr);
    });
    searchTableContent.appendChild(fragment);
}
function updateSummary(amount = 0, accounts = 0) {
    const accText = document.getElementById('totalAccounts');
    const amountText = document.getElementById('totalAmount');
    accText.textContent = accounts;
    amountText.textContent = "₹ " + amount.toLocaleString('en-IN');
    amountText.style.color = amount > 20000 ? '#ff4742' : '#000000';
}
function updateSelectedAccounts(accountNumber) {
    if (selectedAccounts.includes(accountNumber)) {
        let index = selectedAccounts.indexOf(accountNumber);
        if (index > -1) {
            selectedAccounts.splice(index, 1);
        }
    }
    else {
        selectedAccounts.push(accountNumber);
    }
}

function renderTable(data) {

    const fragment = document.createDocumentFragment();
    let totalAmount = calculateTotalAmount(data);
    let totalAccounts = data.length;
    updateSummary(totalAmount, totalAccounts);
    //-----------  Data Row ----------  //
    data.forEach((row, index) => {

        const tr = document.createElement('tr');
        // Checkbox column
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox';
        checkbox.dataset.rowIndex = index;
        checkbox.addEventListener('change', function (event) {

            handleRowSelection(event, row[1]);
        });
        if (selectedAccounts.includes(row[1])) {
            if (checkbox) {
                checkbox.checked = true; // Check the checkbox
            }
        }
        tr.appendChild(createCell(checkbox));
        // Data columns
        row.forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            td.textContent = cell;
            // Center-align the Batch Number column (assuming it's the 5th column, index 4)
            if (cellIndex === 1 || cellIndex === 2 || cellIndex === 4) td.className = 'center-align';
            tr.appendChild(td);
        });
        // Actions column
        const actionsTd = document.createElement('td');
        actionsTd.appendChild(createButton('Edit', 'edit-btn', () => openEditModal(row, index)));
        if (batchFilter.value !== "" && batchFilter.value !== 'N/A') {
            actionsTd.appendChild(createButton('Remove', 'remove-btn', () => removeAccount(row)));
        }
        actionsTd.appendChild(createButton('Delete', 'delete-btn', () => deleteRow(row)));
        actionsTd.className = 'center-align'
        tr.appendChild(actionsTd);
        tr.addEventListener('dblclick', (event) => {
            const checkbox = tr.querySelector('.row-checkbox');
            if (checkbox) {
                checkbox.checked = !checkbox.checked; // Toggle the checkbox checked state
                updateSelectedAccounts(accNo);
            } else {
                console.error('Checkbox not found in the row');
            }
        });
        fragment.appendChild(tr);
    });

    dataTable.innerHTML = '';
    dataTable.appendChild(fragment);
}
function removeAccount(row) {
    addToBatch(row, "N/A");
}

function handleRowSelection(event, accountNo) {
    updateSelectedAccounts(accountNo);

    const pinnedRows = [...tableBody.querySelectorAll('.pinned')];
    const lastPinnedRow = pinnedRows[pinnedRows.length - 1];
    const row = event.target.closest('tr');

    const insertRow = () => {
        if (lastPinnedRow) {
            tableBody.insertBefore(row, lastPinnedRow.nextSibling);
        } else {
            tableBody.prepend(row);
        }
    };

    if (event.target.checked) {
        insertRow();
        row.classList.add('pinned');
    } else {
        row.classList.remove('pinned');
        insertRow();
    }
}
function toggleAllCheckboxes(e) {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    let alredyChecked = [];
    checkboxes.forEach(cb => {
        
        if (cb.checked && e.target.checked ) {
            alredyChecked.push(jsonData[cb.dataset.rowIndex][1]);
        }
        cb.checked = e.target.checked;
    });
    print(alredyChecked);
    for (let i = 0; i < jsonData.length; i++) {
        const accountNumber = jsonData[i][1];
        if (alredyChecked.includes(accountNumber)) {
            let index = alredyChecked.indexOf(accountNumber);
            if (index > -1) {
                alredyChecked.splice(index, 1);
            }
        }
        else {
            updateSelectedAccounts(accountNumber);
        }
    }
}
function createCell(content) {
    const td = document.createElement('td');
    if (content instanceof Node) {
        td.appendChild(content);
    } else {
        td.textContent = content;
    }
    return td;
}
function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.addEventListener('click', onClick);
    return button;
}
function deleteRow(row) {
    const backGround = document.getElementById("background");
    const alertBox = document.getElementById("alertBox");
    backGround.style.display = "block";
    alertBox.style.display = "block";
    //Confirm with the user if they really want to delete the row
    document.getElementById("cancelButton").onclick = function () {
        backGround.style.display = "none";
        alertBox.style.display = "none";
    }
    document.getElementById("deleteButton").onclick = function () {
        backGround.style.display = "none";
        alertBox.style.display = "none";
        showLoader(true);
        const accountNumber = row[1];
        // Find the index of the row in jsonData based on the unique Account Number
        const index = jsonData.findIndex(r => r[1] === accountNumber);
        // If the row is found (index is not -1)
        if (index > -1) {
            // Remove the row from jsonData
            deleteData(accountNumber.toString()).then(result => {
                showLoader(false);
                if (result === 'Delete Successful') {
                    // Handle success
                    console.log('Account deleted successfully.');
                    jsonData.splice(index, 1);
                    // Re-filter and re-render the table to reflect the deletion
                    filterData();
                    loader.style.display = 'none';
                    showMessage(true, 'Account deleted successfully');
                } else {
                    showMessage(false, result);
                }
            });
        } else {
            showMessage(false, `Row with Account Number ${accountNumber} not found.`);
            console.error(`Row with Account Number ${accountNumber} not found.`);
        }
    }
}
function sortTable(column) {
    const index = ['name', 'accountNumber', 'rdAmount', 'date', 'batchNumber', 'id'].indexOf(column);// Get the index of the column to be sorted based on its name
    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';// Toggle the sort direction for the specified column
    // Sort the jsonData array based on the specified column and direction
    jsonData.sort((a, b) => {
        let valueA = a[index];
        let valueB = b[index];
        // Parse values as floats if the column is 'rdAmount' or 'id'
        if (column === 'rdAmount' || column === 'id') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }
        // Compare the values and return the appropriate order based on the sort direction
        if (valueA < valueB) return sortDirection[column] === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection[column] === 'asc' ? 1 : -1;
        return 0;
    });
    // Re-render the table with the sorted data
    renderTable(jsonData);
    // Update the sort icons in the table headers
    updateSortIcons(column);
}
function updateSortIcons(sortedColumn) {
    const headers = document.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
        const icon = header.querySelector('i');
        if (icon) {
            if (header.dataset.sort === sortedColumn) {
                icon.className = sortDirection[sortedColumn] === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
            }
        }
    });
}
async function addData(name, accountNumber, rdAmount, date, batchNumber, id) {
    const addURL = url + `?action=add&name=${name}&accountNumber=${accountNumber}&rdAmount=${rdAmount}&date=${date}&batchNumber=${batchNumber}&id=${id}`;
    const response = await fetch(addURL);
    const result = await response.text();
    console.log(result);
    return result;
}
function openEditModal(row, idx) {
    const checkbox = document.querySelector(`.row-checkbox[data-row-index="${idx}"]`);
    const editDate = document.getElementById('editDate');
    const editRdAmount = document.getElementById('editRdAmount');
    const editBatchNumber = document.getElementById('editBatchNumber');
    const editId = document.getElementById('editId');
    const nameGroup = document.querySelector('#editName').closest('.form-group');
    const accNoGroup = document.querySelector('#editAccountNumber').closest('.form-group');
    const dateGroup = document.querySelector('#editDate').closest('.form-group');
    const rdAmountGroup = document.querySelector('#editRdAmount').closest('.form-group');
    const idGroup = document.querySelector('#editId').closest('.form-group');
    const updateBtn = document.querySelector('.btn-primary'); //
    const updateAllBtn = document.querySelector('.btn-primary-all'); //
    const noticeElement = document.getElementById('notice');
    const selectedRows = document.querySelectorAll('.row-checkbox:checked');

    let checkedRows = [];

    for (const checkbox of selectedRows) {
        const rowIndex = parseInt(checkbox.dataset.rowIndex);
        checkedRows.push(rowIndex);
    }

    if (nameGroup.style.display === 'none') {

        noticeElement.style.display = 'none';
        updateAllBtn.style.display = 'none';

        nameGroup.style.display = 'block';
        accNoGroup.style.display = 'block';
        dateGroup.style.display = 'block';
        rdAmountGroup.style.display = 'block';
        idGroup.style.display = 'block';
        updateBtn.style.display = 'block';
    }

    editName.value = row[0];
    editAccountNumber.value = row[1];
    editRdAmount.value = row[2];
    editDate.value = row[3];
    editBatchNumber.value = row[4];
    editId.value = row[5];

    if (selectedAccounts.length > 1) {
        const displayValue = checkbox.checked ? 'block' : 'none';
        noticeElement.style.display = displayValue;

        updateAllBtn.style.display = displayValue;

        [nameGroup, accNoGroup, dateGroup, rdAmountGroup, idGroup, updateBtn].forEach(group =>
            group.style.display = checkbox.checked ? 'none' : 'block');
    }
    editModal.style.display = 'block';
}

async function updateData(accountNumber, name, newAccountNumber, rdAmount, date, batchNumber, id) {
    const updateURL = url + `?action=update&accountNumber=${accountNumber}&name=${name}&newAccountNumber=${newAccountNumber}&rdAmount=${rdAmount}&date=${date}&batchNumber=${batchNumber}&id=${id}`;
    const response = await fetch(updateURL);
    const result = await response.text();
    console.log(result);
}
async function deleteData(accountNumber) {
    const deleteURL = url + `?action=delete&accountNumber=${accountNumber}`;
    const response = await fetch(deleteURL);
    const result = await response.text();
    console.log(deleteURL);
    console.log(result);
    return result;
}
async function deleteSelectedRows() {
    const selectedRows = document.querySelectorAll('.row-checkbox:checked');
    for (const checkbox of selectedRows) {
        const rowIndex = parseInt(checkbox.dataset.rowIndex);
        const row = document.querySelectorAll('#data-table tbody tr')[rowIndex];
        const accountNumber = row.cells[1].textContent;
        //await deleteData(accountNumber);
        console.log(rowIndex);
    }
    // Refresh the table
    const data = await fetchData();
    document.querySelector('#data-table tbody').innerHTML = '';
    populateTable(data);
}
function showMessage(isSuccess, message) {
    const messageBox = document.createElement("div");
    messageBox.className = "message_box";
    messageBox.innerText = message;
    messageBox.style.background = isSuccess ? 'green' : 'red';
    document.body.appendChild(messageBox);
    setTimeout(() => {
        document.body.removeChild(messageBox);
    }, 3000);
}
function showSearchResults(show) {
    if (show) {
        searchTable.style.display = 'block';
    } else {
        searchTable.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // fetchData().then(data => {
    //     jsonData = data.slice(1);  // Remove header row
    //     renderTable(jsonData);
    //     //populateTable(jsonData);
    //     populateBatchFilter();
    //     populateBatchDropdowns();
    // }
    // ).catch(error => console.error('Error loading JSON data:', error));
    showLoader(false);
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data.slice(1);  // Remove header row
            renderTable(jsonData);
            populateBatchFilter();
            populateBatchDropdowns();
        })
        .catch(error => console.error('Error loading JSON data:', error));

    searchInput.addEventListener('input', filterData);
    filterSelect.addEventListener('change', filterData);
    batchFilter.addEventListener('change', filterData);
    selectAll.addEventListener('change', toggleAllCheckboxes);
    addAccountBtn.onclick = function () {
        addModal.style.display = 'block';
    };
    addForm.onsubmit = async function (e) {
        e.preventDefault();
        const newRow = [
            document.getElementById('addName').value,
            document.getElementById('addAccountNumber').value,
            parseInt(document.getElementById('addRdAmount').value),
            document.getElementById('addDate').value,
            document.getElementById('addBatchNumber').value,
            parseInt(document.getElementById('addId').value)
        ];
        // Show overlay and loader
        showLoader(true);
        try {
            // Call the addData function and wait for it to complete
            const result = await addData(newRow[0], newRow[1], newRow[2], newRow[3], newRow[4], newRow[5]);
            // Hide loader, show message with the returned result
            showLoader(false);
            if (result === 'Add Successful') {
                // Handle success
                console.log('Entry added successfully.');
                jsonData.push(newRow);
                filterData();
                addModal.style.display = 'none';
                addForm.reset();
                showMessage(true, 'Entry added successfully');
            } else {
                // Handle failure (e.g., account number already exists)
                console.log(result);
                showMessage(false, 'Account number already exists');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(false, 'Something went wrong');
        }
    };
    cancelAdd.onclick = function () {
        addModal.style.display = 'none';
        addForm.reset();
    };
    updateAll.onclick = function () {

        const updatedBatchNumber = document.getElementById('editBatchNumber').value;
        selectedAccounts.forEach(accountNumber => {
            const index = jsonData.findIndex(r => r[1] === accountNumber);  // Assuming Account Number is unique
            if (index > -1) {
                print('Before : ', accountNumber, "  : ", jsonData[index][4]);
                jsonData[index][4] = updatedBatchNumber;
                print('After : ', accountNumber, "  : ", jsonData[index][4]);
            }
        });
        filterData();
        editModal.style.display = 'none';
    };
    editForm.onsubmit = function (e) {
        e.preventDefault();
        const updatedRow = [
            document.getElementById('editName').value,
            document.getElementById('editAccountNumber').value,
            parseInt(document.getElementById('editRdAmount').value),
            document.getElementById('editDate').value,
            document.getElementById('editBatchNumber').value,
            parseInt(document.getElementById('editId').value)
        ];
        const index = jsonData.findIndex(r => r[1] === updatedRow[1]);  // Assuming Account Number is unique
        if (index > -1) {
            jsonData[index] = updatedRow;
            filterData();
            editModal.style.display = 'none';
        }
    };
    cancelEdit.onclick = function () {
        editModal.style.display = 'none';
    };
    editName.addEventListener('input', function (e) {
        var value = e.target.value;
        e.target.value = value.replace(/[^a-zA-Z\s]/g, '');
    });
    editAccountNumber.addEventListener('input', function (e) {
        var value = e.target.value;
        e.target.value = value.replace(/[^0-9]/g, '');
    });
    addName.addEventListener('input', function (e) {
        var value = e.target.value;
        e.target.value = value.replace(/[^a-zA-Z\s]/g, '');
    });
    addAccountNumber.addEventListener('input', function (e) {
        var value = e.target.value;
        e.target.value = value.replace(/[^0-9]/g, '');
    });
    sortIcons.forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.sort));
    });
}
);
async function applyBatchNumber() {
    const batchNumber = document.getElementById('edit-batch-number').value;
    const selectedRows = document.querySelectorAll('.row-checkbox:checked');
    for (const checkbox of selectedRows) {
        const rowIndex = parseInt(checkbox.dataset.rowIndex);
        const row = document.querySelectorAll('#data-table tbody tr')[rowIndex];
        const accountNumber = row.cells[1].textContent;
        await updateData(accountNumber, '', '', '', '', batchNumber, '');
    }
    // Refresh the table
    const data = await fetchData();
    document.querySelector('#data-table tbody').innerHTML = '';
    populateTable(data);
}


const tableData = [];
document.querySelectorAll('#ListTableWithCtrls table tr').forEach(row => {
    const rowData = [];
    row.querySelectorAll('td').forEach(cell => {
        rowData.push(cell.innerText.trim());
    });
    if (rowData.length > 1) 
        {tableData.push(rowData);}
    else{
        const headings = document.querySelectorAll('th');
  
        // Initialize an empty array to store the heading text
        const headingList = [];
        
        // Iterate through each th element
        headings.forEach(heading => {
          // Find the span with class 'tableheader_nosort'
          const headerSpan = heading.querySelector('.tableheader_nosort');
          
          // If found, add its text content to the list
          if (headerSpan) {
            headingList.push(headerSpan.textContent.trim());
          }
        });
        
        // Return the list of headings
        tableData.push(headingList);
    }
});
const accdata = JSON.stringify(tableData);
console.log(accdata);
