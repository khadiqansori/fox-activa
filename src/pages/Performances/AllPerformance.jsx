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

                // Loop through each user and fetch their data
                for (let user of userData) {
                    const idUser = user.id;
                    const userPerformance = await getUserPerformance(idUser);
                    userPerformances.push({
                        name: user.name,
                        attendancePercentage: userPerformance.attendancePercentage,
                        taskPercentage: userPerformance.taskPercentage,
                    });
                }

                setUserPerformances(userPerformances);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch user's attendance and task performance
    const getUserPerformance = async (idUser) => {
        const workdays = calculateWorkdays(selectedYear, selectedMonth);
        
        const attendanceData = await fetchAttendance(idUser);
        const taskData = await fetchTask(idUser);

        const attendancePercentage = calculateAttendancePercentage(workdays, attendanceData);
        const taskPercentage = calculateTaskPercentage(taskData);

        return {
            attendancePercentage,
            taskPercentage,
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

    // Fetch task data
    const fetchTask = async (idUser) => {
        const apiUrl = `${Config.BaseUrl}/tasks`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "assign_to.eq": idUser,
                    "due_date.like": `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                },
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching task data:", error);
            return [];
        }
    };

    // Calculate attendance percentage
    const calculateAttendancePercentage = (workdays, attendanceData) => {
        const totalMinutesWorkdays = workdays * 540; // Total minutes in workdays
        const daysPresent = [...new Set(attendanceData.filter(entry => entry.type === "clock_in").map(entry => entry.date))].length;
        const totalLateMinutes = attendanceData.filter(entry => entry.status === "late").reduce((sum, entry) => sum + entry.minute_late, 0);
        const totalEarlyMinutes = attendanceData.filter(entry => entry.status === "early").reduce((sum, entry) => sum + entry.minute_late, 0);

        const effectiveMinutes = (daysPresent * 540) - totalLateMinutes - totalEarlyMinutes;
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
        console.log(performance / totalTasks)

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
                            <h6 className="m-0 font-weight-bold text-primary">Data Kalkulasi Dengan Data</h6>
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
