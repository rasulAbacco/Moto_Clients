import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";

app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${env.PORT}`);
});
