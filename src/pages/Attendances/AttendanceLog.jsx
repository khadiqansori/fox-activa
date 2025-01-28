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

function AttendanceLog() {
    DataTable.use(DT);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [attendanceData, setAttendanceData] = useState([]);
    const [permissionData, setPermissionData] = useState([]);
    const [data, setData] = useState([]);

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const formatTwoDigits = (number) => number.toString().padStart(2, "0");

    const isWeekend = (day) => {
        const date = new Date(selectedYear, selectedMonth - 1, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 6 || dayOfWeek === 0;
    };

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('user_info'));

        try {
            const attendanceResponse = await axios.get(`${Config.BaseUrl}/attendances`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "date.gte": `${selectedYear}-${selectedMonth}-01`,
                    "id_user.eq": userInfo.id
                },
            });

            const permissionResponse = await axios.get(`${Config.BaseUrl}/permissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "status.eq": "confirm",
                    "id_user.eq": userInfo.id
                }
            });

            setAttendanceData(attendanceResponse.data.data);
            setPermissionData(permissionResponse.data.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = '/logout';
            }
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        const tableData = Array.from({ length: daysInMonth }, (_, index) => {
            const date = index + 1;
            const formattedDate = `${formatTwoDigits(date)}-${formatTwoDigits(selectedMonth)}-${selectedYear}`;
            const dayName = dayNames[new Date(selectedYear, selectedMonth - 1, date).getDay()];
            const dateFormat = `${selectedYear}-${formatTwoDigits(selectedMonth)}-${formatTwoDigits(date)}`;

            let clockIn = "-";
            let clockOut = "-";
            let isLate = false;
            let permissionStatus = null;

            // Check attendance data
            attendanceData.forEach((item) => {
                if (item.date === dateFormat) {
                    if (item.type === "clock_in") {
                        clockIn = item.time;
                        if (item.minute_late > 0) {
                            isLate = true;
                        }
                    } else if (item.type === "clock_out") {
                        clockOut = item.time;
                    }
                }
            });

            // Check permission data
            permissionData.forEach((item) => {
                if (item.start_date <= `${dateFormat}T23:59:59Z` && item.end_date >= `${dateFormat}T00:00:00Z`) {
                    permissionStatus = item.permission_name;
                }
            });

            const attendanceStatus = isWeekend(date) ? "Libur" : clockIn !== "-" ? "Hadir" : "Tidak Hadir";


            return [
                `<span class="${isWeekend(date) ? "text-danger" : ""}">
                    <b>${dayName}</b>, ${formattedDate}
                </span>`,
                `<span class="${isLate ? "text-danger" : ""}">
                    ${clockIn}
                </span>`,
                clockOut,
                `<span class="${['Tidak Hadir', 'Libur'].includes(attendanceStatus) ? "text-danger" : ""}">
                    ${attendanceStatus}
                </span>`,
                permissionStatus || "-",
            ];
        });

        setData(tableData);
    }, [attendanceData, permissionData, daysInMonth, selectedYear, selectedMonth]);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Log Kehadiran</h1>
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
                        <option value={currentYear}>{currentYear}</option>
                        <option value={currentYear - 1}>{currentYear - 1}</option>
                        <option value={currentYear - 2}>{currentYear - 2}</option>
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
                        {[...Array(12).keys()].map((monthIndex) => (
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
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Data Log Kehadiran</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <DataTable
                                    className="table table-bordered display nowrap"
                                    id="dataTable"
                                    width="100%"
                                    cellSpacing="0"
                                    data={data}
                                    options={{
                                        dom: 'Bfrtip',
                                        paging: false,
                                        scrollX: true,
                                        ordering: false,
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Clock In</th>
                                            <th>Clock Out</th>
                                            <th>Status Kehadiran</th>
                                            <th>Izin</th>
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
}

export default AttendanceLog;
