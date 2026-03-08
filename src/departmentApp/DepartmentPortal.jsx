/**
 * DepartmentPortal.jsx
 *
 * Self-contained departmental sub-app mounted at /department/* in the
 * main production frontend. It must NOT have its own BrowserRouter —
 * it inherits the Router context from App.tsx. All route paths here
 * are relative to the /department/* match.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import axios from 'axios';

// Configure axios base URL for the department app
// (Main.jsx is bypassed when nested, so we configure it here)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const csrfToken = localStorage.getItem('csrfToken');
if (csrfToken) {
  axios.defaults.headers.common['x-csrf-token'] = csrfToken;
}
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { AppThemeProvider } from './context/ThemeContext';
import { DemoProvider } from './context/DemoContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

function DepartmentPortal() {
  return (
    <ChakraProvider>
      <AppThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <PreferencesProvider>
              <DemoProvider>
              {/* Routes are relative to /department (the parent match in App.tsx) */}
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/editor"
                  element={
                    <ProtectedRoute>
                      <EditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/department" replace />} />
              </Routes>
              </DemoProvider>
            </PreferencesProvider>
          </AuthProvider>
        </ErrorBoundary>
      </AppThemeProvider>
    </ChakraProvider>
  );
}

export default DepartmentPortal;
