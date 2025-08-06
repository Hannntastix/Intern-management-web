// API route untuk mendapatkan status kuota magang
import connectMongoDB from '../../../lib/mongodb';
import Intern from '../../../models/internInfo';
import Kuota from '../../../models/kuota';

export async function GET() {
    await connectMongoDB();
    try {
        const now = new Date();
        const currentYear = now.getFullYear(); // 2025
        const currentMonth = now.getMonth() + 1; // 7 (karena getMonth() 0-11)

        // 1. Dapatkan tanggal awal dan akhir bulan ini
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0); // Trik JS: hari ke-0 bulan berikutnya adalah hari terakhir bulan ini

        // 2. Cari kuota yang ditetapkan untuk bulan ini
        const kuotaBulanIni = await Kuota.findOne({ bulan: currentMonth, tahun: currentYear });
        const kuotaMaksimal = kuotaBulanIni ? kuotaBulanIni.jumlahKuota : 0;

        // 3. Hitung jumlah intern yang aktif di bulan ini
        const jumlahSekarang = await Intern.countDocuments({
            status: 'aktif',
            tanggalMulai: { $lte: endOfMonth },
            tanggalSelesai: { $gte: startOfMonth }
        });

        // 4. Kirim hasilnya
        return new Response(JSON.stringify({
            kuotaMaksimal,
            jumlahSekarang,
            sisaKuota: kuotaMaksimal - jumlahSekarang
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
    }
}