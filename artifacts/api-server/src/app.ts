import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.resolve(currentDir, "public");
  const indexHtml = path.join(frontendDist, "index.html");

  const frontendExists = existsSync(indexHtml);
  logger.info(
    { frontendDist, indexHtml, frontendExists, currentDir },
    "Production frontend path resolution",
  );

  if (frontendExists) {
    app.use(express.static(frontendDist));

    app.get("/{*splat}", (_req, res) => {
      res.sendFile(indexHtml, (err) => {
        if (err) {
          logger.error({ err, indexHtml }, "Failed to send index.html");
          if (!res.headersSent) {
            res.status(500).send("Server error: could not load page");
          }
        }
      });
    });
  } else {
    logger.error(
      { frontendDist, indexHtml },
      "Frontend build not found! The dist/public directory is missing.",
    );
    app.get("/{*splat}", (_req, res) => {
      res.status(503).send("Application is starting up - frontend not yet available");
    });
  }
}

export default app;
