// app/api/template/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "../../../lib/mongodb";
import Template from "../../../models/Template";

// Initialize default template di database kalo belum ada
async function initializeDefaultTemplate() {
  await connectMongoDB();
  
  const existingTemplate = await Template.findOne({ status: "DEFAULT" });
  if (!existingTemplate) {
    const defaultTemplate = {
      nama: "MAGANG/KP/PKL",
      status: "DEFAULT",
      imageUrl: "/uploads/ornamen.png",
      elements: [
        {
          id: 1,
          label: "Judul",
          value: "SERTIFIKAT",
          top: 10,
          left: 50,
          fontSize: 25,
          fontWeight: "bold",
          textAlign: "center",
          transform: "translateX(-50%)",
        },
        {
          id: 2,
          label: "Nomor",
          value: "NO: 0001/BPS/1871/KPG/2025",
          top: 50,
          left: 50,
          fontSize: 15,
          textAlign: "center",
          transform: "translateX(-50%)",
        },
        {
          id: 3,
          label: "Sub Judul",
          value: "diberikan kepada:",
          top: 90,
          left: 50,
          fontSize: 13,
          textAlign: "center",
          transform: "translateX(-50%)",
        },
        {
          id: 4,
          label: "Nama Peserta",
          value: "Nama Peserta",
          top: 115,
          left: 50,
          fontSize: 28,
          fontFamily: "Great Vibes, cursive",
          textAlign: "center",
          transform: "translateX(-50%)",
        },
        {
          id: 5,
          label: "Deskripsi",
          value:
            "atas partisipasinya dalam kegiatan Magang/KP/PKL di lingkungan BPS Kota Bandar Lampung periode 16 Juni sampai 01 Agustus 2025",
          top: 160,
          left: 50,
          fontSize: 13,
          maxWidth: 500,
          textAlign: "center",
          transform: "translateX(-50%)",
        },
        {
          id: 6,
          label: "Tanggal",
          value: "Bandar Lampung, 05 Agustus 2025",
          top: 230,
          left: 50,
          fontSize: 13,
          textAlign: "center",
          transform: "translateX(-50%)",
        },
        {
          id: 7,
          label: "Jabatan",
          value: "Kepala Badan Pusat Statistik Kota Bandar Lampung",
          top: 265,
          left: 50,
          fontSize: 13,
          fontWeight: "bold",
          maxWidth: 300,
          textAlign: "center",
          transform: "translateX(-50%)",
        },
        {
          id: 8,
          label: "Nama Penandatangan",
          value: "Dr. Hady Suryono, M.Si",
          top: 360,
          left: 50,
          fontSize: 13,
          fontWeight: "bold",
          textAlign: "center",
          transform: "translateX(-50%)",
        },
      ],
    };
    
    await Template.create(defaultTemplate);
  }
}

// GET - Ambil semua template dari database
export async function GET() {
  try {
    await connectMongoDB();
    
    // Initialize default template jika belum ada
    // await initializeDefaultTemplate();
    
    // Hanya ambil templates dari database, tanpa manipulasi in-memory
    const templates = await Template.find({});
    
    // Jika tidak ada template, return empty array
    if (!templates || templates.length === 0) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// PUT - Update template yang udah ada
export async function PUT(request) {
  try {
    await connectMongoDB();
    const { _id, ...templateData } = await request.json();
    
    if (!_id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }
    
    // JANGAN adjust element positions - ini penyebab element makin turun ke bawah tiap kali save
    // Langsung update template tanpa manipulasi position
    const updatedTemplate = await Template.findByIdAndUpdate(
      _id,
      templateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// POST - Create new template (optional, kalo mau bikin template baru)
export async function POST(request) {
  try {
    await connectMongoDB();
    const templateData = await request.json();
    
    const newTemplate = await Template.create(templateData);
    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
