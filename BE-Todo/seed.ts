import mongoose from "mongoose";
import Task from "./src/models/Task";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

// Đọc URI từ file .env để chạy được với cấu hình có mật khẩu của bạn
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ts-crud";

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Task.deleteMany({});
    console.log("✅ Cleared existing tasks");

    await Task.insertMany(seedData);
    console.log("✅ Seeded data successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDB();
