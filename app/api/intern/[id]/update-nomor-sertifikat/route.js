import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Intern from '@/models/internInfo';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    const { nomorSertifikat } = await request.json();

    // Validate input
    if (!nomorSertifikat || typeof nomorSertifikat !== 'string' || nomorSertifikat.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Nomor sertifikat harus diisi dan tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // First, find the intern to verify it exists
    const existingIntern = await Intern.findById(id);
    if (existingIntern) {
    }

    // Find and update the intern
    const updatedIntern = await Intern.findByIdAndUpdate(
      id,
      { 
        nomorSertifikat: nomorSertifikat.trim(),
        updatedAt: new Date()
      },
      { new: true }
    );


    if (!updatedIntern) {
      return NextResponse.json(
        { success: false, message: 'Data peserta magang tidak ditemukan' },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      message: 'Nomor sertifikat berhasil diupdate',
      data: {
        id: updatedIntern._id,
        nomorSertifikat: updatedIntern.nomorSertifikat
      }
    });

  } catch (error) {
    console.error('Error updating nomor sertifikat:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat mengupdate nomor sertifikat' },
      { status: 500 }
    );
  }
}
