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
    const [status, setStatus] = useState('Masuk');
    const btnClockIn = useRef(null);
    const btnClockOut = useRef(null);
    const userInfo = JSON.parse(localStorage.getItem('user_info'))
    const referenceLatitude = -6.166057;
    const referenceLongitude = 106.810325;
    const radius = 500; // 500 meters

    // Haversine formula to calculate distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const toRadians = (degrees) => degrees * (Math.PI / 180);
        const φ1 = toRadians(lat1);
        const φ2 = toRadians(lat2);
        const Δφ = toRadians(lat2 - lat1);
        const Δλ = toRadians(lon2 - lon1);

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting location", error);
                    alert("Tidak dapat mengakses lokasi. Pastikan GPS Anda aktif.");
                }
            );
        } else {
            alert("Geolocation tidak didukung oleh perangkat Anda.");
        }
    
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
    
        return () => clearInterval(timer);
    }, []);    

    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const formatTwoDigits = (number) => number.toString().padStart(2, "0");
    const isWeekend = (day) => {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 6 || dayOfWeek === 0
    };

    const [data, setData] = useState([]);
    const fetchData = async (year, month, day) => {
        const token = localStorage.getItem('token');
        const dateFormat = `${year}-${formatTwoDigits(month)}-${formatTwoDigits(day)}`;

        try {
            const response = await axios.get(`${Config.BaseUrl}/attendances` , {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "date.eq": dateFormat,
                    "id_user.eq": userInfo.id
                }
            });

            setData(response.data.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = '/logout'
            }
            console.error("Error fetching data:", error);
        }

        try {
            const response = await axios.get(`${Config.BaseUrl}/permissions` , {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "id_user.eq": userInfo.id,
                    "status.eq": "confirm"
                }
            });

            response.data.data.forEach(data => {
                const permissionStartDate = new Date(data.start_date);
                const permissionEndDate = new Date(data.end_date);
                const currentDate = new Date(dateFormat);

                // Check if the current date is within the permission range
                if (currentDate >= permissionStartDate && currentDate <= permissionEndDate) {
                    // Disable the buttons and set the status
                    btnClockIn.current.disabled = true;
                    btnClockOut.current.disabled = true;
                    setStatus(data.permission_name); // Set the status to permission name
                }
            });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                window.location.href = '/logout'
            }
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData(year, month, day);
    }, [year, month, day]);

    const handleClockIn = async () => {
        if (!latitude || !longitude) {
            alert("Lokasi belum ditemukan, coba lagi.");
            return;
        }

        const distance = calculateDistance(latitude, longitude, referenceLatitude, referenceLongitude);
        if (distance > radius) {
            alert(`Anda berada di luar radius ${radius} meter. Tidak dapat melakukan Clock In.`);
            return;
        }

        const token = localStorage.getItem('token');
        const time = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;

        try {
            await axios.post(`${Config.BaseUrl}/create-attendance`, {
                type: 'clock_in',
                time,
                latitude,
                longitude,
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
        if (!latitude || !longitude) {
            alert("Lokasi belum ditemukan, coba lagi.");
            return;
        }

        const distance = calculateDistance(latitude, longitude, referenceLatitude, referenceLongitude);
        if (distance > radius) {
            alert(`Anda berada di luar radius ${radius} meter. Tidak dapat melakukan Clock Out.`);
            return;
        }

        if (hour < 18) {
            const isConfirmed = window.confirm("Apakah Anda yakin ingin melakukan Clock Out lebih cepat?");
            if (!isConfirmed) {
                return;
            }
        }

        const token = localStorage.getItem('token');
        const time = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;

        try {
            await axios.post(`${Config.BaseUrl}/create-attendance`, {
                type: 'clock_out',
                time,
                latitude,
                longitude,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            window.location.href = '/attendances';
        } catch (error) {
            console.error("Error clocking out:", error);
        }
    };


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
                                            <p>Jadwal : {status}</p>
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
