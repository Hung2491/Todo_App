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
  .connect(MONGO_URI)
  .then(() => logger.info("✅ Connected to MongoDB", { uri: MONGO_URI.replace(/:\/\/.*@/, "://***@") }))
  .catch((err) => logger.error("❌ MongoDB connection error", { error: err.message }));

// Routes
app.use("/tasks", taskRoutes);

// Khởi động server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});