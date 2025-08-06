import mongoose from "mongoose";

const SertifikatSchema = new mongoose.Schema(
  {
    nim: {
      type: String,
      required: true,
      unique: true,
    },
    nama: String,
    instansi: String,
    program: String,
    kelas: String,
    kompetensi: String,
    tanggalMulai: Date,
    tanggalSelesai: Date,
    lamaMagang: String,
    templateId: String,
  },
  { timestamps: true }
);

export default mongoose.models.Sertifikat || mongoose.model("Sertifikat", SertifikatSchema);
