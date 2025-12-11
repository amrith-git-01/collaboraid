import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import RootRedirect from './components/auth/RootRedirect';
import AuthCheck from './components/auth/AuthCheck';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <LoadingProvider>
      <ToastProvider>
        <Router>
          {/* AuthCheck runs on every page load to sync auth state */}
          <AuthCheck />

          <Routes>
            {/* Root path - redirects based on auth status */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Routes - Only accessible when NOT authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

            {/* Protected Dashboard Routes - Only accessible when authenticated */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Events />} />
            </Route>
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Calendar />} />
            </Route>
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Analytics />} />
            </Route>
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Settings />} />
            </Route>

            {/* Catch all - redirect to root */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </ToastProvider>
    </LoadingProvider>
  );
}

export default App;
