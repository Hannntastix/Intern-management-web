import { NextResponse } from "next/server";
import { auth } from "@/app/firebase/config";
import connectMongoDB from "@/lib/mongodb";
import { Intern } from "@/models/internInfo";

export async function GET(request) {
  try {
    await connectMongoDB();
    
    // Get user ID from authentication cookie/session
    const authHeader = request.headers.get("authorization");
    let userId = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Handle Firebase token
      const token = authHeader.substring(7);
      try {
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error("Error verifying token:", error);
      }
    }
    
    // If no userId was found, return unauthorized
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    // Find the intern data using the userId
    const internData = await Intern.findOne({ userId });
    
    if (!internData) {
      return NextResponse.json({ 
        success: false, 
        message: "User data not found" 
      }, { status: 404 });
    }
    
    // Return user data
    return NextResponse.json({
      success: true,
      nim: internData.nim,
      nama: internData.nama,
      prodi: internData.prodi,
      kampus: internData.kampus,
      userId: internData.userId,
      isSertifikatVerified: internData.isSertifikatVerified
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}
