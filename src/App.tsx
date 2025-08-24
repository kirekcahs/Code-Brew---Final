// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import LandingPage from "./pages/landing";

// Shared Pages (used by multiple roles)
import Dashboard from "./pages/Dashboard";
import InventoryManagement from "./pages/Inventory";
import AssetManagement from "./pages/Assets";
import ReportsManagement from "./pages/Reports";

// Role-specific Pages
import BranchManagement from "./pages/BranchManagement";
import POS from "./pages/pos";

// Shared Components
import Navigation from "./components/Nav"; // Fixed import path
import ProtectedRoute from "./components/ProtectedRoute";
document.title = "Code Brew";
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F0E6]">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Admin Routes - Full system access */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Navigation userRole="admin">
                <Routes>
                  <Route path="branch-management" element={<BranchManagement />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="assets" element={<AssetManagement />} />
                  <Route path="reports" element={<ReportsManagement />} />
                  
                  {/* ✅ DEFAULT: Admin always starts at branch management */}
                  <Route path="" element={<Navigate to="branch-management" replace />} />
                  <Route path="*" element={<Navigate to="branch-management" replace />} />
                </Routes>
              </Navigation>
            </ProtectedRoute>
          } />

          {/* Branch Officer Routes - Branch-specific access */}
          <Route path="/branch-officer/*" element={
            <ProtectedRoute allowedRoles={['Branch Officer']}>
              <Navigation userRole="branch-officer">
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="assets" element={<AssetManagement />} />
                  <Route path="reports" element={<ReportsManagement />} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Navigation>
            </ProtectedRoute>
          } />

          {/* Cashier Routes - POS focused */}
          <Route path="/cashier/*" element={
            <ProtectedRoute allowedRoles={['Cashier']}>
              <Navigation userRole="cashier">
                <Routes>
                  <Route path="pos" element={<POS />} />
                  {/* Cashiers go straight to POS */}
                  <Route path="" element={<Navigate to="pos" replace />} />
                  <Route path="dashboard" element={<Navigate to="pos" replace />} />
                  <Route path="*" element={<Navigate to="pos" replace />} />
                </Routes>
              </Navigation>
            </ProtectedRoute>
          } />

          {/* Legacy route redirects */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/inventory" element={<Navigate to="/admin/inventory" replace />} />
          <Route path="/assets" element={<Navigate to="/admin/assets" replace />} />
          <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
          <Route path="/pos" element={<Navigate to="/cashier/pos" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
