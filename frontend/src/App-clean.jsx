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
// Common Components
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AddStudent from "./components/admin/AddStudent.jsx";
import AddParent from "./components/admin/AddParent.jsx";
import AddWarden from "./components/admin/AddWarden.jsx";
import ManageUsers from "./components/admin/ManageUsers.jsx";
import Reports from "./components/admin/Reports.jsx";

// Student Components
import StudentDashboard from "./components/student/StudentDashboard.jsx";
import PLRequest from "./components/student/PLRequest.jsx";
import PLHistory from "./components/student/PLHistory.jsx";
import OutpassQR from "./components/student/OutpassQR.jsx";

// Parent Components
import ParentDashboard from "./components/parent/ParentDashboard.jsx";
import ChildrenStatus from "./components/parent/ChildrenStatus.jsx";
import PLApproval from "./components/parent/PLApproval.jsx";

// Warden Components
import WardenDashboard from "./components/warden/WardenDashboard.jsx";
import StudentsList from "./components/warden/StudentsList.jsx";
import ApprovePL from "./components/warden/ApprovePL.jsx";

// Common Layout Components
import DashboardLayout from "./components/common/DashboardLayout.jsx";

function App() {
  const { user, loading } = useAuth();

  // Initialize theme and PWA on app load
  useEffect(() => {
    // Initialize PWA login state
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

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  {/* Admin Routes */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/add-student"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AddStudent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/add-parent"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AddParent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/add-warden"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AddWarden />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/manage-users"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <ManageUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />

                  {/* Student Routes */}
                  <Route
                    path="student/pl-request"
                    element={
                      <ProtectedRoute allowedRoles={["student"]}>
                        <PLRequest />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="student/pl-history"
                    element={
                      <ProtectedRoute allowedRoles={["student"]}>
                        <PLHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="student/outpass-qr"
                    element={
                      <ProtectedRoute allowedRoles={["student"]}>
                        <OutpassQR />
                      </ProtectedRoute>
                    }
                  />

                  {/* Parent Routes */}
                  <Route
                    path="parent/children-status"
                    element={
                      <ProtectedRoute allowedRoles={["parent"]}>
                        <ChildrenStatus />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="parent/pl-approval"
                    element={
                      <ProtectedRoute allowedRoles={["parent"]}>
                        <PLApproval />
                      </ProtectedRoute>
                    }
                  />

                  {/* Warden Routes */}
                  <Route
                    path="warden/students-list"
                    element={
                      <ProtectedRoute allowedRoles={["warden"]}>
                        <StudentsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="warden/approve-pl"
                    element={
                      <ProtectedRoute allowedRoles={["warden"]}>
                        <ApprovePL />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
