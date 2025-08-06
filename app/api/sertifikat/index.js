import connectMongoDB from "@/lib/mongodb";
import Sertifikat from "@/models/Sertifikat";

export default async function handler(req, res) {
  await connectMongoDB();

  if (req.method === "GET") {
    const data = await Sertifikat.find({});
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const baru = await Sertifikat.create(req.body);
    return res.status(201).json(baru);
  }

  return res.status(405).end("Method Not Allowed");
}
