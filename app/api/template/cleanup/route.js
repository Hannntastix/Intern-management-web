import { NextResponse } from "next/server";
import connectMongoDB from "../../../../lib/mongodb";
import Template from "../../../../models/Template";

// DELETE - Remove all templates except DEFAULT one
export async function DELETE() {
  try {
    await connectMongoDB();
    
    // Delete all templates except the DEFAULT one
    const result = await Template.deleteMany({ status: { $ne: "DEFAULT" } });
    
    return NextResponse.json({ 
      message: `Berhasil menghapus ${result.deletedCount} template yang tidak dipakai`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error cleaning up templates:", error);
    return NextResponse.json({ error: "Failed to clean up templates" }, { status: 500 });
  }
} 