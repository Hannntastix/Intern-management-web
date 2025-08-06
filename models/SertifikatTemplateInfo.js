import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema({
  nama: String,
  status: { type: String, default: "DEFAULT" },
  imageUrl: String, // URL gambar
}, { timestamps: true });

export default mongoose.models.Template || mongoose.model("Template", TemplateSchema);
