// Fungsi untuk memuat file header atau footer
function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not OK");
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => {
            console.error("Error loading component:", error);
        });
}

// Memuat header dan footer setelah halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header", "../template/header.html");
    loadComponent("sidebar", "../template/sidebar.html");
    loadComponent("topbar", "../template/topbar.html");
});
