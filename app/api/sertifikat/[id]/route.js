import connectMongoDB from "@/lib/mongodb";
import Sertifikat from "@/models/sertifikat";

export default async function handler(req, res) {
  await connectMongoDB();
  const { id } = req.query;

  if (req.method === "GET") {
    const data = await Sertifikat.findById(id);
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const updated = await Sertifikat.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await Sertifikat.findByIdAndDelete(id);
    return res.status(204).end();
  }

  return res.status(405).end("Method Not Allowed");
}
