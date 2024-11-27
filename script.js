let notFollbackAccounts = []; // Variabel global untuk menyimpan akun not follback
let totalNotFollback = 0; // Variabel untuk menyimpan total akun not follback

document.querySelectorAll('.custom-file-input').forEach(input => {
    input.addEventListener('change', function () {
        const fileName = this.files[0] ? this.files[0].name : 'Choose file';
        const nextSibling = this.nextElementSibling;
        nextSibling.innerText = fileName;
    });
});


function checkNotFollback() {
    const followersFile = document.getElementById('followersFile').files[0];
    const followingFile = document.getElementById('followingFile').files[0];

    // Pengecekan apakah file diupload
    if (!followersFile || !followingFile) {
        swal("Error", "Both JSON files must be uploaded.", "error");
        return;
    }

    const reader1 = new FileReader();
    const reader2 = new FileReader();

    reader1.onload = function (event) {
        const jsonFollowers = event.target.result;

        reader2.onload = function (event) {
            const jsonFollowing = event.target.result;

            try {
                const followersData = JSON.parse(jsonFollowers);
                const followingData = JSON.parse(jsonFollowing).relationships_following;

                const followerNames = [];

                // Kumpulkan semua nama dari followers
                followersData.forEach(item => {
                    item.string_list_data.forEach(account => {
                        followerNames.push(account.value);
                    });
                });

                // Cek setiap following apakah ada di followers, jika tidak tambahkan ke daftar "Not Follback"
                notFollbackAccounts = []; // Reset array notFollbackAccounts setiap kali fungsi dipanggil
                followingData.forEach(item => {
                    item.string_list_data.forEach(account => {
                        if (!followerNames.includes(account.value)) {
                            notFollbackAccounts.push(account); // Simpan akun yang tidak mem-follow balik
                        }
                    });
                });

                totalNotFollback = notFollbackAccounts.length; // Simpan total not follback
                displayNotFollbackAccounts(); // Panggil fungsi untuk menampilkan hasil

                // Tampilkan dropdown sorting
                document.getElementById('sorting').style.display = 'block';
                document.getElementById('sortingOptions').style.display = 'block';
                document.getElementById('sortOrderOptions').style.display = 'block';

            } catch (error) {
                swal("Error", "Invalid JSON data.", "error");
            }
        };

        reader2.readAsText(followingFile); // Membaca file following setelah followers selesai dibaca
    };

    reader1.readAsText(followersFile); // Membaca file followers
}

function displayNotFollbackAccounts() {
    const sortOption = document.getElementById('sortOption').value;  // Mendapatkan opsi sorting
    const sortOrder = document.getElementById('sortOrder').value;    // Mendapatkan urutan sorting (asc/desc)

    // Sorting berdasarkan pilihan pengguna
    if (sortOption === 'accountName') {
        notFollbackAccounts.sort((a, b) => a.value.localeCompare(b.value));
    } else if (sortOption === 'date') {
        notFollbackAccounts.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Jika sortOrder adalah 'desc', maka reverse array
    if (sortOrder === 'desc') {
        notFollbackAccounts.reverse();
    }

    // Tampilkan hasil "Not Follback" dalam tabel
    let output = `<div class="d-flex justify-content-between align-items-center mb-3">`;
    output += `<h2>Not Follback List: ${totalNotFollback}</h2>`;
    if (totalNotFollback > 0) {
        output += `<button id="copyButton" class="btn btn-secondary" onclick="copyNotFollbackAccounts()">Copy</button>`;
    }
    output += `</div>`;

    if (totalNotFollback > 0) {
        // Membuat tabel dengan header
        output += `<div class="table-responsive"> <table class="table table-bordered table-hover rounded-lg table-sm">
                        <thead class="bg-primary text-white">
                            <tr>
                                <th scope="col">No</th>
                                <th scope="col">Account Name</th>
                                <th scope="col">Profile Link</th>
                                <th scope="col">Date Following</th> <!-- Hanya tampil di desktop -->
                            </tr>
                        </thead>
                        <tbody>
                            ${notFollbackAccounts
                                .map((account, index) => {
                                    const date = new Date(account.timestamp * 1000).toLocaleString(); // Konversi timestamp
                                    return `<tr>
                                        <td>${index + 1}</td>
                                        <td>${account.value}</td>
                                        <td><a href="${account.href}" target="_blank">${account.value}</a></td>
                                        <td>${date}</td> <!-- Hanya tampil di desktop -->
                                    </tr>`;
                                })
                                .join("")}
                        </tbody>
                    </table></div>`;
        //End of table
    } else {
        output += `<p>Everyone you are following follows you back.</p>`;
        document.getElementById('copyButton').style.display = 'none'; // Sembunyikan tombol copy
    }

    document.getElementById('notFollbackOutput').innerHTML = output;
}



function copyNotFollbackAccounts() {
    const accountNames = notFollbackAccounts.map(account => account.value).join('\n'); // Ambil semua nama akun
    navigator.clipboard.writeText(accountNames).then(() => {
        swal("Copied!", "Account names have been copied to clipboard.", "success"); // Notifikasi sukses
    }).catch(err => {
        swal("Error", "Failed to copy account names.", "error"); // Notifikasi gagal
    });
}

// Event listeners untuk sort option dan sort order
document.getElementById('sortOption').addEventListener('change', displayNotFollbackAccounts);
document.getElementById('sortOrder').addEventListener('change', displayNotFollbackAccounts);