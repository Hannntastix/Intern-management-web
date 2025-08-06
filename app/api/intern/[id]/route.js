import connectMongoDB from "../../../../lib/mongodb";
import Intern from "./../../../../models/internInfo";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    const { id } = params;
    console.log('🚀 PUT /api/intern/[id] called for ID:', id);

    const {
        newNama: nama,
        newNim: nim,
        newNik: nik,
        newProdi: prodi,
        newKampus: kampus,
        newTanggalMulai: tanggalMulai,
        newTanggalSelesai: tanggalSelesai,
        newDivisi: divisi,
        newStatus: status,
        newPembimbing: pembimbing,
        newUserId: userId,
        newEmail: email,
        newNomorSertifikat: nomorSertifikat,
    } = await request.json();

    console.log('Received update data:', {
        nama, nim, prodi, kampus, tanggalMulai, tanggalSelesai, nomorSertifikat
    });

    await connectMongoDB();

    // First, find the intern to verify it exists
    const existingIntern = await Intern.findById(id);
    console.log('Existing intern found:', existingIntern ? 'Yes' : 'No');
    if (existingIntern) {
        console.log('Current nomorSertifikat:', existingIntern.nomorSertifikat);
    }

    const updateResult = await Intern.findByIdAndUpdate(id, {
        nama,
        nim,
        nik,
        prodi,
        kampus,
        tanggalMulai,
        tanggalSelesai,
        divisi,
        status,
        pembimbing,
        userId,
        email,
        nomorSertifikat
    }, { new: true });

    console.log('Update result:', updateResult);
    if (updateResult) {
        console.log('Final nomorSertifikat in database:', updateResult.nomorSertifikat);
    }

    return NextResponse.json({ message: "Data intern berhasil diperbarui" }, { status: 200 });
}

export async function GET(request, { params }) {
    const { id } = params;
    await connectMongoDB();
    const intern = await Intern.findById(id).populate('pembimbing', 'nama');
    return NextResponse.json({ intern }, { status: 200 });
}
