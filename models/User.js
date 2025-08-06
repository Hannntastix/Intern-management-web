import mongoose from "mongoose";

const SertifikatMagangSchema = new mongoose.Schema({
  idMagang: String,
  nama: String,
  tanggalMulai: String,
  tanggalSelesai: String,
  lamaMagang: String,
  ditambahkanPada: Date,
});

const UserSchema = new mongoose.Schema({
  nis: { type: String, required: true, unique: true },
  nama: String,
  email: String,
  // kolom lain
  sertifikatMagang: [SertifikatMagangSchema],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
