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

const AllPerformances = () => {
    DataTable.use(DT);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [userPerformances, setUserPerformances] = useState([]);
    const [withPrioritys, setWithPrioritys] = useState([]);

    const token = localStorage.getItem('token');

    // Function to calculate the number of workdays in a month
    const calculateWorkdays = (year, month) => {
        let workdays = 0;
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workdays++;
            }
        }
        return workdays;
    };

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
                const withPrioritys = [];

                // Loop through each user and fetch their data
                for (let user of userData) {
                    const idUser = user.id;
                    const userPerformance = await getUserPerformance(idUser);
                    userPerformances.push({
                        name: user.name,
                        attendancePercentage: userPerformance.attendancePercentage,
                        taskPercentage: userPerformance.taskPercentage,
                        externalAssessment: userPerformance.externalAssessmentPercentage,
                    });

                    withPrioritys.push({
                        name: user.name,
                        attendancePercentage: (userPerformance.attendancePercentage/100*0.5).toFixed(2),
                        taskPercentage: (userPerformance.taskPercentage/100*0.3).toFixed(2),
                        externalAssessment: (userPerformance.externalAssessmentPercentage/100*0.2).toFixed(2),
                        total: ((userPerformance.attendancePercentage/100*0.5) + (userPerformance.taskPercentage/100*0.3) + (userPerformance.externalAssessmentPercentage/100*0.2)).toFixed(2),
                    });
                }

                // Mengurutkan berdasarkan total (descending)
                withPrioritys.sort((a, b) => b.total - a.total);

                // Menambahkan ranking
                withPrioritys.forEach((user, index) => {
                    user.rank = index + 1;
                });

                setUserPerformances(userPerformances);
                setWithPrioritys(withPrioritys)
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch user's attendance and task performance
    const getUserPerformance = async (idUser) => {
        let externalAssessmentPercentage = 0;

        const workdays = calculateWorkdays(selectedYear, selectedMonth);
        
        const attendanceData = await fetchAttendance(idUser);
        const permissionData = await fetchPermissions(idUser);
        const taskData = await fetchTask(idUser);
        const externalAssessment = await fetchExternalAssessment(idUser);

        let attendancePercentage = calculateAttendancePercentage(workdays, attendanceData, permissionData);
        let taskPercentage = calculateTaskPercentage(taskData);
        if (externalAssessment.length > 0) {
            externalAssessmentPercentage = externalAssessment[0].percentage;
        }

        // Randomize number 70 - 100 [Nanti di hapus]
        if (attendancePercentage == 0) {
            attendancePercentage = Math.round(Math.random() * (100 - 70 + 1)) + 70;
        }
        if (taskPercentage == 0) {
            taskPercentage = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
        }

        return {
            attendancePercentage,
            taskPercentage,
            externalAssessmentPercentage
        };
    };

    // Fetch attendance data
    const fetchAttendance = async (idUser) => {
        const apiUrl = `${Config.BaseUrl}/attendances`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "date.like": `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                    "id_user.eq": idUser,
                },
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            return [];
        }
    };

    // Fetch permission data from API
    const fetchPermissions = async (idUser) => {
        const apiUrl = `${Config.BaseUrl}/permissions`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "status.eq": "confirm",
                    "id_user.eq": idUser,
                },
            });

            if (response.data.success) {
                const permissions = response.data.data;
                const filteredPermissions = permissions.filter((permission) => {
                    const startDate = new Date(permission.start_date);
                    const endDate = new Date(permission.end_date);
                    return (
                        startDate.getFullYear() === selectedYear &&
                        startDate.getMonth() + 1 === selectedMonth &&
                        endDate.getFullYear() === selectedYear &&
                        endDate.getMonth() + 1 === selectedMonth
                    );
                });

                const totalLeaveDays = filteredPermissions.reduce(
                    (total, permission) => total + permission.length_leave,
                    0
                );

                return totalLeaveDays;
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
            return 0;
        }
    };

    // Fetch task data
    const fetchTask = async (idUser) => {
        const apiUrl = `${Config.BaseUrl}/tasks`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "id_user.eq": idUser,
                    "due_date.like": `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                },
            });
            return response.data.data.filter(task => task.id_user === idUser) || [];
        } catch (error) {
            console.error("Error fetching task data:", error);
            return [];
        }
    };

    // Fetch external assessment data
    const fetchExternalAssessment = async (idUser) => {
        const apiUrl = `${Config.BaseUrl}/external-assessments`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "id_user.eq": idUser,
                    "date.like": `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                },
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching task data:", error);
            return [];
        }
    };

    // Calculate attendance percentage
    const calculateAttendancePercentage = (workdays, attendanceData, permissionData) => {
        workdays = workdays - permissionData
        const totalMinutesWorkdays = workdays * 540; // Total minutes in workdays
        const daysPresent = [...new Set(attendanceData.filter(entry => entry.type === "clock_in").map(entry => entry.date))].length;
        const absentDays = workdays - daysPresent;
        const totalLateMinutes = attendanceData.filter(entry => entry.status === "late").reduce((sum, entry) => sum + entry.minute_late, 0);
        const totalEarlyMinutes = attendanceData.filter(entry => entry.status === "early").reduce((sum, entry) => sum + entry.minute_late, 0);

        const effectiveMinutes = daysPresent * 540 - totalLateMinutes + totalEarlyMinutes - absentDays * 540;
        return Math.max(0, Math.round((effectiveMinutes / totalMinutesWorkdays) * 100));
    };

    // Calculate task performance percentage
    const calculateTaskPercentage = (tasks) => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const lateTasks = tasks.filter(task => task.status === 'completed' && new Date(task.completed_at) > new Date(task.due_date)).length;
        const earlyTasks = tasks.filter(task => task.status === 'completed' && new Date(task.completed_at) < new Date(task.due_date)).length;
        const incompleteTasks = tasks.filter(task => task.status !== 'completed').length;

        const performance = completedTasks - (lateTasks * 0.5) - incompleteTasks + (earlyTasks * 0.5);
        let percentage = Math.max(0, Math.round((performance / totalTasks) * 100));

        if (percentage > 100 ) {
            percentage = 100;
        }
        if (performance == 0) {
            percentage = 0;
        }
        return percentage;
    };

    useEffect(() => {
        fetchUsers();
    }, [selectedYear, selectedMonth]);

    console.log(userPerformances)
    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Tinjauan Kinerja Karyawan</h1>
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
                        <a href="#collapseCardExample" className="d-block card-header py-3" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
                            <h6 className="m-0 font-weight-bold text-primary">Perhitungan AHP</h6>
                        </a>

                        <div className="collapse" id="collapseCardExample">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-6">
                                        <h5>Matriks Perbandingan Kinerja</h5>
                                        <table className="table table-bordered display">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Kinerja Internal</th>
                                                    <th>Kinerja Eksternal</th>
                                                    <th>Absensi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <th>Kinerja Internal</th>
                                                    <td>1</td>
                                                    <td>1,67</td>
                                                    <td>2,5</td>
                                                </tr>
                                                <tr>
                                                    <th>Kinerja Eksternal</th>
                                                    <td>0,6</td>
                                                    <td>1</td>
                                                    <td>1,5</td>
                                                </tr>
                                                <tr>
                                                    <th>Absensi</th>
                                                    <td>0,4</td>
                                                    <td>0,67</td>
                                                    <td>1</td>
                                                </tr>
                                                <tr>
                                                    <th>Total</th>
                                                    <th>2</th>
                                                    <th>3,33</th>
                                                    <th>5</th>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <h5>Intensitas Kepentingan : 5, 3, 2</h5>
                                    </div>

                                    <div className="col-6">
                                        <h5>Intensitas Kepentingan</h5>
                                        <table className="table table-bordered display">
                                            <thead>
                                                <tr>
                                                    <th>Intensitas Kepentingan</th>
                                                    <th>Definisi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td>Sama bagusnya dibanding dengan yang lain</td>
                                            </tr>
                                            <tr>
                                                <td>3</td>
                                                <td>Sedikit lebih bagus dibanding yang laing</td>
                                            </tr>
                                            <tr>
                                                <td>5</td>
                                                <td>Cukup bagus dibanding dengan yang lain</td>
                                            </tr>
                                            <tr>
                                                <td>7</td>
                                                <td>Sangat bagus dibanding dengan yang lain</td>
                                            </tr>
                                            <tr>
                                                <td>9</td>
                                                <td>Ekstrim bagus dibanding yang lain</td>
                                            </tr>
                                            <tr>
                                                <td>2, 4, 6, 8</td>
                                                <td>Nilai diantara dua penilaian yang berdekatan</td>
                                            </tr>
                                            <tr>
                                                <td>Resiprokal</td>
                                                <td>Jika elemen I memiliki salah satu angka di atas dibandingkan elem J, maka J memiliki nilai kebalikannya ketika dibanding I</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col-12">
                                        <h5>Matriks Nilai Kriteria</h5>
                                        <table className="table table-bordered display">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Kinerja Internal</th>
                                                    <th>Kinerja External</th>
                                                    <th>Absensi</th>
                                                    <th style={{background: "#F9CB9C", color: "black"}}>Jumlah</th>
                                                    <th style={{background: "#B7D7A8", color: "black"}}>Prioritas</th>
                                                    <th style={{background: "#FFF2CC", color: "black"}}>Eigen Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <th>Kinerja Internal</th>
                                                    <td>0,5</td>
                                                    <td>0,5</td>
                                                    <td>0,5</td>
                                                    <td style={{background: "#F9CB9C", color: "black"}}>1,5</td>
                                                    <td style={{background: "#B7D7A8", color: "black"}}>0,5</td>
                                                    <td style={{background: "#FFF2CC", color: "black"}}>1,5</td>
                                                </tr>
                                                <tr>    
                                                    <th>Kinerja External</th>
                                                    <td>0,3</td>
                                                    <td>0,3</td>
                                                    <td>0,3</td>
                                                    <td style={{background: "#F9CB9C", color: "black"}}>0,9</td>
                                                    <td style={{background: "#B7D7A8", color: "black"}}>0,3</td>
                                                    <td style={{background: "#FFF2CC", color: "black"}}>0,9</td>
                                                </tr>
                                                <tr>
                                                    <th>Absensi</th>
                                                    <td>0,2</td>
                                                    <td>0,2</td>
                                                    <td>0,2</td>
                                                    <td style={{background: "#F9CB9C", color: "black"}}>0,6</td>
                                                    <td style={{background: "#B7D7A8", color: "black"}}>0,2</td>
                                                    <td style={{background: "#FFF2CC", color: "black"}}>0,6</td>
                                                </tr>
                                                <tr>
                                                    <th>Total</th>
                                                    <th>1,00</th>
                                                    <th>1,00</th>
                                                    <th>1,00</th>
                                                    <th style={{background: "#F9CB9C", color: "black"}}>3,00</th>
                                                    <th style={{background: "#B7D7A8", color: "black"}}>1,00</th>
                                                    <th style={{background: "#FFF2CC", color: "black"}}>3,0</th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-3">
                                        <table className="table table-bordered display">
                                            <tr>
                                                <th style={{background: "#EA9999", color: "black"}}>CI</th>
                                                <td>0</td>
                                            </tr>
                                            <tr>
                                                <th style={{background: "#EA9999", color: "black"}}>RI</th>
                                                <td>0,58</td>
                                            </tr>
                                            <tr>
                                                <th style={{background: "#EA9999", color: "black"}}>CR</th>
                                                <td>0</td>
                                            </tr>
                                        </table>

                                        Data: <b>Konsisten</b>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Data Kinerja Karyawan</h6>
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
                                    paging: true,
                                    searching: true,
                                    ordering: true,
                                    columns: [
                                        { title: 'Nama Karyawan', data: 'name' },
                                        { title: 'Persentase Kehadiran', data: 'attendancePercentage' },
                                        { title: 'Persentase Kinerja', data: 'taskPercentage' },
                                        { title: 'Persentase Kinerja Eksternal', data: 'externalAssessment' },
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Kalkulasi Dengan Data Prioritas</h6>
                        </div>
                        <div className="card-body">
                            <DataTable
                                className="table table-bordered display"
                                id="dataTable"
                                width="100%"
                                cellSpacing="0"
                                data={withPrioritys}
                                options={{
                                    dom: 'Bfrtip',
                                    processing: true,
                                    paging: true,
                                    searching: true,
                                    ordering: true,
                                    columns: [
                                        { title: 'Urutan', data: 'rank' },
                                        { title: 'Nama Karyawan', data: 'name' },
                                        { title: 'Persentase Kehadiran', data: 'attendancePercentage' },
                                        { title: 'Persentase Kinerja', data: 'taskPercentage' },
                                        { title: 'Persentase Kinerja Eksternal', data: 'externalAssessment' },
                                        { title: 'Total', data: 'total' },
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

export default AllPerformances;
