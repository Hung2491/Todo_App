import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/ts-crud";

async function verifyDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối MongoDB ở cổng 27017 thành công");
    
    const collections = await mongoose.connection.db!.listCollections().toArray();
    console.log("📂 Các bảng (collections) đang có trong database ts-crud:", collections.map(c => c.name));

    const count = await mongoose.connection.db!.collection('tasks').countDocuments();
    console.log(`📝 Tìm thấy ${count} công việc (tasks) trong database`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
}

verifyDB();
