import { NavLink } from "react-router-dom"

const Master = () => {
    return (
        <>
            <div className="sidebar-heading">Master</div>

            <li className="nav-item">
                <NavLink className="nav-link" to="/employees">
                    <i className="fas fa-fw fa-address-card"></i>
                    <span>Karyawan</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/roles">
                    <i className="fas fa-fw fa-user-tie"></i>
                    <span>Jabatan</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/permission-types">
                    <i className="fas fa-fw fa-clipboard-list"></i>
                    <span>Jenis Izin / Cuti</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/list-permissions">
                    <i className="fas fa-fw fa-clipboard-list"></i>
                    <span>Permintaan Izin / Cuti</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/external-assesments">
                    <i className="fas fa-fw fa-clipboard-list"></i>
                    <span>Kinerja Eks. Karyawan</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/all-performances">
                    <i className="fas fa-fw fa-clipboard-list"></i>
                    <span>Tinjauan Kinerja Karyawan</span></NavLink>
            </li>

            <hr className="sidebar-divider" />
        </>
    )
}

const Sidebar = () => {
    const userInfo = localStorage.getItem('user_info');
    const role = JSON.parse(userInfo).role

    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/">
                <div className="sidebar-brand-icon rotate-n-15">
                    <i className="fas fa-clipboard"></i>
                </div>
                <div className="sidebar-brand-text mx-3">Fox Activa</div>
            </a>

            <hr className="sidebar-divider my-0" />

            <li className="nav-item">
                <NavLink className="nav-link" to="/">
                    <i className="fas fa-fw fa-home"></i>
                <span>Beranda</span></NavLink>
            </li>

            <hr className="sidebar-divider" />

            {role?.includes("hr") ? <Master /> : null}

            <div className="sidebar-heading">Aplikasi</div>

            <li className="nav-item">
                <NavLink className="nav-link" to="/attendances">
                    <i className="fas fa-fw fa-clipboard"></i>
                    <span>Absensi</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/attendance-logs">
                    <i className="fas fa-fw fa-business-time"></i>
                    <span>Log Kehadiran Saya</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/permissions">
                    <i className="fas fa-fw fa-clipboard-list"></i>
                    <span>Ajukan Izin / Cuti</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/task-management">
                    <i className="fas fa-fw fa-calendar-check"></i>
                    <span>Manajemen Pekerjaan</span></NavLink>
            </li>

            <li className="nav-item">
                <NavLink className="nav-link" to="/performances">
                    <i className="fas fa-fw fa-chart-area"></i>
                    <span>Tinjauan Kinerja</span></NavLink>
            </li>
        </ul>
    )
}

export default Sidebar