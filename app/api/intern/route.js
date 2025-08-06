import Intern from "@/models/internInfo";
import connectMongoDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "../../../models/User";

export async function GET(request) {
    try {
        await connectMongoDB();

        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month");
        const userId = searchParams.get("userId");
        const email = searchParams.get("email");

        // Jika ada userId, cari berdasarkan userId
        if (userId) {
            const intern = await Intern.findOne({ userId }).populate('pembimbing', 'nama');
            return NextResponse.json({ interns: intern ? [intern] : [] });
        }

        // Jika ada email, cari berdasarkan email
        if (email) {
            const intern = await Intern.findOne({ email }).populate('pembimbing', 'nama');
            return NextResponse.json({ interns: intern ? [intern] : [] });
        }

        // Logic bulan tetap sama
        if (month) {
            const [year, mon] = month.split("-").map(Number);
            const startOfMonth = new Date(year, mon - 1, 1);
            const endOfMonth = new Date(year, mon, 0, 23, 59, 59, 999);

            const interns = await Intern.find({
                tanggalMulai: { $lte: endOfMonth },
                tanggalSelesai: { $gte: startOfMonth },
            })
                .populate('pembimbing')
                .sort({ nama: 1 });

            return NextResponse.json({ interns });
        }

        // Default: return semua interns
        const interns = await Intern.find().populate('pembimbing', 'nama');
        return NextResponse.json({ interns });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data intern", error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();


        const {
            nama, nim, nik, prodi, kampus,
            tanggalMulai, tanggalSelesai,
            divisi, status, pembimbing, userId, email,
            createdAt
        } = body;

        if (!nama || !nim || !nik || !prodi || !kampus || !tanggalMulai || !tanggalSelesai || !userId || !email) {
            return NextResponse.json(
                { message: "Semua field wajib harus diisi" },
                { status: 400 }
            );
        }

        const startDate = new Date(tanggalMulai);
        const endDate = new Date(tanggalSelesai);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json(
                { message: "Format tanggal tidak valid" },
                { status: 400 }
            );
        }

        if (startDate >= endDate) {
            return NextResponse.json(
                { message: "Tanggal mulai harus lebih awal dari tanggal selesai" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const existingNik = await Intern.findOne({ nik });
        if (existingNik) {
            return NextResponse.json(
                { message: "NIK sudah terdaftar, silakan gunakan NIK lain." },
                { status: 409 }
            );
        }

        const existingUserId = await Intern.findOne({ userId });
        if (existingUserId) {
            return NextResponse.json(
                { message: "User sudah terdaftar sebagai intern." },
                { status: 409 }
            );
        }

        const internData = {
            nama,
            nim,
            nik,
            prodi,
            kampus,
            tanggalMulai: startDate,
            tanggalSelesai: endDate,
            divisi: divisi || "-",
            status: status || "pending",
            pembimbing: null,
            userId,
            email,
            createdAt: createdAt ? new Date(createdAt) : new Date()
        };


        const newIntern = await Intern.create(internData);


        return NextResponse.json(
            {
                message: "Data intern berhasil ditambahkan",
                intern: newIntern
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("POST Error details:", error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            const fieldName = duplicateField === 'nik' ? 'NIK' :
                duplicateField === 'nim' ? 'NIM' :
                    duplicateField === 'email' ? 'Email' :
                        duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1);

            return NextResponse.json(
                { message: `${fieldName} yang Anda masukkan sudah terdaftar.` },
                { status: 409 }
            );
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                {
                    message: "Data tidak valid",
                    errors: validationErrors,
                    details: error.message
                },
                { status: 400 }
            );
        }

        if (error.name === 'CastError') {
            return NextResponse.json(
                {
                    message: `Format data tidak valid untuk field ${error.path}`,
                    details: error.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                message: "Terjadi kesalahan pada server.",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const id = request.nextUrl.searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { message: "ID intern diperlukan" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const deletedIntern = await Intern.findByIdAndDelete(id);

        if (!deletedIntern) {
            return NextResponse.json(
                { message: "Data intern tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Data intern berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json(
            { message: "Gagal menghapus data intern", error: error.message },
            { status: 500 }
        );
    }
}