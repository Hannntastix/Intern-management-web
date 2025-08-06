import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["DEFAULT", "NON"],
      default: "NON",
    },
    elements: [
      {
        id: Number,
        label: String,
        value: String,
        top: Number,
        left: Number,
        fontSize: Number,
        fontWeight: String,
        fontFamily: String,
        maxWidth: Number,
        textAlign: String,
        transform: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Template || mongoose.model("Template", templateSchema);
