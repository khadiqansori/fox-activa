function TimeDisplay() {
    const d = new Date();
    let hour = d.getHours();
    let result = 'Pagi';

    if (hour >= 5 && hour < 12) {
        result = 'Pagi'
    } else if (hour >= 12 && hour < 16) {
        result = 'Siang'
    } else if (hour >= 16 && hour < 19) {
        result = 'Sore'
    } else {
        result = 'Malam'
    }

    return (
        <h5 className="h5 mb-1 font-weight-bold text-gray-800">Selamat {result}, Khadiq Ansori</h5>
    );
}

function DateDisplay() {
    const sekarang = new Date();

    // Array untuk nama hari dan bulan
    const hariNama = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulanNama = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    // Mendapatkan nilai hari, tanggal, bulan, dan tahun
    const hari = hariNama[sekarang.getDay()];
    const tanggal = sekarang.getDate();
    const bulan = bulanNama[sekarang.getMonth()];
    const tahun = sekarang.getFullYear();

    return (
        <h4 className="small font-weight-bold">Hari ini, {hari} {tanggal} {bulan} {tahun}</h4>
    );
}

function Topbar() {
    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                <i className="fa fa-bars"></i>
            </button>

            <div>
                <TimeDisplay />
                <DateDisplay />
            </div>

            <ul className="navbar-nav ml-auto">
                <div className="topbar-divider d-none d-sm-block"></div>

                <li className="nav-item dropdown no-arrow">
                    <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span className="mr-2 d-none d-lg-inline text-gray-600 small">Khadiq Ansori</span>
                        <img className="img-profile rounded-circle" src="../src/assets/img/undraw_profile.svg" />
                    </a>
                    <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                        aria-labelledby="userDropdown">
                        <a className="dropdown-item" href="#">
                            <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                            Profile
                        </a>
                        <a className="dropdown-item" href="#">
                            <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                            Settings
                        </a>
                        <a className="dropdown-item" href="#">
                            <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                            Activity Log
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal">
                            <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                            Logout
                        </a>
                    </div>
                </li>
            </ul>
        </nav>
    )
}

export default Topbar