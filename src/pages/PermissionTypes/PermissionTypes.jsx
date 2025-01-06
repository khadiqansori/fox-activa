import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import JSZip from 'jszip';
window.JSZip = JSZip;

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

const PermissionTypes = () => {
    DataTable.use(DT);

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:8989/permission-types", {
                headers: {
                    Authorization: `Bearer 023khjsdH7123j30-whjdf1-0sadkD2023jh43-0dfkvu123G712j0dfkj3`,
                },
            });

            const tableData = response.data.data.map((row) => [
                row.id,
                row.name.toUpperCase(),
                (row.is_reduce_leave ? 'Ya' : 'Tidak').toUpperCase(),
                `<div key=${row.id}>
                    <a href="/roles/update/${row.id}" class="nav-link btn btn-warning btn-icon-split mb-3">
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-pen"></i>
                        </span>
                        <span class="text">Edit</span>
                    </a>
                    <button 
                        class="btn btn-danger btn-icon-split delete-button"
                        data-id="${row.id}"
                    >
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-trash"></i>
                        </span>
                        <span class="text">Hapus</span>
                    </button>
                </div>`,
            ]);

            setData(tableData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleDelete = async (id) => {
            const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
            const token = localStorage.getItem('token');
            const data = {
                id: parseInt(id)
            }

            if (confirmDelete) {
                try {
                    await axios({
                        method: 'delete',
                        url: 'http://localhost:8989/delete-permission-type',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        data: data,
                    });
    
                    alert("Data berhasil dihapus!");
                    fetchData(); // Memperbarui data tabel setelah penghapusan
                } catch (error) {
                    console.error("Error deleting data:", error);
                    alert("Gagal menghapus data.");
                }
            }
        };
        
        // Tambahkan event listener untuk tombol delete
        const handleButtonClick = (e) => {
            const button = e.target.closest(".delete-button");
            if (button) {
                const id = button.getAttribute("data-id");
                handleDelete(id);
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
                <h1 className="h3 mb-0 text-gray-800">Jenis Izin</h1>
            </div>

            <a href="/permission-types/create" className="nav-link btn btn-primary btn-icon-split mb-3">
                <span className="icon text-white-50">
                    <i className="fas fa-fw fa-plus"></i>
                </span>
                <span className="text">Tambah Data</span>
            </a>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Data Jenis Izin</h6>
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
                                            <th>ID Izin</th>
                                            <th>Nama Izin</th>
                                            <th>Kurangi Cuti</th>
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

export default PermissionTypes