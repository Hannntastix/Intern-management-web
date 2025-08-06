// app/api/upload/route.js
import { writeFile } from "fs/promises";
import path from "path";

export const POST = async (req) => {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = file.name;
  const filePath = path.join(process.cwd(), "public/uploads", fileName);

  await writeFile(filePath, buffer);

  return new Response(JSON.stringify({ url: `/uploads/${fileName}` }), { status: 200 });
};
