import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DaftarHadir from "@/models/daftarHadirInfo";
import fetch from "node-fetch";
import Intern from "@/models/internInfo";

export async function POST(request) {
  try {
    // Ambil data dari request
    const { userId, nama, longCordinate, latCordinate, dailyNote } = await request.json();
    let KeteranganAbsen = "";
    let jam, menit, waktuResponse, waktuData, waktu;

    try {
      waktuResponse = await fetch("http://worldtimeapi.org/api/timezone/Asia/Jakarta");
      waktuData = await waktuResponse.json();
      waktu = new Date(waktuData.datetime);
      jam = waktu.getHours();
      menit = waktu.getMinutes();
    } catch (error) {
      waktuData = new Date();
      jam = waktuData.getHours();
      menit = waktuData.getMinutes();
    }

    // Validasi waktu dan set keterangan absen berdasarkan jam
    let jenisAbsen = "";
    
    if (jam < 12) {
      // Absen Datang (sebelum jam 12)
      jenisAbsen = "datang";
      if ((jam >= 5 && jam < 7) || (jam === 7 && menit <= 30)) {
        KeteranganAbsen = "Datang Tepat Waktu";
      } else if ((jam === 7 && menit > 30) || (jam > 7 && jam < 12)) {
        KeteranganAbsen = "Datang Terlambat";
      } else {
        return NextResponse.json({ 
          error: "Anda mengisi absen datang di luar jam yang ditentukan (05:00-11:59)" 
        }, { status: 400 });
      }
    } else {
      // Absen Pulang (jam 12 ke atas)
      jenisAbsen = "pulang";
      if (jam >= 12 && jam < 16) {
        KeteranganAbsen = "Pulang Cepat";
      } else if (jam === 16) {
        KeteranganAbsen = "Pulang Tepat Waktu";
      } else if (jam > 16 && jam < 23) {
        KeteranganAbsen = "Pulang Lembur";
      } else {
        return NextResponse.json({ 
          error: "Anda mengisi absen pulang di luar jam yang ditentukan (12:00-22:59)" 
        }, { status: 400 });
      }
    }

    // Connect ke MongoDB
    await connectMongoDB();

    // Validasi data
    if (!userId || !longCordinate || !latCordinate || !dailyNote) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek apakah sudah ada absen hari ini
    const today = new Date(waktuData);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAbsen = await DaftarHadir.findOne({
      idUser: userId,
      absenDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    let absensi;

    if (jenisAbsen === "datang") {
      if (existingAbsen) {
        return NextResponse.json({ 
          error: "Anda sudah melakukan absen datang hari ini" 
        }, { status: 400 });
      }

      // Buat absen datang baru
      absensi = new DaftarHadir({
        idUser: userId,
        absenDate: waktuData,
        longCordinate: parseFloat(longCordinate),
        latCordinate: parseFloat(latCordinate),
        messageText: dailyNote,
        keteranganMasuk: KeteranganAbsen,
        jenisAbsen: "datang"
      });

      await absensi.save();
    } else {
      // jenisAbsen === "pulang"
      if (!existingAbsen) {
        return NextResponse.json({ 
          error: "Anda belum melakukan absen datang hari ini" 
        }, { status: 400 });
      }

      if (existingAbsen.checkoutTime) {
        return NextResponse.json({ 
          error: "Anda sudah melakukan absen pulang hari ini" 
        }, { status: 400 });
      }

      // Update absen yang sudah ada dengan waktu pulang
      existingAbsen.checkoutTime = waktuData;
      existingAbsen.checkoutLongCordinate = parseFloat(longCordinate);
      existingAbsen.checkoutLatCordinate = parseFloat(latCordinate);
      existingAbsen.checkoutMessageText = dailyNote;
      existingAbsen.keteranganMasuk = `${existingAbsen.keteranganMasuk} | ${KeteranganAbsen}`;
      
      await existingAbsen.save();
      absensi = existingAbsen;
    }

    return NextResponse.json({
      message: jenisAbsen === "datang" ? "Absen datang berhasil disimpan" : "Absen pulang berhasil disimpan",
      absensi,
      jenisAbsen,
      redirectUrl: "/historiDaftarHadir",
    }, { status: 201 });

  } catch (error) {
    console.error("Error menyimpan absensi:", error);
    return NextResponse.json({ 
      error: "Terjadi kesalahan saat menyimpan absensi" 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Connect ke MongoDB
    await connectMongoDB();

    // Ambil parameter userId dan date dari URL jika ada
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    let query = {};
    if (userId) {
      query.idUser = userId;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.absenDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Ambil data absensi
    const absensiData = await DaftarHadir.find(query).sort({ absenDate: -1 });

    // Ambil semua data absensi intern untuk dicocokkan dengan idUser
    const internsData = await Intern.find({});
    const internsMap = {};
    internsData.forEach((intern) => {
      internsMap[intern.userId] = intern.nama;
    });

    // Gabungkan data absensi dengan nama Intern
    const absensiWithNames = absensiData.map((absen) => {
      const absenObj = absen.toObject();
      absenObj.nama = internsMap[absen.idUser] || "Nama tidak Ditemukan";
      return absenObj;
    });

    return NextResponse.json({ absensi: absensiWithNames }, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data absensi:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data absensi" }, { status: 500 });
  }
}
