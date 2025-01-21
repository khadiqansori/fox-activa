import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import JSZip from 'jszip';
window.JSZip = JSZip;
import Config from '../Config';

import 'datatables.net-select-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import 'datatables.net-buttons-bs4/css/buttons.bootstrap4.min.css';
import 'datatables.net';
import 'datatables.net-bs4';
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs4';
import 'jszip';
import 'pdfmake';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import 'datatables.net-buttons/js/buttons.colVis.mjs';

import { format } from "date-fns";

const CleanDate = (isoDate) => {
    let result

    if (isoDate) {
        result = format(new Date(isoDate), "yyyy-MM-dd");
    } else {
        result = "Butuh Konfirmasi"
    }

    return result
};

const Permissions = () => {
    DataTable.use(DT);

    const [data, setData] = useState([]);
    const fetchData = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`${Config.BaseUrl}/permissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const tableData = response.data.data.map((row) => [
                row.permission_name.toUpperCase(),
                row.user_name,
                row.status.toUpperCase(),
                CleanDate(row.start_date),
                row.length_leave,
                CleanDate(row.created_at),
                CleanDate(row.confirm_at),
                row.status == 'cancel' ? '' :
                `<div key=${row.id}>
                    <a href="/permissions/update/${row.id}" class="nav-link btn btn-warning btn-icon-split mb-3">
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-pen"></i>
                        </span>
                        <span class="text">Edit</span>
                    </a>
                    <button 
                        class="btn btn-secondary btn-icon-split cancel-button"
                        data-id="${row.id}"
                    >
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-ban"></i>
                        </span>
                        <span class="text">Cancel</span>
                    </button>
                </div>`,
            ]);

            setData(tableData);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = '/logout'
            }
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleCancel = async (id) => {
            const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan izin ini?");
            const token = localStorage.getItem("token");
            const payload = {
                id: parseInt(id),
                id_permission_type: 1, // Pastikan tipe izin sesuai kebutuhan
                note: "Dibatalkan oleh pengguna", // Catatan default
                status: "cancel", // Status diubah menjadi cancel
                start_date: "2025-01-20", // Placeholder untuk tanggal mulai
                end_date: "2025-01-20", // Placeholder untuk tanggal akhir
            };
    
            if (confirmCancel) {
                try {
                    await axios.put(`${Config.BaseUrl}/update-permission`, payload, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });
    
                    alert("Data berhasil dibatalkan!");
                    fetchData(); // Memperbarui data tabel setelah pembatalan
                } catch (error) {
                    console.error("Error canceling data:", error);
                    alert("Gagal membatalkan data.");
                }
            }
        };
    
        // Tambahkan event listener untuk tombol cancel
        const handleButtonClick = (e) => {
            const button = e.target.closest(".cancel-button");
            if (button) {
                const id = button.getAttribute("data-id");
                handleCancel(id);
            }
        };
    
        document.addEventListener("click", handleButtonClick);
    
        return () => {
            // Bersihkan event listener saat komponen di-unmount
            document.removeEventListener("click", handleButtonClick);
        };
    }, [data]);    

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Ajukan Izin / Cuti</h1>
            </div>

            <a href="/permissions/create" className="nav-link btn btn-primary btn-icon-split mb-3">
                <span className="icon text-white-50">
                    <i className="fas fa-fw fa-plus"></i>
                </span>
                <span className="text">Tambah Data</span>
            </a>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Data Ajuan Izin / Cuti</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <DataTable
                                    data={data}
                                    className="table table-bordered display"
                                    id="dataTable"
                                    width="100%"
                                    cellSpacing="0"
                                    options={{
                                        dom: 'Bfrtip',
                                        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th>Mengajukan</th>
                                            <th>Pengaju</th>
                                            <th>Status</th>
                                            <th>Tanggal Izin</th>
                                            <th>Jumlah Hari</th>
                                            <th>Tanggal Buat</th>
                                            <th>Tanggal Konfirmasi</th>
                                            <th className="nowrap">Aksi</th>
                                        </tr>
                                    </thead>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Permissions