import { useState, useEffect } from "react";
import axios from "axios";
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

const ExternalAssessments = () => {
    DataTable.use(DT);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [userPerformances, setUserPerformances] = useState([]);

    const token = localStorage.getItem('token');

    // Fetch users data from API
    const fetchUsers = async () => {
        const apiUrl = `${Config.BaseUrl}/users`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                const userData = response.data.data;
                const userPerformances = [];

                const exData = await fetchExternalAssessment();

                // Loop through each user and fetch their data
                for (let user of userData) {
                    const idUser = user.id;
                    let idExternalAssessment = 0;
                    let percentage = 0;

                    const getExData = exData.filter(task => task.id_user === idUser);
                    if (getExData.length > 0) {
                        idExternalAssessment = getExData[0].id
                        percentage = getExData[0].percentage;
                    }

                    // Tambahkan kolom aksi berdasarkan nilai externalPercentage
                    userPerformances.push({
                        name: user.name,
                        externalPercentage: percentage + '%',
                        action: percentage === 0 
                            ? `<a href="/external-assessments/create/${user.id}/${selectedYear}-${String(selectedMonth).padStart(2, '0')}" class="nav-link btn btn-primary btn-icon-split mb-3">
                                    <span class="icon text-white-50">
                                        <i class="fas fa-fw fa-plus"></i>
                                    </span>
                                    <span class="text">Input Nilai</span>
                                </a>` 
                            : `<a href="/external-assessments/update/${idExternalAssessment}" class="nav-link btn btn-warning btn-icon-split mb-3">
                                    <span class="icon text-white-50">
                                        <i class="fas fa-fw fa-pen"></i>
                                    </span>
                                    <span class="text">Edit</span>
                                </a>`,
                    });
                }

                setUserPerformances(userPerformances);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch External Assessment data
    const fetchExternalAssessment = async () => {
        const apiUrl = `${Config.BaseUrl}/external-assessments`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "date.like": `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                },
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            return [];
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [selectedYear, selectedMonth]);

    console.log(userPerformances);
    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Kinerja Eksternal Karyawan</h1>
            </div>

            <div className="row mb-3">
                <div className="col-2">
                    <label htmlFor="year" className="form-label">Pilih Tahun</label>
                    <select
                        id="year"
                        className="form-control"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {[...Array(3).keys()].map(offset => (
                            <option key={offset} value={currentYear - offset}>
                                {currentYear - offset}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-2">
                    <label htmlFor="month" className="form-label">Pilih Bulan</label>
                    <select
                        id="month"
                        className="form-control"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {[...Array(12).keys()].map(monthIndex => (
                            <option key={monthIndex} value={monthIndex + 1}>
                                {new Date(selectedYear, monthIndex).toLocaleString("id-ID", { month: "long" })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Data Kinerja Eksternal Karyawan</h6>
                        </div>
                        <div className="card-body">
                            <DataTable
                                className="table table-bordered display nowrap"
                                id="dataTable"
                                width="100%"
                                cellSpacing="0"
                                data={userPerformances}
                                options={{
                                    dom: 'Bfrtip',
                                    processing: true,
                                    paging: false,
                                    searching: true,
                                    ordering: true,
                                    columns: [
                                        { title: 'Nama Karyawan', data: 'name' },
                                        { title: 'Persentase', data: 'externalPercentage' },
                                        { title: 'Aksi', data: 'action', orderable: false, render: (data) => data },
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalAssessments;
