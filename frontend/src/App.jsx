import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { initializeLoginState } from "./utils/loginState.js";

// Pages
import Login from "./pages/Login.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
// Common Layout Components
import DashboardLayout from "./components/common/DashboardLayout.jsx";
import MobileNav from "./components/common/MobileNav.jsx";
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
import DelayedStudents from "./components/warden/DelayedStudents.jsx";
import QRScanner from "./components/warden/QRScanner.jsx";
import Reports from "./components/warden/Reports.jsx";

function App() {
  const { user, isTempPassword } = useAuth();

  useEffect(() => {
    // Initialize PWA login state first
    initializeLoginState();

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.toggle('light-mode', savedTheme === 'light');
    }

    // Set initial theme based on system preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('light-mode', !prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }

    // Initialize PWA behavior
    initializePWA();
  }, []);

  // Initialize PWA-specific behavior
  const initializePWA = () => {
    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone === true ||
                   document.referrer.includes('android-app://');

    if (isPWA) {
      console.log('Running as PWA');
      
      // Add PWA-specific styles
      document.body.classList.add('pwa-mode');
    }

    // Listen for online/offline status
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      console.log('Network status:', isOnline ? 'online' : 'offline');
      
      // Show offline indicator
      if (!isOnline) {
        document.body.classList.add('offline-mode');
      } else {
        document.body.classList.remove('offline-mode');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
    });
  };

  // Redirect to change password if user logged in with temporary password
  useEffect(() => {
    if (user && isTempPassword && window.location.pathname !== '/change-password' && !window.location.pathname.includes('/change-password')) {
      window.location.href = '/change-password';
    }
  }, [user, isTempPassword]);

  // Redirect to dashboard if user is already logged in and trying to access login page
  useEffect(() => {
    if (user?.role && window.location.pathname === '/login') {
      window.location.href = `/${user.role}`;
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/:role/change-password" element={<ChangePassword />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <>
                <AdminDashboard />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-student"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <>
                <AddStudent />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-parent"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <>
                <AddParent />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-warden"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <>
                <AddWarden />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <>
                <StudentList />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <>
                <ParentList />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/wardens"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <>
                <WardenList />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <>
                <StudentDashboard />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/request-pl"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <>
                <RequestPL />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/request-outpass"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <>
                <RequestOutpass />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/pl-history"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <>
                <PLHistory />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/outpass-history"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <>
                <OutpassHistory />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/pl-card/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <>
                <PLCard />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/outpass-qr/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <>
                <OutpassQR />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        {/* Parent Routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <>
                <ParentDashboard />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/pl-requests"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <>
                <PLRequests />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/request-history"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <>
                <RequestHistory />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        {/* Warden Routes */}
        <Route
          path="/warden"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <>
                <WardenDashboard />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/pending-requests"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <>
                <PendingRequests />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/students"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <>
                <StudentsList />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/delayed-students"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <>
                <DelayedStudents />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/qr-scanner"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <>
                <QRScanner />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/reports"
          element={
            <ProtectedRoute allowedRoles={["warden"]}>
              <>
                <Reports />
                <MobileNav />
              </>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
