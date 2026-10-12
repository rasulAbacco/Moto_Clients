import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { env } from "./config/env.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import fieldInspectorRoutes from "./routes/fieldInspectorRoutes.js";
import buyerRoutes from "./routes/buyer.routes.js";
const app = express();

const corsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/api", routes);

// Seller routes
app.use("/api/sellers", sellerRoutes);

// Vehicle routes
app.use("/api/vehicles", vehicleRoutes);

// Field Inspector routes
app.use("/api/field-inspector", fieldInspectorRoutes);

// Buyer routes
app.use("/api/buyer", buyerRoutes);

app.use(errorHandler);

export default app;
