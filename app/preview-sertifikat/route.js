import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// GET /api/preview-sertifikat?id=abc123
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID sertifikat tidak diberikan" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "sertifikat", `${id}.pdf`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ message: "Sertifikat tidak ditemukan" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline", // untuk ditampilkan di iframe
    },
  });
}
