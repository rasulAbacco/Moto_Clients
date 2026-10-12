import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingLayout from "../layouts/LandingLayout";

import Home from "../pages/Home";
import Features from "../pages/Features";
import Pricing from "../pages/Pricing";
import PartnerProgram from "../pages/PartnerProgram";
import Contact from "../pages/Contact";
import UserLogin from "../pages/UserLogin";
import UserRegister from "../pages/UserRegister";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import Refund from "../pages/Refund";

const LandingRoutes = () => {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        {/* Home */}
        <Route index element={<Home />} />

        {/* Public Pages */}
        <Route path="features" element={<Features />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="partner-program" element={<PartnerProgram />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="refund" element={<Refund />} />

        {/* Auth Pages */}
        <Route path="login" element={<UserLogin />} />
        <Route path="register" element={<UserRegister />} />
      </Route>
    </Routes>
  );
};

export default LandingRoutes;
