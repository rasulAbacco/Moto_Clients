import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminRoutes from "./admin/routes/AdminRoutes";
import LandingRoutes from "./landing/routes/LandingRoutes";
import PartnerRoutes from "./partner/routes/PartnerRoutes";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/partner/*" element={<PartnerRoutes />} />
        <Route path="/*" element={<LandingRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
