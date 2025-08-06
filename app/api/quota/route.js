// pages/api/kuota.js
import Kuota from '@/models/kuota'; // Pastikan path model Kuota benar // Asumsi Anda punya file koneksi DB
import connectMongoDB from '@/lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'PUT') { // GANTI DI SINI
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    await connectMongoDB(); // Hubungkan ke database

    const { bulan, tahun, jumlahKuota } = req.body;

    if (!bulan || !tahun || jumlahKuota === undefined) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    try {
        const updatedKuota = await Kuota.findOneAndUpdate(
            { bulan, tahun },
            { jumlahKuota },
            { new: true, upsert: true, runValidators: true }
        );
        return res.status(200).json(updatedKuota);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
}