import axios from 'axios';
import { useState, useEffect } from 'react';
import Config from './Config';
// import Attendances from './Attendances/Attendances';

const HomePage = () => {
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('user_info'));
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const day = today.getDate();

    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [taskPerentage, setTaskPercentage] = useState(0);
    const [requestCount, setRequestCount] = useState(0);
    const [leaveLeft, setLeaveLeft] = useState(0);

    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const formatTwoDigits = (number) => number.toString().padStart(2, "0");
    const isWeekend = (day) => {
        const date = new Date(currentYear, currentMonth - 1, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 6 || dayOfWeek === 0
    };

    // Fetch attendance data from API
    const fetchAttendance = async () => {
        const apiUrl = `${Config.BaseUrl}/attendances`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "date.like": `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
                    "id_user.eq": userInfo?.id,
                },
            });

            if (response.data.success) {
                const attendanceData = response.data.data;
                const clockInEntries = attendanceData.filter((entry) => entry.type === "clock_in");

                setAttendanceData(attendanceData)
                setAttendanceCount(clockInEntries.length);
            } else {
                console.error("Failed to fetch attendance data");
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

    // Fetch permission data from API
    const fetchPermissions = async () => {
        const apiUrl = `${Config.BaseUrl}/permissions`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "id_user.eq": userInfo?.id,
                },
            });

            if (response.data.success) {
                const permissions = response.data.data;
                const confirmPermissions = permissions.filter((permission) => {
                    const startDate = new Date(permission.start_date);
                    const endDate = new Date(permission.end_date);
                    const status = permission.status;
                    return (
                        startDate.getFullYear() === currentYear &&
                        startDate.getMonth() + 1 === currentMonth &&
                        endDate.getFullYear() === currentYear &&
                        endDate.getMonth() + 1 === currentMonth && 
                        status === "confirm"
                    );
                });
                const requestPermissions = permissions.filter((permission) => {
                    const startDate = new Date(permission.start_date);
                    const endDate = new Date(permission.end_date);
                    const status = permission.status;
                    return (
                        startDate.getFullYear() === currentYear &&
                        startDate.getMonth() + 1 === currentMonth &&
                        endDate.getFullYear() === currentYear &&
                        endDate.getMonth() + 1 === currentMonth && 
                        status === "request"
                    );
                });

                const totalConfirm = confirmPermissions.length;
                const totalRequest = requestPermissions.length;

                setRequestCount(totalRequest);
                setLeaveLeft(12 - totalConfirm)
                return;
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
            return 0;
        }
    };

    // Fetch taks data from API
    const fetchTask = async () => {
        const apiUrl = `${Config.BaseUrl}/tasks`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "id_user.eq": userInfo?.id,
                    "due_date.like": `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
                },
            });

            if (response.data.success) {
                const tasks = response.data.data;

                const totalTasks = tasks.filter(task => task.id_user === userInfo?.id).length;
                const completedTasks = tasks.filter(task => task.status === 'completed' && task.id_user === userInfo?.id).length;
                
                let percentage = Math.max(0, Math.round((completedTasks / totalTasks) * 100));

                if (percentage > 100 ) {
                    percentage = 100;
                }

                setTaskPercentage(percentage);
            } else {
                console.log("Failed to fetch task data");
            }
        } catch (error) {
            console.log("Error fetching task data:", error);
        }
    };

    const days = Array.from({ length: 1 }, () => {
        const date = day;
        const formattedDate = `${formatTwoDigits(date)}-${formatTwoDigits(currentMonth)}-${currentYear}`;
        const dayName = dayNames[new Date(currentYear, currentMonth - 1, date).getDay()];
        const dateFormat = `${currentYear}-${formatTwoDigits(currentMonth)}-${formatTwoDigits(date)}`;

        let clockIn = "-"
        let clockOut = "-"
        let isLate = false

        {attendanceData.map((item) => {
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

    useEffect(() => {
        fetchAttendance();
        fetchPermissions();
        fetchTask();
        days;
    }, []);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Beranda</h1>
            </div>

            <div className="row">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Jumlah Kehadiran Bulan Ini</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{attendanceCount}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-calendar fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Sisa Cuti</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{leaveLeft}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-heart fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Tugas Selesai
                                    </div>
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-auto">
                                            <div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">{taskPerentage}%</div>
                                        </div>
                                        <div className="col">
                                            <div className="progress progress-sm mr-2">
                                                <div className="progress-bar bg-info" role="progressbar"
                                                    style={{width: taskPerentage + `%`}} aria-valuenow="50" aria-valuemin="0"
                                                    aria-valuemax="100"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Permintaan Izin Tertunda</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{requestCount}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-comments fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="row" id="sect-list-attendance">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Daftar Absensi Hari Ini</h6>
                        </div>
                        <div className="card-body">
                            {days.map(({ date, clockIn, clockOut, isLate }) => (
                                <div key={date}>
                                    {clockIn == "-" ? 
                                        <div className="alert alert-danger" role="alert">
                                            Anda belum melakukan absensi hari ini.
                                        </div>
                                    : isLate ? 
                                        <div className="alert alert-warning" role="alert">
                                            Hari ini anda datang terlambat.
                                        </div>
                                    : clockOut !== "-" ?   
                                        <div className="alert alert-info" role="alert">
                                            Terima kasih atas kerja kerasnya, selamat beristirahat.
                                        </div>
                                    :   <div className="alert alert-success" role="alert">
                                            Hari ini anda datang tepat waktu.
                                        </div>
                                    }

                                </div>
                            ))}
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
    )
}

export default HomePage