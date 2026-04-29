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

// Sub-page imports — these render inside the same MainLayout via Outlet
import AnalyticsPage from './pages/sub/AnalyticsPage';
import ProductionSchedulePage from './pages/sub/ProductionSchedulePage';
import WorkOrdersPage from './pages/sub/WorkOrdersPage';
import BatchesPage from './pages/sub/BatchesPage';
import StockPage from './pages/sub/StockPage';
import SuppliersPage from './pages/sub/SuppliersPage';
import MaterialRequestsPage from './pages/sub/MaterialRequestsPage';
import InspectionsPage from './pages/sub/InspectionsPage';
import DefectsPage from './pages/sub/DefectsPage';
import QualityReportsPage from './pages/sub/QualityReportsPage';
import MaintenanceRequestsPage from './pages/sub/MaintenanceRequestsPage';
import MaintenanceSchedulePage from './pages/sub/MaintenanceSchedulePage';
import EquipmentPage from './pages/sub/EquipmentPage';
import ShiftsPage from './pages/sub/ShiftsPage';
import AttendancePage from './pages/sub/AttendancePage';
import SkillsPage from './pages/sub/SkillsPage';

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
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/analytics" element={<AnalyticsPage />} />

          {/* Production */}
          <Route path="production" element={<Production />} />
          <Route path="production/schedule" element={<ProductionSchedulePage />} />
          <Route path="production/work-orders" element={<WorkOrdersPage />} />
          <Route path="production/batches" element={<BatchesPage />} />

          {/* Inventory */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/stock" element={<StockPage />} />
          <Route path="inventory/suppliers" element={<SuppliersPage />} />
          <Route path="inventory/requests" element={<MaterialRequestsPage />} />

          {/* Quality */}
          <Route path="quality" element={<Quality />} />
          <Route path="quality/inspections" element={<InspectionsPage />} />
          <Route path="quality/defects" element={<DefectsPage />} />
          <Route path="quality/reports" element={<QualityReportsPage />} />

          {/* Maintenance */}
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="maintenance/requests" element={<MaintenanceRequestsPage />} />
          <Route path="maintenance/schedule" element={<MaintenanceSchedulePage />} />
          <Route path="maintenance/equipment" element={<EquipmentPage />} />

          {/* Employees */}
          <Route path="employees" element={<Employees />} />
          <Route path="employees/shifts" element={<ShiftsPage />} />
          <Route path="employees/attendance" element={<AttendancePage />} />
          <Route path="employees/skills" element={<SkillsPage />} />

          {/* Other */}
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
