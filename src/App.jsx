import PropTypes from 'prop-types';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Login from './pages/Login/Login.jsx';
import HomePage from './pages/HomePage.jsx';
import Employees from './pages/Employees/Employees.jsx';
import EmployeesCreate from './pages/Employees/EmployeesCreate.jsx';
import EmployeesUpdate from './pages/Employees/EmployeesUpdate.jsx';
import Roles from './pages/Roles/Roles.jsx';
import RolesCreate from './pages/Roles/RolesCreate.jsx';
import PermissionTypes from './pages/PermissionTypes/PermissionTypes.jsx';
import PermissionTypesCreate from './pages/PermissionTypes/PermissionTypesCreate.jsx';
import Info from './pages/Info.jsx';
import Attendances from './pages/Attendances/Attendances.jsx';
import AttendanceLog from './pages/AttendanceLog.jsx';
import Performance from './pages/Performance.jsx';
import JobManagement from './pages/JobManagement.jsx';
import RolesUpdate from './pages/Roles/RolesUpdate.jsx';

const Logout = () => {
  localStorage.clear();
}

const MainLayout = ({ children }) => (
  <div id="wrapper">
    <Sidebar />
    <div id="content-wrapper" className="d-flex flex-column">
      <div id="content">
        <Topbar />
        {children}
      </div>
    </div>
  </div>
);

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

// HOC untuk proteksi rute
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');

  // Jika token tidak ada, arahkan ke halaman login
  if (!token) {
    localStorage.clear();

    return <Navigate to="/login" replace />;
  }

  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.node.isRequired,
};

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Main Layout Routes */}
      {!isLoginPage && (
        <Route
          path="*"
          element={
            <ProtectedRoute
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/employees/create" element={<EmployeesCreate />} />
                    <Route path="/employees/update/:id" element={<EmployeesUpdate />} />
                    <Route path="/roles" element={<Roles />} />
                    <Route path="/roles/create" element={<RolesCreate />} />
                    <Route path="/roles/update/:id" element={<RolesUpdate />} />
                    <Route path="/permission-types" element={<PermissionTypes />} />
                    <Route path="/permission-types/create" element={<PermissionTypesCreate />} />
                    <Route path="/infos" element={<Info />} />
                    <Route path="/attendances" element={<Attendances />} />
                    <Route path="/attendance-logs" element={<AttendanceLog />} />
                    <Route path="/performances" element={<Performance />} />
                    <Route path="/job-management" element={<JobManagement />} />
                    <Route path="/logout" element={<Logout />} />
                  </Routes>
                </MainLayout>
              }
            />
          }
        />
      )}
    </Routes>
  );
}

export default App;
