import { NextResponse } from "next/server";
import Assessment from "@/models/internAssesment";
import connectMongoDB from "@/lib/mongodb";

export async function POST(req) {
    await connectMongoDB();
    const body = await req.json();

    try {
        const newAssessment = new Assessment(body);
        await newAssessment.save();
        return NextResponse.json({ success: true, assessment: newAssessment });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const internId = searchParams.get("internId");

    try {
        const assessments = internId
            ? await Assessment.find({ internId })
            : await Assessment.find();

        return NextResponse.json({ success: true, assessments });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}

// DELETE: Hapus assessment berdasarkan ID
export async function DELETE(request) {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { success: false, message: "ID harus disediakan untuk menghapus penilaian." },
            { status: 400 }
        );
    }

    try {
        await Assessment.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Penilaian berhasil dihapus." });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}
