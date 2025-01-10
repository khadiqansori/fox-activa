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

const TaskManagement = () => {
    DataTable.use(DT);

    const [data, setData] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${Config.BaseUrl}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const filteredData = response.data.data.filter((row) => 
                statusFilter === "all" || row.status === statusFilter
            );

            const tableData = filteredData.map((row) => [
                `<span class="${
                    row.status === "completed" 
                        ? "text-success" 
                        : row.status === "in_review" 
                        ? "text-warning" 
                        : row.status === "in_progress" 
                        ? "text-danger" 
                        : row.status === "open" 
                        ? "text-dark" 
                        : ""
                    }">
                    ${row.status.replace(/_/g, " ").toUpperCase()}
                </span>`,
                row.title,
                row.assign_name,
                row.priority.toUpperCase(),
                row.due_date,
                `<div key=${row.id}>
                    <a href="/task-management/update/${row.id}" class="nav-link btn btn-warning btn-icon-split mb-3">
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
    }, [statusFilter]);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Manajemen Pekerjaan</h1>
            </div>

            <a href="/task-management/create" className="nav-link btn btn-primary btn-icon-split mb-3">
                <span className="icon text-white-50">
                    <i className="fas fa-fw fa-plus"></i>
                </span>
                <span className="text">Tambah Data</span>
            </a>

            <div className="row">
                <div className="col-4 mb-3">
                    <label htmlFor="statusFilter" className="form-label">Filter Status</label>
                    <select
                        id="statusFilter"
                        className="form-control"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Semua</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Data Pekerjaan</h6>
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
                                            <th>Status</th>
                                            <th>Judul Tugas</th>
                                            <th>Penanggung Jawab</th>
                                            <th>Prioritas</th>
                                            <th>Tenggat Waktu</th>
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
    );
};

export default TaskManagement;