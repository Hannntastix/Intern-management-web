import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectMongoDB from "../lib/mongodb.js";
import DaftarHadir from "../models/daftarHadirInfo.js";
import dotenv from "dotenv";

dotenv.config();

async function migrateAbsenData() {
  console.log("🚀 Starting migration script...");
  try {
    await connectMongoDB();
    console.log("✅ Connected to MongoDB");

    const absenData = await DaftarHadir.find({
      $or: [{ jenisAbsen: { $exists: false } }, { jenisAbsen: null }],
    }).lean(); // pake lean biar bisa di-backup langsung

    console.log(`📦 Found ${absenData.length} records to migrate`);

    // Backup dulu
    const backupPath = path.join(process.cwd(), "absen_backup.json");
    fs.writeFileSync(backupPath, JSON.stringify(absenData, null, 2));
    console.log(`💾 Backup saved to ${backupPath}`);

    let updateCount = 0;

    for (const absen of absenData) {
      try {
        const absenDate = new Date(absen.absenDate);
        const jam = absenDate.getHours();

        const jenisAbsen = jam < 12 ? "datang" : "pulang";

        const updateFields = {
          jenisAbsen,
        };

        // Field optional diset null kalau kosong
        ["checkoutTime", "checkoutLongCordinate", "checkoutLatCordinate", "checkoutMessageText"].forEach((field) => {
          if (!absen[field]) updateFields[field] = null;
        });

        await DaftarHadir.findByIdAndUpdate(absen._id, updateFields, {
          new: true,
          runValidators: true,
        });

        updateCount++;
        console.log(`✅ Updated ${updateCount}/${absenData.length} - ID: ${absen._id}, Time: ${jam}:00, Type: ${jenisAbsen}`);
      } catch (itemError) {
        console.error(`❌ Error updating record ${absen._id}:`, itemError);
      }
    }

    console.log(`🎉 Migration completed! Total updated: ${updateCount} records.`);
  } catch (error) {
    console.error("🔥 Migration failed:", error);
  } finally {
    try {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed");
      process.exit(0);
    } catch (err) {
      console.error("❗ Error closing MongoDB connection:", err);
      process.exit(1);
    }
  }
}

migrateAbsenData();
