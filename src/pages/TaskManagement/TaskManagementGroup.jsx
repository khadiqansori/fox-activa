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

const TaskManagementGroup = () => {
    DataTable.use(DT);

    // const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [inReviewTasks, setInReviewTasks] = useState([]);
    const [inProgressTasks, setInProgressTasks] = useState([]);
    const [openTasks, setOpenTasks] = useState([]);

    // Fetch data from the API
    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
    
        try {
            const response = await axios.get(`${Config.BaseUrl}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const datas = response.data.data;
    
            // Filter data berdasarkan status
            setCompletedTasks(datas.filter((data) => data.status === "completed"));
            setInReviewTasks(datas.filter((data) => data.status === "in_review"));
            setInProgressTasks(datas.filter((data) => data.status === "in_progress"));
            setOpenTasks(datas.filter((data) => data.status === "open"));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const columns = [
        { title: "Status", data: "status" },
        { title: "Title", data: "title" },
        { title: "Assign To", data: "assign_to" },
        { title: "Priority", data: "priority" },
        { title: "Due Date", data: "due_date" },
        {
            title: "Aksi",
            data: null,
            render: (data) => `
                <div key=${data.id}>
                    <a href="/roles/update/${data.id}" class="nav-link btn btn-warning btn-icon-split mb-3">
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-pen"></i>
                        </span>
                        <span class="text">Edit</span>
                    </a>
                    <button 
                        class="btn btn-danger btn-icon-split delete-button"
                        data-id="${data.id}"
                    >
                        <span class="icon text-white-50">
                            <i class="fas fa-fw fa-trash"></i>
                        </span>
                        <span class="text">Hapus</span>
                    </button>
                </div>
            `,
        },
    ];

    useEffect(() => {
        fetchTasks();
    }, []);

    console.log(openTasks)

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Management Pekerjaan</h1>
            </div>

            {/* Tugas Selesai */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div
                            className="card-header py-3 d-flex flex-row align-items-center justify-content-between bg-success"
                            data-toggle="collapse"
                            data-target="#completedCard"
                            aria-expanded="false"
                            aria-controls="completedCard"
                        >
                            <h6 className="m-0 font-weight-bold text-light">Tugas Selesai</h6>
                        </div>
                        <div id="completedCard" className="card-body collapse">
                            <div className="table-responsive">
                                <DataTable
                                    data={completedTasks}
                                    columns={columns}
                                    className="table table-bordered display"
                                    id="dataTable"
                                    width="100%"
                                    cellSpacing="0"
                                    options={{
                                        dom: 'Bfrtip',
                                        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dalam Proses Peninjauan */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between bg-warning">
                            <h6 className="m-0 font-weight-bold text-light">Dalam Proses Peninjauan</h6>
                        </div>
                        <div id="inReviewCard" className="card-body">
                            <div className="table-responsive">
                            <DataTable
                                    data={inReviewTasks}
                                    columns={columns}
                                    className="table table-bordered display"
                                    id="dataTable"
                                    width="100%"
                                    cellSpacing="0"
                                    options={{
                                        dom: 'Bfrtip',
                                        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dalam Proses Pengerjaan */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between bg-danger">
                            <h6 className="m-0 font-weight-bold text-light">Dalam Proses Pengerjaan</h6>
                        </div>
                        <div id="inProgressCard" className="card-body">
                        <div className="table-responsive">
                        <DataTable
                                    data={inProgressTasks}
                                    columns={columns}
                                    className="table table-bordered display"
                                    id="dataTable"
                                    width="100%"
                                    cellSpacing="0"
                                    options={{
                                        dom: 'Bfrtip',
                                        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tugas Terbuka */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between bg-light">
                            <h6 className="m-0 font-weight-bold text-dark">Tugas Terbuka</h6>
                        </div>
                        <div id="openCard" className="card-body">
                            <div className="table-responsive">
                            <DataTable
                                    data={openTasks}
                                    columns={columns}
                                    className="table table-bordered display"
                                    id="dataTable"
                                    width="100%"
                                    cellSpacing="0"
                                    options={{
                                        dom: 'Bfrtip',
                                        buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskManagementGroup;
