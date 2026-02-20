import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

// Pages
import Login from "./pages/Login.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
// Common Components
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AddStudent from "./components/admin/AddStudent.jsx";
import AddParent from "./components/admin/AddParent.jsx";
import AddWarden from "./components/admin/AddWarden.jsx";
import StudentList from "./components/admin/StudentList.jsx";
import ParentList from "./components/admin/ParentList.jsx";
import WardenList from "./components/admin/WardenList.jsx";

// Student Components
import StudentDashboard from "./components/student/StudentDashboard.jsx";
import RequestPL from "./components/student/RequestPL.jsx";
import RequestOutpass from "./components/student/RequestOutpass.jsx";
import PLHistory from "./components/student/PLHistory.jsx";
import OutpassHistory from "./components/student/OutpassHistory.jsx";
import PLCard from "./components/student/PLCard.jsx";
import OutpassQR from "./components/student/OutpassQR.jsx";

// Parent Components
import ParentDashboard from "./components/parent/ParentDashboard.jsx";
import PLRequests from "./components/parent/PLRequests.jsx";
import RequestHistory from "./components/parent/RequestHistory.jsx";

// Warden Components
import WardenDashboard from "./components/warden/WardenDashboard.jsx";
import PendingRequests from "./components/warden/PendingRequests.jsx";
import StudentsList from "./components/warden/StudentsList.jsx";
import WardenAttendance from "./components/warden/Attendance.jsx";
import DelayedStudents from "./components/warden/DelayedStudents.jsx";
import QRScanner from "./components/warden/QRScanner.jsx";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme ? savedTheme === 'dark' : true;
    
    if (!prefersDark) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
  path="/login"
  element={
    user?.role ? <Navigate to={`/${user.role}`} /> : <Login />
  }
/>
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-student"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-parent"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddParent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-warden"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddWarden />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ParentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/wardens"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <WardenList />
            </ProtectedRoute>
          }
        />
        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/request-pl"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RequestPL />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/request-outpass"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RequestOutpass />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/student/pl-history"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PLHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/outpass-history"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <OutpassHistory />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/student/pl-card/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <PLCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/outpass-qr/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <OutpassQR />
            </ProtectedRoute>
          }
        />
        {/* Parent Routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/pl-requests"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <PLRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/request-history"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <RequestHistory />
            </ProtectedRoute>
          }
        />
        {/* Warden Routes */}
        <Route
          path="/warden"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/pending-requests"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <PendingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/students"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <StudentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/attendance"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <WardenAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/delayed-students"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <DelayedStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/qr-scanner"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <QRScanner />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/:role/change-password" element={<ChangePassword />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
