import express from "express";
import cors from "cors";
import { config } from "./config";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { runMigrations } from "./db/migrate";
import router from "./routes/index";

async function main() {
  await runMigrations();

  const app = express();

  app.use(cors({ origin: "http://localhost:5173" }));
  app.use(express.json());
  app.use(requestLogger);

  app.use("/api", router);

  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`API server running at http://localhost:${config.port}`);
  });
}

main();
