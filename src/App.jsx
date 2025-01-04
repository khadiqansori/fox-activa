import {Routes, Route} from 'react-router-dom'

import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import HomePage from './pages/HomePage.jsx'
import Employees from './pages/Employees/Employees.jsx'
import EmployeesCreate from './pages/Employees/EmployeesCreate.jsx'
import Roles from './pages/Roles.jsx'
import PermissionLeaves from './pages/PermissionLeaves.jsx'
import Info from './pages/Info.jsx'
import Attendance from './pages/Attendance.jsx'
import AttendanceLog from './pages/AttendanceLog.jsx'
import Performance from './pages/Performance.jsx'
import JobManagement from './pages/JobManagement.jsx'


function App() {
  return (
    <div id="wrapper">
      <Sidebar />

      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar />

          <Routes>
            <Route>
              <Route path="/" element={<HomePage />} />

              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/create" element={<EmployeesCreate />} />
              <Route path="/employees/edit" element={<Employees />} />
              <Route path="/employees/delete" element={<Employees />} />

              <Route path="/roles" element={<Roles />} />
              <Route path="/roles/create" element={<Roles />} />
              <Route path="/roles/edit" element={<Roles />} />
              <Route path="/roles/delete" element={<Roles />} />

              <Route path="/permission-leaves" element={<PermissionLeaves />} />
              <Route path="/permission-leaves/create" element={<PermissionLeaves />} />
              <Route path="/permission-leaves/edit" element={<PermissionLeaves />} />
              <Route path="/permission-leaves/delete" element={<PermissionLeaves />} />
              
              <Route path="/infos" element={<Info />} />
              <Route path="/infos/create" element={<Info />} />
              <Route path="/infos/edit" element={<Info />} />
              <Route path="/infos/delete" element={<Info />} />

              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/create" element={<Attendance />} />
              <Route path="/attendance/edit" element={<Attendance />} />
              <Route path="/attendance/delete" element={<Attendance />} />

              <Route path="/attendance-logs" element={<AttendanceLog />} />
              <Route path="/attendance-logs/create" element={<AttendanceLog />} />
              <Route path="/attendance-logs/edit" element={<AttendanceLog />} />
              <Route path="/attendance-logs/delete" element={<AttendanceLog />} />

              <Route path="/performances" element={<Performance />} />
              <Route path="/performances/create" element={<Performance />} />
              <Route path="/performances/edit" element={<Performance />} />
              <Route path="/performances/delete" element={<Performance />} />

              <Route path="/job-management" element={<JobManagement />} />
              <Route path="/job-management/create" element={<JobManagement />} />
              <Route path="/job-management/edit" element={<JobManagement />} />
              <Route path="/job-management/delete" element={<JobManagement />} />

            </Route>
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
