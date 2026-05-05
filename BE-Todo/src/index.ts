import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import taskRoutes from "./routes/taskRoutes";
import cors from "cors";
import logger from "./utils/logger";
import { httpLogger } from "./middlewares/httpLogger";

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

// Kết nối MongoDB
mongoose
  .connect(MONGO_URI, {
    // Thời gian tối đa để tìm primary mới sau khi failover (ms)
    serverSelectionTimeoutMS: 30000,
    // Tần suất driver ping để kiểm tra replica set health (ms)
    heartbeatFrequencyMS: 2000,
    // Timeout cho mỗi socket operation (ms)
    socketTimeoutMS: 45000,
    // Không buffer command khi mất kết nối → trả lỗi ngay, không timeout
    bufferCommands: false,
    // Thời gian chờ kết nối mới được thiết lập (ms)
    connectTimeoutMS: 10000,
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
    message: "CI/CD Pipeline is working perfectly!",
    // message: "CI/CD Pipeline is working again for testing!",
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
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});