import app from "./app";
import { logger } from "./lib/logger";
import { ensureDemoData } from "./seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  await ensureDemoData();
  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server listening on 0.0.0.0");
  });
}

start().catch((err) => {
  logger.fatal({ err }, "Server failed to start");
  process.exit(1);
});
