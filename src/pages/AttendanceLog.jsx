import { useState, useEffect } from "react";
import axios from "axios";

function AttendanceLog() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Bulan dimulai dari 0, jadi tambahkan 1

    // Mendapatkan jumlah hari dalam bulan
    const daysInMonth = new Date(year, month, 0).getDate();

    // Array nama hari dalam bahasa Indonesia
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // Fungsi untuk menambahkan angka 0 di depan jika kurang dari 10
    const formatTwoDigits = (number) => number.toString().padStart(2, "0");

    // Fungsi untuk menentukan apakah hari adalah Sabtu atau Minggu
    const isWeekend = (day) => {
        const date = new Date(year, month - 1, day); // month - 1 karena bulan di JS berbasis 0
        const dayOfWeek = date.getDay();
        return dayOfWeek === 6 || dayOfWeek === 0; // 6 = Sabtu, 0 = Minggu
    };

    const [data, setData] = useState([]);
    const fetchData = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get("http://localhost:8989/attendances", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Generate data untuk setiap hari
    const days = Array.from({ length: daysInMonth }, (_, index) => {
        const date = index + 1;
        const formattedDate = `${formatTwoDigits(date)}-${formatTwoDigits(month)}-${year}`;
        const dayName = dayNames[new Date(year, month - 1, date).getDay()];
        
        const dateFormat = `${year}-${formatTwoDigits(month)}-${formatTwoDigits(date)}`;
        let clockIn = "-"
        let clockOut = "-"
        let isLate = false

        {data.map((item) => {
            if (item.date == dateFormat) {
                if (item.type == "clock_in") {
                    clockIn = item.time

                    if (item.minute_late > 0) {
                        isLate = true
                    }
                } else if (item.type == "clock_out") {
                    clockOut = item.time
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
            isLate
        };
    });

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Log Kehadiran</h1>
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
        
        // <table border="1" style={{ width: "100%", textAlign: "center" }}>
        //     <thead>
        //         <tr>
        //         <th>Tanggal</th>
        //         <th>Hari</th>
        //         </tr>
        //     </thead>
        //     <tbody>
        //         {days.map(({ date, dayName, isWeekend }) => (
        //         <tr
        //             key={date}
        //             style={{
            //             backgroundColor: isWeekend ? "red" : "white",
            //             color: isWeekend ? "white" : "black",
        //             }}
        //         >
        //             <td>{date}</td>
        //             <td>{dayName}</td>
        //         </tr>
        //         ))}
        //     </tbody>
        // </table>
    );
}

export default AttendanceLog