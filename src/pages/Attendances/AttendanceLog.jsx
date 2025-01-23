import { useState, useEffect } from "react";
import axios from "axios";
import Config from '../Config';

function AttendanceLog() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [attendanceData, setAttendanceData] = useState([]);
    const [permissionData, setPermissionData] = useState([]);

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

    const days = Array.from({ length: daysInMonth }, (_, index) => {
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

        const attendanceStatus = clockIn !== "-" ? "Hadir" : "Tidak Hadir";

        return {
            date,
            formattedDate,
            dayName,
            isWeekend: isWeekend(date),
            clockIn,
            clockOut,
            isLate,
            permissionStatus,
            attendanceStatus,
        };
    });

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
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Clock In</th>
                                            <th>Clock Out</th>
                                            <th>Status Kehadiran</th>
                                            <th>Izin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {days.map(({ date, formattedDate, dayName, isWeekend, clockIn, clockOut, isLate, attendanceStatus, permissionStatus }) => (
                                            <tr key={date}>
                                                <td style={{ color: isWeekend ? "red" : "black" }}>
                                                    <b>{dayName}</b>, {formattedDate}
                                                </td>
                                                <td style={{color: isLate ? "red" : "black"}}>{clockIn}</td>
                                                <td>{clockOut}</td>
                                                <td style={{ color: attendanceStatus === "Tidak Hadir" ? "red" : "black" }}>
                                                    {attendanceStatus}
                                                </td>
                                                <td>{permissionStatus || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttendanceLog;
