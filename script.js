function checkNotFollback() {
    const jsonFollowers = document.getElementById('followersInput').value;
    const jsonFollowing = document.getElementById('followingInput').value;
    const sortOption = document.getElementById('sortOption').value;  // Mendapatkan opsi sorting

    try {
        const followersData = JSON.parse(jsonFollowers);
        const followingData = JSON.parse(jsonFollowing).relationships_following;

        const followerNames = [];
        const notFollbackAccounts = [];

        // Kumpulkan semua nama dari followers
        followersData.forEach(item => {
            item.string_list_data.forEach(account => {
                followerNames.push(account.value);
            });
        });

        // Cek setiap following apakah ada di followers, jika tidak tambahkan ke daftar "Not Follback"
        followingData.forEach(item => {
            item.string_list_data.forEach(account => {
                if (!followerNames.includes(account.value)) {
                    notFollbackAccounts.push(account); // Simpan akun yang tidak mem-follow balik
                }
            });
        });

        // Sorting berdasarkan pilihan pengguna
        if (sortOption === 'accountName') {
            // Sort by account name (lexicographical order)
            notFollbackAccounts.sort((a, b) => a.value.localeCompare(b.value));
        } else if (sortOption === 'date') {
            // Sort by date (timestamp)
            notFollbackAccounts.sort((a, b) => a.timestamp - b.timestamp);
        }

        // Tampilkan hasil "Not Follback"
        const totalNotFollback = notFollbackAccounts.length;
        let output = `<h2>Not Follback List (${totalNotFollback})</h2>`;
        if (totalNotFollback > 0) {
            notFollbackAccounts.forEach(account => {
                const date = new Date(account.timestamp * 1000); // Konversi timestamp ke milidetik
                output += `<div class="card mb-3"><div class="card-body">`;
                output += `<h5 class="card-title">Account name: ${account.value}</h5>`;
                output += `<p class="card-text">Link: <a href="${account.href}" target="_blank">${account.href}</a></p>`;
                output += `<p class="card-text">Date: ${date.toLocaleString()}</p>`;
                output += `</div></div>`;
            });
        } else {
            output += `<p>Semua orang di following mem-follow balik.</p>`;
        }

        document.getElementById('notFollbackOutput').innerHTML = output;

    } catch (error) {
        swal("Error", "Invalid JSON data.", "error");
    }
}