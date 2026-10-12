//server/app.js
import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin/admin.routes.js";

import partnerRoutes from "./routes/partner/partner.routes.js";

import supportRoutes from "./routes/admin/support.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/admin", adminRoutes);
app.use("/api/partner", partnerRoutes);

app.use("/api/admin/support", supportRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Running..." });
});

export default app;
