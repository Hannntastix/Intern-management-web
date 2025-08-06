import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    // Extract token
    const token = authHeader.substring(7);
    
    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Return user ID and roles
    return NextResponse.json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "user"
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Invalid token" 
    }, { status: 403 });
  }
}
