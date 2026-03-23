import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import taskRoutes from "./routes/taskRoutes";
import cors from "cors";

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

// Middleware để parse body JSON và form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/tasks", taskRoutes);

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});