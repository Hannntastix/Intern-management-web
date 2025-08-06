import connectMongoDB from "../../../lib/mongodb";
import User from "../../../models/userInfo";
import { NextResponse } from "next/server";

// Endpoint untuk mendapatkan username berdasarkan email (menggunakan POST)
export async function POST(request) {
    try {
        // Ambil email dari body request
        const { email } = await request.json();
        
        if (!email) {
            return NextResponse.json({ 
                success: false, 
                message: "Email tidak diberikan" 
            }, { status: 400 });
        }
        
        // Koneksi ke database
        await connectMongoDB();
        
        // Cari user berdasarkan email
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "User tidak ditemukan" 
            }, { status: 404 });
        }
        
        // Kembalikan data username
        return NextResponse.json({ 
            success: true, 
            username: user.username 
        });
        
    } catch (error) {
        console.error("Error saat mengambil data user:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Terjadi kesalahan saat mengambil data user"
        }, { status: 500 });
    }
}

// Jika ingin menyediakan juga endpoint GET (opsional)
export async function GET(request) {
    try {
        // Hanya untuk admin - mendapatkan semua username
        await connectMongoDB();
        const users = await User.find({}, { username: 1, email: 1, _id: 0 });
        
        return NextResponse.json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Error saat mengambil data users:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Terjadi kesalahan saat mengambil data users" 
        }, { status: 500 });
    }
}
