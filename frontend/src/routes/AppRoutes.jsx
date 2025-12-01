import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import useAuthStore from '../stores/useAuthStore';
import apiClient from '../api/axiosClient';
import { queryKeys } from '../lib/react-query';

// Layout Components
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard Pages
import HRDashboard from '../pages/dashboard/HRDashboard';

// HR Pages
import EmployeeList from '../pages/hr/EmployeeList';
import EmployeeDetail from '../pages/hr/EmployeeDetail';
import EmployeeForm from '../pages/hr/EmployeeForm';
import ManagerManagement from '../pages/hr/ManagerManagement';
import Attendance from '../pages/hr/Attendance';
import LeaveRequests from '../pages/hr/LeaveRequests';
import WorkSchedulePage from '../pages/hr/WorkSchedulePage';
import AttendanceRegularizationPage from '../pages/hr/AttendanceRegularizationPage';
import HolidaysPage from '../pages/hr/HolidaysPage';
import RecruitmentList from '../pages/hr/RecruitmentList';
import RecruitmentDetail from '../pages/hr/RecruitmentDetail';
import JobCandidatesView from '../pages/hr/JobCandidatesView';
import GlobalCandidatesManagement from '../pages/hr/GlobalCandidatesManagement';
import InterviewsManagement from '../pages/hr/InterviewsManagement';
import PublicJobApplication from '../pages/hr/PublicJobApplication';

// Analytics Pages
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';
import EmployeeAnalytics from '../pages/analytics/EmployeeAnalytics';
import AttendanceAnalytics from '../pages/analytics/AttendanceAnalytics';
import RecruitmentAnalytics from '../pages/analytics/RecruitmentAnalytics';

// Reports Pages
// import ReportsDashboard from '../pages/reports/ReportsDashboard';
// import EmployeeReports from '../pages/reports/EmployeeReports';
// import AttendanceReports from '../pages/reports/AttendanceReports';
// import RecruitmentReports from '../pages/reports/RecruitmentReports';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RolePermissions from '../pages/admin/RolePermissions';
import SystemSettings from '../pages/admin/SystemSettings';
import DepartmentManagement from '../pages/admin/DepartmentManagement';
import ManagerAssignment from '../pages/admin/ManagerAssignment';
import SkillsManagement from '../pages/admin/SkillsManagement';

// Profile Page
import Profile from '../pages/profile/Profile';

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions = [], requiredRoles = [] }) => {
  const { isAuthenticated, user, permissions, roles } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => roles.includes(role));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  // Fetch user profile if authenticated but user data is missing
  const { isLoading: isLoadingProfile } = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: async () => {
      const response = await apiClient.get('/auth/profile');
      return response.data.data;
    },
    enabled: isAuthenticated && !user,
    retry: false,
  });

  if (isAuthenticated && !user && isLoadingProfile) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/apply/:token"
        element={<PublicJobApplication />}
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HRDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Employee Management Routes */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <EmployeeList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <ProtectedRoute requiredPermissions={['employee:create']}>
            <DashboardLayout>
              <EmployeeForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EmployeeDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute requiredPermissions={['employee:update']}>
            <DashboardLayout>
              <EmployeeForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/managers"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <ManagerManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Attendance Routes */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/leave"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <LeaveRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/schedule"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <WorkSchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/regularization"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <AttendanceRegularizationPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/holidays"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <HolidaysPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Recruitment Routes */}
      <Route
        path="/recruitment"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/:id"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/:id/candidates"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <JobCandidatesView />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/candidates"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <GlobalCandidatesManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/interviews"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <InterviewsManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Analytics Routes */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredPermissions={['employee:read', 'attendance:read', 'recruitment:read']}>
            <DashboardLayout>
              <AnalyticsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/employees"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <EmployeeAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/attendance"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <AttendanceAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/recruitment"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Reports Routes */}
      {/* <Route
        path="/reports"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read', 'employee:read', 'recruitment:read']}>
            <DashboardLayout>
              <ReportsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/employees"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <EmployeeReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/attendance"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <AttendanceReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/recruitment"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      /> */}

      {/* Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Administration Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_users', 'admin:manage_system']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_users']}>
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_users']}>
            <DashboardLayout>
              <RolePermissions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_system']}>
            <DashboardLayout>
              <SystemSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute requiredPermissions={['employee:update']}>
            <DashboardLayout>
              <DepartmentManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/managers"
        element={
          <ProtectedRoute requiredPermissions={['employee:update']}>
            <DashboardLayout>
              <ManagerAssignment />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_system']}>
            <DashboardLayout>
              <SkillsManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
