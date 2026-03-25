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

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const candidatePaths = [
  path.resolve(currentDir, "public"),
  path.resolve(process.cwd(), "dist", "public"),
  path.resolve(process.cwd(), "artifacts", "api-server", "dist", "public"),
];

let frontendDist: string | null = null;
let indexHtml: string | null = null;

for (const candidate of candidatePaths) {
  const candidateIndex = path.join(candidate, "index.html");
  if (existsSync(candidateIndex)) {
    frontendDist = candidate;
    indexHtml = candidateIndex;
    break;
  }
}

logger.info(
  {
    frontendDist,
    indexHtml,
    frontendFound: frontendDist !== null,
    currentDir,
    cwd: process.cwd(),
    candidatePaths,
    NODE_ENV: process.env.NODE_ENV,
  },
  "Frontend path resolution",
);

if (frontendDist && indexHtml) {
  app.use(express.static(frontendDist));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(indexHtml!, (err) => {
      if (err) {
        logger.error({ err, indexHtml }, "Failed to send index.html");
        if (!res.headersSent) {
          res.status(500).send("Server error: could not load page");
        }
      }
    });
  });

  logger.info({ frontendDist }, "Frontend static serving enabled");
} else {
  logger.warn(
    { candidatePaths },
    "Frontend build not found in any candidate path — static serving disabled",
  );
}

export default app;
