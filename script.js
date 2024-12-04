// Global Variables
let notFollbackAccounts = [];
let totalNotFollback = 0;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    setCustomFileInputListener('.custom-file-input');
});

// Utility: Add event listener for custom file inputs
function setCustomFileInputListener(inputSelector) {
    document.querySelectorAll(inputSelector).forEach(input => {
        input.addEventListener('change', function () {
            const fileName = this.files[0] ? this.files[0].name : 'Choose file';
            this.nextElementSibling.innerText = fileName;
        });
    });
}

// Switch Forms
function showJsonUploadForm() {
    const inputSection = document.getElementById('inputSection');
    inputSection.innerHTML = `
        <div class="form-group">
            <label for="followersFile" class="font-weight-bold">Upload followers_1.json</label>
            <div class="custom-file">
                <input type="file" id="followersFile" class="custom-file-input" accept=".json">
                <label class="custom-file-label">Choose file</label>
            </div>
        </div>
        <div class="form-group">
            <label for="followingFile" class="font-weight-bold">Upload following.json</label>
            <div class="custom-file">
                <input type="file" id="followingFile" class="custom-file-input" accept=".json">
                <label class="custom-file-label">Choose file</label>
            </div>
        </div>
        <div class="d-flex justify-content-center mt-4">
            <button class="btn btn-primary mr-2" onclick="processJsonUpload()">Check</button>
            <button class="btn btn-secondary" onclick="showZipUploadForm()">Switch to ZIP file upload</button>
        </div>
    `;
    setCustomFileInputListener('.custom-file-input');
}

function showZipUploadForm() {
    const inputSection = document.getElementById('inputSection');
    inputSection.innerHTML = `
        <div class="form-group">
            <label for="zipFile" class="font-weight-bold">Upload ZIP File</label>
            <div class="custom-file">
                <input type="file" id="zipFile" class="custom-file-input" accept=".zip">
                <label class="custom-file-label">Choose file</label>
            </div>
        </div>
        <div class="d-flex justify-content-center mt-4">
            <button class="btn btn-primary mr-2" onclick="processZipUpload()">Check</button>
            <button class="btn btn-secondary" onclick="showJsonUploadForm()">Switch to JSON file upload</button>
        </div>
    `;
    setCustomFileInputListener('.custom-file-input');
}

// Process Uploads
function processJsonUpload() {
    const followersFile = document.getElementById('followersFile').files[0];
    const followingFile = document.getElementById('followingFile').files[0];

    if (!followersFile || !followingFile) {
        return swal("Error", "Please upload both JSON files.", "error");
    }

    Promise.all([followersFile.text(), followingFile.text()])
        .then(([followersContent, followingContent]) => {
            const followersData = parseFollowersData(followersContent);
            const followingData = parseFollowingData(followingContent);
            findNotFollbackAccounts(followersData, followingData);
            renderNotFollbackTable();
        })
        .catch(() => swal("Error", "Failed to read JSON files.", "error"));
}

function processZipUpload() {
    const zipFile = document.getElementById('zipFile').files[0];
    if (!zipFile) return swal("Error", "Please upload a ZIP file.", "error");

    const jszip = new JSZip();
    jszip.loadAsync(zipFile)
        .then(zip => Promise.all([ 
            zip.file("connections/followers_and_following/followers_1.json").async("string"),
            zip.file("connections/followers_and_following/following.json").async("string")
        ]))
        .then(([followersContent, followingContent]) => {
            const followersData = parseFollowersData(followersContent);
            const followingData = parseFollowingData(followingContent);
            findNotFollbackAccounts(followersData, followingData);
            renderNotFollbackTable();
        })
        .catch(() => swal("Error", "Invalid ZIP file.", "error"));
}

// Data Processing
function parseFollowersData(json) {
    return JSON.parse(json).map(item => item.string_list_data.map(account => account.value)).flat();
}

function parseFollowingData(json) {
    return JSON.parse(json).relationships_following;
}

function findNotFollbackAccounts(followers, following) {
    notFollbackAccounts = following.flatMap(item =>
        item.string_list_data.filter(account => !followers.includes(account.value))
    );
    totalNotFollback = notFollbackAccounts.length;
}

// Rendering
function renderNotFollbackTable() {
    const outputSection = document.getElementById('outputSection');
    const inputSection = document.getElementById('inputSection');
    inputSection.style.display = 'none';
    outputSection.style.display = 'block';

    // Update total akun tidak follback
    document.getElementById('totalNotFollback').innerText = totalNotFollback;

    const sortOption = document.getElementById('sortOption').value;
    const sortOrder = document.getElementById('sortOrder').value;

    // Sort the accounts based on the selected option
    if (sortOption === 'accountName') {
        notFollbackAccounts.sort((a, b) => a.value.localeCompare(b.value));
    } else if (sortOption === 'date') {
        notFollbackAccounts.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }

    // Reverse if descending order is selected
    if (sortOrder === 'desc') {
        notFollbackAccounts.reverse();
    }

    // Render the sorted table
    const tableRows = notFollbackAccounts.map((account, index) => {
        const date = account.timestamp
            ? new Date(account.timestamp * 1000).toLocaleString()
            : 'N/A';
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${account.value}</td>
                <td><a href="${account.href}" target="_blank">${account.value}</a></td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('notFollbackOutput').innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover table-sm table-bordered">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Account Name</th>
                        <th>Profile Link</th>
                        <th>Date Following</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;
}

function copyNotFollbackAccounts() {
    const accountNames = notFollbackAccounts.map(account => account.value).join('\n');
    navigator.clipboard.writeText(accountNames).then(() => {
        swal("Copied!", "Account names have been copied to clipboard.", "success");
    }).catch(() => {
        swal("Error", "Failed to copy account names.", "error");
    });
}

// Reset
function resetForm() {
    // Kembalikan ke tampilan awal (ZIP upload)
    showZipUploadForm();

    // Reset global variables
    notFollbackAccounts = [];
    totalNotFollback = 0;

    // Reset jumlah akun yang tidak follback di tampilan
    document.getElementById('totalNotFollback').innerText = '0';

    // Sembunyikan output section dan tampilkan input section
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('outputSection').style.display = 'none';

    // Kosongkan hasil output
    document.getElementById('notFollbackOutput').innerHTML = '';
}
