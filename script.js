let notFollbackAccounts = []; // Variabel global untuk menyimpan akun not follback
let totalNotFollback = 0; // Variabel untuk menyimpan total akun not follback

// Update file name when user selects a file
document.querySelectorAll('.custom-file-input').forEach(input => {
    input.addEventListener('change', function () {
        const fileName = this.files[0] ? this.files[0].name : 'Choose file';
        const nextSibling = this.nextElementSibling;
        nextSibling.innerText = fileName;
    });
});

// Function to process and display the output
function checkNotFollback() {
    const zipFile = document.getElementById('zipFile').files[0];

    if (zipFile) {
        handleZipFile(zipFile);
    } else {
        swal("Error", "Please upload a ZIP file.", "error");
    }
}

function handleZipFile(zipFile) {
    const jszip = new JSZip();
    jszip.loadAsync(zipFile).then(zip => {
        const followersPath = "connections/followers_and_following/followers_1.json";
        const followingPath = "connections/followers_and_following/following.json";

        Promise.all([
            zip.file(followersPath).async("string"),
            zip.file(followingPath).async("string")
        ]).then(([followersContent, followingContent]) => {
            processJsonData(followersContent, followingContent);
        }).catch(() => {
            swal("Error", "Failed to read files from ZIP.", "error");
        });
    }).catch(() => {
        swal("Error", "Invalid ZIP file.", "error");
    });
}

function processJsonData(jsonFollowers, jsonFollowing) {
    try {
        const followersData = JSON.parse(jsonFollowers);
        const followingData = JSON.parse(jsonFollowing).relationships_following;

        const followerNames = followersData.map(item => 
            item.string_list_data.map(account => account.value)
        ).flat();

        notFollbackAccounts = [];
        followingData.forEach(item => {
            item.string_list_data.forEach(account => {
                if (!followerNames.includes(account.value)) {
                    notFollbackAccounts.push(account);
                }
            });
        });

        totalNotFollback = notFollbackAccounts.length;
        document.getElementById('totalNotFollback').innerText = totalNotFollback;

        // Hide input section and show output section
        document.getElementById('inputSection').style.display = 'none';
        document.getElementById('outputSection').style.display = 'block';

        displayNotFollbackAccounts();
    } catch {
        swal("Error", "Invalid JSON data.", "error");
    }
}

function displayNotFollbackAccounts() {
    const sortOption = document.getElementById('sortOption').value;
    const sortOrder = document.getElementById('sortOrder').value;

    if (sortOption === 'accountName') {
        notFollbackAccounts.sort((a, b) => a.value.localeCompare(b.value));
    } else if (sortOption === 'date') {
        notFollbackAccounts.sort((a, b) => a.timestamp - b.timestamp);
    }

    if (sortOrder === 'desc') {
        notFollbackAccounts.reverse();
    }

    let output = `<div class="table-responsive"><table class="table table-striped table-hover table-sm table-bordered"><thead><tr><th>No</th><th>Account Name</th><th>Profile Link</th><th>Date Following</th></tr></thead><tbody>`;
    notFollbackAccounts.forEach((account, index) => {
        const date = new Date(account.timestamp * 1000);
        output += `<tr>
            <td>${index + 1}</td>
            <td>${account.value}</td>
            <td><a href="${account.href}" target="_blank">${account.value}</a></td>
            <td>${date.toLocaleString()}</td>
        </tr>`;
    });
    output += `</tbody></table></div>`;
    document.getElementById('notFollbackOutput').innerHTML = output;
}

function copyNotFollbackAccounts() {
    const accountNames = notFollbackAccounts.map(account => account.value).join('\n');
    navigator.clipboard.writeText(accountNames).then(() => {
        swal("Copied!", "Account names have been copied to clipboard.", "success");
    }).catch(() => {
        swal("Error", "Failed to copy account names.", "error");
    });
}

function resetForm() {
    document.getElementById('zipFile').value = '';
    document.querySelector('.custom-file-label').innerText = 'Choose file';
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('outputSection').style.display = 'none';
    notFollbackAccounts = [];
    document.getElementById('notFollbackOutput').innerHTML = '';
}