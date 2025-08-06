import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../lib/mongodb";
import Intern from "../../../../../models/internInfo";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    console.log("Received ID for verification:", id);
    
    // More detailed error message for invalid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid MongoDB ObjectID format:", id);
      return NextResponse.json(
        { success: false, message: `ID tidak valid: ${id}. Format ID harus sesuai dengan MongoDB ObjectID.` },
        { status: 400 }
      );
    }
    
    await connectMongoDB();
    
    const intern = await Intern.findById(id);
    
    if (!intern) {
      return NextResponse.json(
        { success: false, message: "Intern not found" },
        { status: 404 }
      );
    }
    
    // Update the verification status using updateOne to bypass validation
    await Intern.updateOne(
      { _id: id },
      { $set: { isSertifikatVerified: true } },
      { runValidators: false }
    );
    
    return NextResponse.json({
      success: true,
      message: "Certificate verification status updated successfully"
    });
  } catch (error) {
    console.error("Error in verify-sertifikat:", error.message);
    // Log detail error untuk pembimbing jika itu masalahnya
    if (error.message && error.message.includes('pembimbing')) {
      console.error("Pembimbing validation error details:", error.errors?.pembimbing);
    }
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}