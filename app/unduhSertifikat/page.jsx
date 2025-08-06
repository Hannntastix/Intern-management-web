"use client";

import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import PreviewSertifikat from "@/components/PreviewSertifikat";

export default function SertifikatUserPage() {
  const [user, setUser] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!user) return;

      try {
        const internRes = await axios.get(`/api/intern?userId=${user.uid}`);
        const nim = internRes.data.interns[0]?.nim;

        if (nim) {
          const certRes = await axios.get(`/api/user-sertifikat?nim=${nim}`);
          if (certRes.data.hasCertificate) {
            setCertificate(certRes.data.certificate);
          }
        }
      } catch (error) {
        console.error("Error fetching certificate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sertifikat Belum Tersedia
          </h2>
          <p className="text-gray-600">
            Silakan hubungi admin untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Sertifikat Magang
        </h1>
        <div className="mb-6">
          <PreviewSertifikat template={certificate} />
        </div>
        <div className="flex justify-center">
          <button
            onClick={() =>
              window.open(`/api/generate-pdf/${certificate._id}`, "_blank")
            }
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Unduh PDF
          </button>
        </div>
      </div>
    </div>
  );
}
