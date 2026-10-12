import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Partners from "../pages/Partners";
import Referrals from "../pages/Referrals";
import Payouts from "../pages/Payouts";
import Settings from "../pages/Settings";
import KycDocuments from "../pages/KycDocuments";
import SupportPage from "../pages/SupportPage";

/////=======================================================
import { SellerManagementPage } from '../../admin/pages/SellerManagementPage.jsx';
import { SellerDetailPage } from '../../admin/pages/SellerDetailPage.jsx';
import { VehicleVerificationPage } from '../../admin/pages/VehicleVerificationPage.jsx';
import { InspectorManagementPage } from '../../admin/pages/InspectorManagementPage.jsx';
import { InspectionManagementPage } from '../../admin/pages/InspectionManagementPage.jsx';

import { InspectionDetailAdminPage } from '../../admin/pages/InspectionDetailAdminPage.jsx';


/*
|--------------------------------------------------------------------------
| PRIVATE ROUTE WRAPPER
|--------------------------------------------------------------------------
*/
const AdminPrivateRoute = () => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<AdminPrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="partners" element={<Partners />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="kyc" element={<KycDocuments />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="settings" element={<Settings />} />
          {/* /////////////////////////////// */}
          <Route path="sellers" element={<SellerManagementPage />} />
          <Route path="sellers/:sellerId" element={<SellerDetailPage />} />
          <Route path="vehicle-verification" element={<VehicleVerificationPage />} />
          <Route path="inspectors" element={<InspectorManagementPage />} />
          <Route path="inspections" element={<InspectionManagementPage />} />
          <Route path="inspections/:inspectionId" element={<InspectionDetailAdminPage />} />
        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
