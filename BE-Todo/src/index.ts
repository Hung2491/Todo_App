import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import taskRoutes from "./routes/taskRoutes";
import cors from "cors";
import logger from "./utils/logger";
import { httpLogger } from "./middlewares/httpLogger";
import { mongoSanitize } from "./middlewares/sanitize";

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ts-crud";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3002";

// Middleware cho CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
  })
);

// HTTP Request Logger (phải đặt trước routes)
app.use(httpLogger);

// Middleware để parse body JSON và form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize NoSQL injection attempts
app.use(mongoSanitize);

// Kết nối MongoDB
mongoose
  .connect(MONGO_URI, {
    // Phát hiện primary down nhanh hơn (ping mỗi 1s thay vì 2s)
    heartbeatFrequencyMS: 1000,
    // Thời gian tối đa chờ tìm primary mới sau failover
    serverSelectionTimeoutMS: 15000,
    // Timeout cho mỗi socket operation
    socketTimeoutMS: 20000,
    // Timeout kết nối ban đầu
    connectTimeoutMS: 5000,
    // Connection pool: tái dùng connection thay vì tạo mới
    maxPoolSize: 10,
    minPoolSize: 2,
    // Tắt driver-level retry writes → backend tự trả 503 rõ ràng
    retryWrites: false,
  })
  .then(() => logger.info("✅ Connected to MongoDB", { uri: MONGO_URI.replace(/:\/\/.*@/, "://***@") }))
  .catch((err) => logger.error("❌ MongoDB connection error", { error: err.message }));

// Lắng nghe sự kiện connection để log failover
mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ MongoDB disconnected - waiting for replica failover...");
});
mongoose.connection.on("reconnected", () => {
  logger.info("✅ MongoDB reconnected to new primary");
});
mongoose.connection.on("error", (err) => {
  logger.error("❌ MongoDB connection error", { error: err.message });
});

import { metricsRegister } from "./utils/metrics";

// Health check endpoint (dùng cho Docker healthcheck)
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message:
      //  "CI/CD Pipeline is working perfectly!",
      "CI/CD Pipeline is working again for testing!",
    timestamp: new Date().toISOString()
  });
});

// Prometheus metrics endpoint
app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Routes
app.use("/tasks", taskRoutes);

// Khởi động server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await mongoose.connection.close(false);
      logger.info("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      logger.error("Error during graceful shutdown", { error: (err as Error).message });
      process.exit(1);
    }
  });

  // Force shutdown after 10s if hanging
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));