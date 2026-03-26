import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Production from './pages/Production';
import Quality from './pages/Quality';
import Maintenance from './pages/Maintenance';
import Employees from './pages/Employees';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import InvoiceHistory from './pages/InvoiceHistory';

// Protected Layout Wrapper that checks authentication
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected Routes with MainLayout */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <MainLayout />
            </ProtectedLayout>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="production" element={<Production />} />
          <Route path="quality" element={<Quality />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="employees" element={<Employees />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="invoices" element={<InvoiceHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
