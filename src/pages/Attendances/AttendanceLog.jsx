import { useState, useEffect } from "react";
import axios from "axios";
import Config from '../Config';

function AttendanceLog() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // Bulan dimulai dari 0, jadi tambahkan 1

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [data, setData] = useState([]);

    // Mendapatkan jumlah hari dalam bulan
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    // Array nama hari dalam bahasa Indonesia
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // Fungsi untuk menambahkan angka 0 di depan jika kurang dari 10
    const formatTwoDigits = (number) => number.toString().padStart(2, "0");

    // Fungsi untuk menentukan apakah hari adalah Sabtu atau Minggu
    const isWeekend = (day) => {
        const date = new Date(selectedYear, selectedMonth - 1, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 6 || dayOfWeek === 0; // 6 = Sabtu, 0 = Minggu
    };

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await axios.get(`${Config.BaseUrl}/attendances`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "date.gte": `${selectedYear}-${selectedMonth}-01`
                },
            });
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedYear, selectedMonth]);

    // Generate data untuk setiap hari
    const days = Array.from({ length: daysInMonth }, (_, index) => {
        const date = index + 1;
        const formattedDate = `${formatTwoDigits(date)}-${formatTwoDigits(selectedMonth)}-${selectedYear}`;
        const dayName = dayNames[new Date(selectedYear, selectedMonth - 1, date).getDay()];

        const dateFormat = `${selectedYear}-${formatTwoDigits(selectedMonth)}-${formatTwoDigits(date)}`;
        let clockIn = "-"
        let clockOut = "-"
        let isLate = false

        {data.map((item) => {
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
        })}

        return {
            date,
            formattedDate,
            dayName,
            isWeekend: isWeekend(date),
            clockIn,
            clockOut,
            isLate,
        };
    });

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Log Kehadiran</h1>
            </div>

            {/* Filter Tahun dan Bulan */}
            <div className="row mb-3">
                <div className="col-2">
                    <label htmlFor="year" className="form-label">Pilih Tahun</label>
                    <select
                        id="year"
                        className="form-control"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {/* Bisa dinamiskan dengan range tahun tertentu */}
                        <option value={currentYear}>{currentYear}</option>
                        <option value={currentYear - 1}>{currentYear - 1}</option>
                        <option value={currentYear - 2}>{currentYear - 2}</option>
                        {/* Tambahkan lebih banyak tahun jika diperlukan */}
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
                        {/* Dropdown bulan */}
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
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {days.map(({ date, formattedDate, dayName, isWeekend, clockIn, clockOut, isLate }) => (
                                            <tr key={date}>
                                                <td
                                                    style={{
                                                        color: isWeekend ? "red" : "black",
                                                    }}
                                                ><b>{dayName}</b>, {formattedDate}</td>
                                                <td
                                                    style={{
                                                        color: isLate ? "red" : "black"
                                                    }}
                                                >{clockIn}</td>
                                                <td>{clockOut}</td>
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
