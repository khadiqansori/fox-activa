import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import JSZip from 'jszip';
window.JSZip = JSZip;
import Config from '../Config';
import format from "date-fns";

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


const CleanDate = (isoDate) => {
    let result

    if (isoDate) {
        result = format(new Date(isoDate), "yyyy-MM-dd");
    } else {
        result = "Butuh Konfirmasi"
    }

    return result
};

const AllPermissions = () => {
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
                row.status == 'request' ?
                `<div key=${row.id}>
                    <button 
                        class="btn btn-success btn-icon-split confirm-button mb-3"
                        data-id='${JSON.stringify(row)}'
                    >
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-check"></i>
                        </span>
                        <span class="text">Terima</span>
                    </button>
                    <button 
                        class="btn btn-danger btn-icon-split decline-button"
                        data-id='${JSON.stringify(row)}'
                    >
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-ban"></i>
                        </span>
                        <span class="text">Tolak</span>
                    </button>
                </div>` : '',
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
        const handleCancel = async (row) => {
            const data = JSON.parse(row)
            const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan izin ini?");
            const token = localStorage.getItem("token");
            const payload = {
                id: parseInt(data.id),
                id_permission_type: 1, // Pastikan tipe izin sesuai kebutuhan
                note: data.note, // Catatan default
                status: "decline", // Status diubah menjadi cancel
                start_date: data.start_date,
                end_date: data.end_date,
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

        const handleConfirm = async (row) => {
            const data = JSON.parse(row)
            const confirmCancel = window.confirm("Apakah Anda yakin ingin konfirmasi izin ini?");
            const token = localStorage.getItem("token");
            const payload = {
                id: parseInt(data.id),
                id_permission_type: 1, // Pastikan tipe izin sesuai kebutuhan
                note: data.note, // Catatan default
                status: "confirm", // Status diubah menjadi cancel
                start_date: data.start_date,
                end_date: data.end_date,
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
            const declineButton = e.target.closest(".decline-button");
            if (declineButton) {
                const id = declineButton.getAttribute("data-id");
                handleCancel(id);
            }

            const confirmButton = e.target.closest(".confirm-button");
            if (confirmButton) {
                const id = confirmButton.getAttribute("data-id");
                handleConfirm(id);
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
                <h1 className="h3 mb-0 text-gray-800">Permintaan Izin / Cuti</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Data Permintaan Izin / Cuti</h6>
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
                                        ordering: false,
                                        buttons: [
                                            {
                                                extend: 'copy',
                                                exportOptions: {
                                                    columns: ':not(:last-child)', // Tidak menyertakan kolom terakhir (Aksi)
                                                },
                                            },
                                            {
                                                extend: 'csv',
                                                exportOptions: {
                                                    columns: ':not(:last-child)',
                                                },
                                            },
                                            {
                                                extend: 'excel',
                                                exportOptions: {
                                                    columns: ':not(:last-child)',
                                                },
                                            },
                                            {
                                                extend: 'pdf',
                                                exportOptions: {
                                                    columns: ':not(:last-child)',
                                                },
                                            },
                                            {
                                                extend: 'print',
                                                exportOptions: {
                                                    columns: ':not(:last-child)',
                                                },
                                            },
                                        ],
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

export default AllPermissions