import mongoose, { Schema } from "mongoose";

const IzinScheme = new Schema({
    idUser: {
        type: String,  // Mengubah tipe dari ObjectId ke String untuk kompatibilitas dengan Firebase uid
        required: true
    },
    izinDate: {
        type: Date,
        required: true
    },
    keteranganIzin: {
        type: String,
        required: true,
    },
    messageIzin: {
        type: String,
        required: true
    },
    linkBukti: {
        type: String,
        required: false
    }
},{
    timestamps: true
});

// Cek apakah model sudah ada untuk mencegah error saat hot-reloading
const Izin = mongoose.models.Izin || mongoose.model('Izin', IzinScheme);

export default Izin;
