import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Config from '../Config';

const Attendances = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const hour = today.getHours();
    const minute = today.getMinutes();
    const second = today.getSeconds();
    const todayName = new Date().toLocaleDateString("id-ID", { weekday: "long" });
    const currentMonth = new Date().toLocaleDateString("id-ID", { month: "long" });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const btnClockIn = useRef(null);
    const btnClockOut = useRef(null);

    useEffect(() => {
        // Dapatkan lokasi saat ini menggunakan Geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting location", error);
                }
            );
        }

        // Buat interval untuk memperbarui waktu setiap detik
        const timer = setInterval(() => {
            setCurrentTime(today);

            // if (hour > 18 || (hour === 18 && minute > 0)) {
            //     if (btnClockOut.current) {
            //         btnClockOut.current.disabled = false;
            //     }
            // } else {
            //     if (btnClockOut.current) {
            //         btnClockOut.current.disabled = true;
            //     }
            // }
        }, 1000);

        // Bersihkan interval saat komponen di-unmount
        return () => clearInterval(timer);
    }, [today]);

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
    const fetchData = async (year, month, day) => {
        const token = localStorage.getItem('token');
        const dateFormat = `${year}-${formatTwoDigits(month)}-${formatTwoDigits(day)}`;

        try {
            const response = await axios.get(`${Config.BaseUrl}/attendances?date.eq=${dateFormat}` , {
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
        fetchData(year, month, day);
    }, [year, month, day]);

    const handleClockIn = async () => {
        const token = localStorage.getItem('token');

        // Format waktu dalam format "yyyy-mm-dd HH:MM:ss"
        const time = `${year}-${formatTwoDigits(month)}-${formatTwoDigits(day)} ${formatTwoDigits(hour)}:${formatTwoDigits(minute)}:${formatTwoDigits(second)}`;

        try {
            await axios.post(`${Config.BaseUrl}/create-attendance`, {
                type: 'clock_in',
                time: time,
                latitude: latitude,
                longitude: longitude,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            window.location.href = '/attendances';
        } catch (error) {
            console.error("Error clocking in:", error);
        }
    };

    const handleClockOut = async () => {
        const token = localStorage.getItem('token');

        if (hour < 18) {
            const confirmClockOut = window.confirm(
                "Anda mencoba melakukan Clock Out sebelum jam 18:00. Apakah Anda yakin ingin melanjutkan?"
            );
            if (!confirmClockOut) {
                return; // Batalkan proses jika pengguna memilih "Batal"
            }
        }

        // Format waktu dalam format "yyyy-mm-dd HH:MM:ss"
        const time = `${year}-${formatTwoDigits(month)}-${formatTwoDigits(day)} ${formatTwoDigits(hour)}:${formatTwoDigits(minute)}:${formatTwoDigits(second)}`;

        try {
            await axios.post(`${Config.BaseUrl}/create-attendance`, {
                type: 'clock_out',
                time: time,
                latitude: latitude,
                longitude: longitude,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            window.location.href = '/attendances';
        } catch (error) {
            console.error("Error clocking in:", error);
        }
    };

    // Generate data untuk setiap hari
    const days = Array.from({ length: 1 }, () => {
        const date = day;
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
                    btnClockIn.current.disabled = true

                    if (item.minute_late > 0) {
                        isLate = true
                    }
                } else if (item.type == "clock_out") {
                    clockOut = item.time
                    btnClockOut.current.disabled = true
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

    useEffect(() => {
        days
    });

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Absensi</h1>
            </div>
            
            <div className="row">
                <div className="col-12">
                    <div className="card mx-auto bg-primary mb-3 pt-3">
                        <h1 className="text-center text-light">
                            {currentTime.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}
                        </h1>
                        <p className="text-center text-light">{todayName}, {day} {currentMonth} {year}</p>

                        <div className="row">
                            <div className="col-6 mx-auto">
                                <div className="card shadow mb-4">
                                    <div className="card-body text-center">
                                        <div className="col-12 mb-3">
                                            <p>Jadwal : {day} {currentMonth} {year}</p>
                                            <h5 className="m-0 font-weight-bold text-dark">09:00 - 18:00</h5>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <button
                                                    id="clockIn"
                                                    className="col-12 btn btn-primary"
                                                    ref={btnClockIn}
                                                    onClick={handleClockIn}
                                                >
                                                    Clock In
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button 
                                                    id="clockOut" 
                                                    className="col-12 btn btn-primary" 
                                                    ref={btnClockOut}
                                                    onClick={handleClockOut}
                                                >Clock Out</button>
                                            </div>
                                        </div>
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
                            <h6 className="m-0 font-weight-bold text-primary">Daftar Absensi Hari Ini</h6>
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

export default Attendances;
