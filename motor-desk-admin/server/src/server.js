//server/server.js
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 8000;
app.use(
  cors({
    origin: [
      // crmconnectleads
      "http://localhost:5174",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
