// models/Kuota.js
import mongoose from "mongoose";
import { Schema } from "mongoose";

const kuotaSchema = new Schema({
    // Contoh: 7 (untuk Juli)
    bulan: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    // Contoh: 2025
    tahun: {
        type: Number,
        required: true,
    },
    // Jumlah maksimal anak magang di bulan dan tahun tsb
    jumlahKuota: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    // Menambahkan unique compound index
    // Ini memastikan tidak ada entri duplikat untuk bulan dan tahun yang sama
    timestamps: true
});

kuotaSchema.index({ bulan: 1, tahun: 1 }, { unique: true });

const Kuota = mongoose.models.Kuota || mongoose.model("Kuota", kuotaSchema);

export default Kuota;