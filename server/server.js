import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";
import { ensureAppSchema } from "./src/config/ensureSchema.js";

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${env.PORT}`);
  // Repair Motor Konnect columns if the shared schema dropped them
  ensureAppSchema();
});
