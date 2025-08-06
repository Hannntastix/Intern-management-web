import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/firebase-admin"; // jika pakai Firebase
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const nis = searchParams.get("nis");

    if (!nis) {
      return NextResponse.json({ message: "NIS is required" }, { status: 400 });
    }

    const user = await User.findOne({ nis });

    if (!user || !user.sertifikatMagang || user.sertifikatMagang.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    const latest = user.sertifikatMagang[user.sertifikatMagang.length - 1];

    return NextResponse.json(latest, { status: 200 });
  } catch (error) {
    console.error("❌ Error GET /api/user/sertifikat:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
