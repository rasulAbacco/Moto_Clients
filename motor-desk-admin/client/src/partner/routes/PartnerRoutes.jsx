import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import PartnerLayout from "../layouts/PartnerLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Referrals from "../pages/Referrals";
import Earnings from "../pages/Earnings";
import Profile from "../pages/Profile";
import KycDocuments from "../pages/KycDocouments";

/*
|--------------------------------------------------------------------------
| PRIVATE ROUTE WRAPPER
|--------------------------------------------------------------------------
*/
const PartnerPrivateRoute = () => {
  const token = localStorage.getItem("partnerToken");

  if (!token) {
    return <Navigate to="/partner/login" replace />;
  }

  return <Outlet />;
};

const PartnerRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<PartnerPrivateRoute />}>
        <Route element={<PartnerLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="verification" element={<KycDocuments />} />
        </Route>
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/partner/login" replace />} />
    </Routes>
  );
};

export default PartnerRoutes;
