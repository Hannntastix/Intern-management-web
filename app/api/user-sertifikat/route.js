import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Definisikan schema untuk sertifikat
const sertifikatSchema = new mongoose.Schema({
  nim: String,
  nama: String,
  idMagang: String,
  tanggalMulai: Date,
  tanggalSelesai: Date,
  lamaMagang: String,
  createdAt: { type: Date, default: Date.now }
});

// Buat model jika belum ada
const Sertifikat = mongoose.models.Sertifikat || mongoose.model('Sertifikat', sertifikatSchema);

export async function POST(request) {
  try {
    await connectMongoDB();
    
    const data = await request.json();
    const sertifikat = await Sertifikat.create(data);

    return NextResponse.json({ 
      success: true, 
      message: "Sertifikat berhasil ditambahkan",
      data: sertifikat 
    });
  } catch (error) {
    console.error("Error creating certificate:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Gagal menambahkan sertifikat" 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const nim = searchParams.get("nim");

    const sertifikat = await Sertifikat.findOne({ nim });

    return NextResponse.json({
      hasCertificate: !!sertifikat,
      certificate: sertifikat
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json({ 
      hasCertificate: false,
      message: "Gagal mengambil data sertifikat" 
    }, { status: 500 });
  }
}
