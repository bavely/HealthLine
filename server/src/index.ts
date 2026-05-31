import cors from "cors";
import dotenv from "dotenv";
import express, { type ErrorRequestHandler } from "express";
import { patientsRouter } from "./routes/patients";
import { summaryRouter } from "./routes/summary";
import { timelineRouter } from "./routes/timeline";

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",").map((origin) => origin.trim()) ?? true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "healthline-api" });
});

app.use("/api/patients", patientsRouter);
app.use("/api/patients", timelineRouter);
app.use("/api/patients", summaryRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = Number((error as { status?: number }).status) || 500;
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  res.status(status).json({
    error: status >= 500 && status !== 503 ? "Unexpected server error." : message
  });
};

app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => {
    console.log(`HealthLine API listening on http://localhost:${port}`);
  });
}
