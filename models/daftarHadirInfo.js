import mongoose, { Schema } from "mongoose";

const DaftarHadirScheme = new Schema({
    idUser: {
        type: String,  // Mengubah tipe dari ObjectId ke String untuk kompatibilitas dengan Firebase uid
        required: true
    },
    absenDate: {
        type: Date,
        required: true
    },
    checkoutTime: {
        type: Date,
        required: false  // Optional untuk absen pulang
    },
    longCordinate: {
        type: Number,
        required: true
    },
    latCordinate: {
        type: Number,
        required: true,
    },
    checkoutLongCordinate: {
        type: Number,
        required: false  // Optional untuk koordinat checkout
    },
    checkoutLatCordinate: {
        type: Number,
        required: false  // Optional untuk koordinat checkout
    },
    keteranganMasuk: {
        type: String,
        required: true,
    },
    jenisAbsen: {
        type: String,
        enum: ['datang', 'pulang'],
        required: true
    },
    messageText: {
        type: String,
        required: true
    },
    checkoutMessageText: {
        type: String,
        required: false  // Optional untuk pesan checkout
    }
},{
    timestamps: true
});

// Cek apakah model sudah ada untuk mencegah error saat hot-reloading
const DaftarHadir = mongoose.models.DaftarHadir || mongoose.model('DaftarHadir', DaftarHadirScheme);

export default DaftarHadir;
