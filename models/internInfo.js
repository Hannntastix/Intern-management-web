import mongoose from "mongoose";
import { Schema } from "mongoose";

const internSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nama: {
      type: String,
      required: true,
    },
    nim: {
      type: String,
      required: true,
    },
    nik: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    prodi: {
      type: String,
      required: true,
    },
    kampus: {
      type: String,
      required: true,
    },
    tanggalMulai: {
      type: Date,
      required: true,
    },
    tanggalSelesai: {
      type: Date,
      required: true,
    },
    divisi: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["aktif", "selesai", "dikeluarkan", "pending"],
      default: "pending",
    },
    pembimbing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pembimbing",
      default: null,
    },
    isSertifikat: {
      type: Boolean,
      default: false,
    },
    nomorSertifikat: {
      type: String,
      // nomorSertifikatnya bisa null ya bestie~
      default: null,
    },
    isSertifikatVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Intern = mongoose.models.Intern || mongoose.model("Intern", internSchema);

export { Intern };
export default Intern;
