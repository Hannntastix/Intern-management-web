import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";  // Tambahkan import ini
import path from "path";

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded." }), {
        status: 400,
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Buat directory jika belum ada
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Simpan file ke folder /public/uploads
    await writeFile(path.join(uploadDir, filename), buffer);
    const fileUrl = `/uploads/${filename}`;

    return new Response(JSON.stringify({ 
      url: fileUrl, 
      message: "File uploaded successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to upload file" }), 
      { status: 500 }
    );
  }
}
