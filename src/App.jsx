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
import AttendanceLog from './pages/Attendances/AttendanceLog.jsx';
import Performance from './pages/Performances/Performance.jsx';
import TaskManagement from './pages/TaskManagement/TaskManagement.jsx';
import RolesUpdate from './pages/Roles/RolesUpdate.jsx';
import TaskManagementCreate from './pages/TaskManagement/TaskManagementCreate.jsx';
import TaskManagementEdit from './pages/TaskManagement/TaskManagementUpdate.jsx';
import Permissions from './pages/Permissions/Permissions.jsx';
import PermissionCreate from './pages/Permissions/PermissionCreate.jsx';
import PermissionUpdate from './pages/Permissions/PermissionUpdate.jsx';
import AllPermissions from './pages/Permissions/AllPermissions.jsx';
import AllPerformance from './pages/Performances/AllPerformance.jsx';
import ExternalAssessments from './pages/ExternalAssessments/ExternalAssessments.jsx';
import ExternalAssessmentsCreate from './pages/ExternalAssessments/ExternalAssesmentsCreate.jsx';

const Logout = () => {
  localStorage.clear();
  window.location.reload();
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
                    <Route path="/list-permissions" element={<AllPermissions />} />
                    <Route path="/permissions" element={<Permissions />} />
                    <Route path="/permissions/create" element={<PermissionCreate />} />
                    <Route path="/permissions/update/:id" element={<PermissionUpdate />} />
                    <Route path="/infos" element={<Info />} />
                    <Route path="/attendances" element={<Attendances />} />
                    <Route path="/attendance-logs" element={<AttendanceLog />} />
                    <Route path="/performances" element={<Performance />} />
                    <Route path="/all-performances" element={<AllPerformance />} />
                    <Route path="/task-management" element={<TaskManagement />} />
                    <Route path="/task-management/create" element={<TaskManagementCreate />} />
                    <Route path="/task-management/update/:id" element={<TaskManagementEdit />} />
                    <Route path="/external-assessments" element={<ExternalAssessments />} />
                    <Route path="/external-assessments/create/:id/:date" element={<ExternalAssessmentsCreate />} />
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
