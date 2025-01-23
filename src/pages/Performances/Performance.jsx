import axios from 'axios';
import { useState, useEffect } from 'react';

const Performance = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [workdaysCount, setWorkdaysCount] = useState(0);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [lateMinutes, setLateMinutes] = useState(0);
    const [earlyLeaveMinutes, setEarlyLeaveMinutes] = useState(0);
    const [absentWithoutNote, setAbsentWithoutNote] = useState(0);
    const [leaveDaysCount, setLeaveDaysCount] = useState(0);
    const [performanceAttPercentage, setPerformanceAttPercentage] = useState(0);

    const [taskCount, setTaskCount] = useState(0);
    const [doneTaskCount, setDoneTaskCount] = useState(0);
    const [lateTaskCount, setLateTaskCount] = useState(0);
    const [earlyTaskCount, setEarlyTaskCount] = useState(0);
    const [incompleteTask, setIncompleteTask] = useState(0);
    const [performanceTaskPercentage, setPerformanceTaskPercentage] = useState(0);

    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('user_info'));

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

    // Get Performance Status
    const getPerformanceStatus = (percentage) => {
        if (percentage < 60) {
            return 'Tidak Memuaskan';
        } else if (percentage >= 60 && percentage < 70) {
            return 'Kurang Memuaskan';
        } else if (percentage >= 70 && percentage <= 80) {
            return 'Cukup Memuaskan';
        } else if (percentage > 80 && percentage <= 90) {
            return 'Memuaskan';
        } else if (percentage > 90) {
            return 'Sangat Memuaskan';
        }
        return '';
    };

    // Fetch permission data from API
    const fetchPermissions = async () => {
        const apiUrl = `http://localhost:8989/permissions`;
        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "status.eq": "confirm",
                    "id_user.eq": userInfo?.id,
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

                setLeaveDaysCount(totalLeaveDays);
                return totalLeaveDays;
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
            return 0;
        }
    };

    // Fetch attendance data from API
    const fetchAttendance = async () => {
        const apiUrl = `http://localhost:8989/attendances`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "date.like": `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                    "id_user.eq": userInfo?.id,
                },
            });

            if (response.data.success) {
                const attendanceData = response.data.data;
                const clockInEntries = attendanceData.filter((entry) => entry.type === "clock_in");
                const clockOutEntries = attendanceData.filter((entry) => entry.type === "clock_out");
                const totalWorkingDays = calculateWorkdays(selectedYear, selectedMonth);

                setAttendanceCount(clockInEntries.length);

                const totalLateMinutes = clockInEntries
                    .filter((entry) => entry.status === "late")
                    .reduce((sum, entry) => sum + entry.minute_late, 0);

                const totalEarlyMinutes = clockOutEntries
                    .filter((entry) => entry.status === "early")
                    .reduce((sum, entry) => sum + entry.minute_late, 0);

                const daysPresent = [...new Set(clockInEntries.map((entry) => entry.date))].length;
                const absentWithoutNotice = totalWorkingDays - daysPresent;

                setLateMinutes(totalLateMinutes);
                setEarlyLeaveMinutes(totalEarlyMinutes * -1);

                const leaveDays = await fetchPermissions();
                setAbsentWithoutNote(absentWithoutNotice - leaveDays);

                calculatePerformance(
                    totalWorkingDays,
                    clockInEntries.length,
                    totalLateMinutes,
                    totalEarlyMinutes,
                    leaveDays,
                    absentWithoutNotice
                );
            } else {
                console.error("Failed to fetch attendance data");
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

    // Calculate performance percentage
    const calculatePerformance = (
        workdays,
        attendedDays,
        lateMinutes,
        earlyLeaveMinutes,
        leaveDays,
        absentDays
    ) => {
        const totalMinutesWorkdays = workdays * 540; // Total minutes in workdays
        const effectiveMinutes =
            (attendedDays + leaveDays) * 540 - lateMinutes - earlyLeaveMinutes - absentDays * 540;
        const percentage = Math.max(0, Math.round((effectiveMinutes / totalMinutesWorkdays) * 100));

        setPerformanceAttPercentage(percentage);
    };

    const fetchTask = async () => {
        const apiUrl = `http://localhost:8989/tasks`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    "assign_to.eq": userInfo?.id,
                    "due_date.like": `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                },
            });

            if (response.data.success) {
                const tasks = response.data.data;

                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.status === 'completed').length;
                const lateTasks = tasks.filter(task => 
                    task.status === 'completed' && new Date(task.completed_at) > new Date(task.due_date)
                ).length;
                const earlyTasks = tasks.filter(task => 
                    task.status === 'completed' && new Date(task.completed_at) < new Date(task.due_date)
                ).length;
                const incompleteTasks = tasks.filter(task => task.status !== 'completed').length;

                const calc = completedTasks - (lateTasks * 0.5) - incompleteTask + (earlyTasks * 0.5)
                let percentage = Math.max(0, Math.round((calc / totalTasks) * 100));

                if (percentage > 100 ) {
                    percentage = 100;
                }

                setTaskCount(totalTasks);
                setDoneTaskCount(completedTasks);
                setLateTaskCount(lateTasks);
                setEarlyTaskCount(earlyTasks);
                setIncompleteTask(incompleteTasks);
                setPerformanceTaskPercentage(percentage)
            } else {
                console.log("Failed to fetch task data");
            }
        } catch (error) {
            setTaskCount(0);
            setDoneTaskCount(0);
            setLateTaskCount(0);
            setEarlyTaskCount(0);
            setIncompleteTask(0);
            setPerformanceTaskPercentage(0)
            console.log("Error fetching task data:", error);
        }
    };

    useEffect(() => {
        const count = calculateWorkdays(selectedYear, selectedMonth);
        setWorkdaysCount(count);
        fetchAttendance();
        fetchTask();
    }, [selectedYear, selectedMonth]);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Tinjauan Kinerja</h1>
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
                <div className="col-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Performa Absensi Anda</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Hari Kerja:</p>
                                <span>{workdaysCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Masuk Kerja:</p>
                                <span>{attendanceCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Telat Dalam Menit:</p>
                                <span>{lateMinutes}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Pulang Cepat Dalam Menit:</p>
                                <span>{earlyLeaveMinutes}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Hari Izin/Cuti:</p>
                                <span>{leaveDaysCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Tidak Masuk Tanpa Ket.:</p>
                                <span>{absentWithoutNote}</span>
                            </div>
                            <div className="d-flex justify-content-between mt-3">
                                <h4>Performa Anda Bulan Ini:</h4>
                                <span style={{ fontSize: "1.5rem" }}>
                                    {performanceAttPercentage}%
                                </span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <h4> </h4>
                                {getPerformanceStatus(performanceAttPercentage)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Performa Tugas Anda</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Tugas:</p>
                                <span>{taskCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Tugas Selesai:</p>
                                <span>{doneTaskCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Tugas Telat:</p>
                                <span>{lateTaskCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Tugas Lebih Cepat:</p>
                                <span>{earlyTaskCount}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <p>Jumlah Tugas Belum Selesai:</p>
                                <span>{incompleteTask}</span>
                            </div>
                            <div className="d-flex justify-content-between mt-3">
                                <h4>Performa Anda Bulan Ini:</h4>
                                <span style={{ fontSize: "1.5rem" }}>
                                    {performanceTaskPercentage}%
                                </span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <h4> </h4>
                                {getPerformanceStatus(performanceTaskPercentage)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Performance;
