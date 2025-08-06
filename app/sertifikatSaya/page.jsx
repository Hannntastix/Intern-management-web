"use client";
import { useState, useEffect, useRef } from "react";
import PreviewSertifikat from "@/components/PreviewSertifikat";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useReactToPrint } from "react-to-print";

// Import styles module
import styles from "./sertifikatSaya.module.css";
// Import global print styles
import "./print.css";

export default function SertifikatSaya() {
  const [sertifikat, setSertifikat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [userInternData, setUserInternData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sertifikatRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth < 768; // 768px adalah breakpoint untuk tablet/desktop
      setIsMobile(isMobileDevice);
      
      if (isMobileDevice) {
        // Redirect ke halaman mobile atau tampilkan pesan
        window.location.href = '/mobile-not-supported';
        return;
      }
    };

    // Check on mount
    checkDevice();

    // Check on resize
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Konfigurasi untuk mencetak hanya bagian sertifikat (sebagai alternatif)
  const handlePrint = useReactToPrint({
    contentRef: sertifikatRef,
    documentTitle: `Sertifikat_${userInternData?.nama || "Peserta"}_BPS`,
    pageStyle: `
      @page {
        size: landscape;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        html {
          zoom: 160%;
          -ms-zoom: 160%;
          -webkit-zoom: 160%;
        }
        @-moz-document url-prefix() {
          body {
            transform: scale(1.6);
            transform-origin: top left;
          }
        }
      }
    `,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        if (sertifikat && sertifikatRef.current) {
          resolve();
        } else {
          console.error("Tidak ada sertifikat yang dapat dicetak");
        }
      });
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Tunggu hingga auth state siap
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Dapatkan data intern berdasarkan user.uid dengan query parameter yang benar
            const res = await fetch(`/api/intern?userId=${user.uid}&${new Date().getTime()}`);
            const data = await res.json();

            // Ambil data intern pertama (karena query userId hanya mengembalikan 1 data)
            const myInternData = data.interns[0];

            if (myInternData && myInternData.isSertifikatVerified) {
              setUserInternData(myInternData);
              // Dapatkan template untuk sertifikat
              await generateCertificate(myInternData);
            } else {
              console.log(
                "Sertifikat belum diverifikasi atau data tidak ditemukan"
              );
            }
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fungsi untuk refresh data
  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Fetch data terbaru dengan query parameter yang benar
        const res = await fetch(`/api/intern?userId=${user.uid}&${new Date().getTime()}`);
        const data = await res.json();

        const myInternData = data.interns[0];

        if (myInternData && myInternData.isSertifikatVerified) {
          setUserInternData(myInternData);
          await generateCertificate(myInternData);
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fungsi untuk generate sertifikat dari template
  const generateCertificate = async (internData) => {
    try {
      
      const res = await fetch("/api/template");
      const templates = await res.json();

      if (Array.isArray(templates) && templates.length > 0) {
        // Ambil template DEFAULT
        const defaultTemplate = templates.find(t => t.status === "DEFAULT") || templates[0];
        
        // Format tanggal untuk tampilan sertifikat (contoh: 01 Januari 2025)
        const formatTanggalIndonesia = (dateStr) => {
          if (!dateStr) return "-";
          const date = new Date(dateStr);
          const options = { day: "numeric", month: "long", year: "numeric" };
          return date.toLocaleDateString("id-ID", options);
        };

        const tanggalMulaiFormatted = formatTanggalIndonesia(
          internData.tanggalMulai
        );
        const tanggalSelesaiFormatted = formatTanggalIndonesia(
          internData.tanggalSelesai
        );

        // Tanggal saat ini untuk "Bandar Lampung, tanggal saat ini"
        const today = new Date();
        const tanggalSaatIni = formatTanggalIndonesia(today);

        // Hitung lama magang dalam bulan atau hari
        const lamaMagang = calculateDuration(
          internData.tanggalMulai,
          internData.tanggalSelesai
        );

        // Customize template dengan data intern
        const customizedTemplate = {
          ...defaultTemplate,
          elements: defaultTemplate.elements.map((el) => {
            
            // Customize fields based on the element ID and label
            if (el.label === "Nama Peserta") {
              return { ...el, value: internData.nama };
            } else if (
              // Match based on ID (from template structure, nomor is ID 2)
              el.id === 2 || 
              // Also match by label variations
              el.label === "Nomor Sertifikat" || 
              el.label === "No. Sertifikat" ||
              el.label === "Nomor" ||
              el.label === "No" ||
              el.label === "Certificate Number" ||
              el.label.toLowerCase().includes("nomor") || 
              el.label.toLowerCase().includes("no.") ||
              el.label.toLowerCase().includes("sertifikat") ||
              el.label.toLowerCase().includes("certificate")
            ) {
              const nomorValue = internData.nomorSertifikat || "No. [BELUM DIISI]";
              return { ...el, value: nomorValue };
            } else if (el.id === 5 && el.label === "Deskripsi") {
              return {
                ...el,
                value: `atas partisipasinya dalam kegiatan Magang/KP/PKL di lingkungan BPS Kota Bandar Lampung periode ${tanggalMulaiFormatted} sampai ${tanggalSelesaiFormatted}`,
              };
            } else if (el.id === 6 && el.label === "Tanggal") {
              return { ...el, value: `Bandar Lampung, ${tanggalSaatIni}` };
            } else if (
              el.label === "Tanggal Mulai" ||
              el.label.includes("mulai")
            ) {
              return { ...el, value: tanggalMulaiFormatted };
            } else if (
              el.label === "Tanggal Selesai" ||
              el.label.includes("selesai")
            ) {
              return { ...el, value: tanggalSelesaiFormatted };
            } else if (
              el.label === "Lama Magang" ||
              el.label.includes("lama")
            ) {
              return { ...el, value: lamaMagang };
            } else if (el.label === "Program Studi" || el.label === "Prodi") {
              return { ...el, value: internData.prodi };
            } else if (
              el.label === "Sekolah" ||
              el.label === "Perguruan Tinggi" ||
              el.label.includes("kampus")
            ) {
              return { ...el, value: internData.kampus };
            }
            return el;
          }),
        };

        setSertifikat(customizedTemplate);
      }
    } catch (error) {
    }
  };

  // Helper function untuk menghitung durasi magang
  const calculateDuration = (start, end) => {
    if (!start || !end) return "-";

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Hitung selisih dalam hari
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan`;
    } else {
      return `${diffDays} hari`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Early return for mobile devices
  if (isMobile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Desktop Only
          </h2>
          <p className="text-gray-600 mb-4">
            Fitur ini hanya tersedia di desktop. Silakan akses melalui komputer atau laptop.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!sertifikat) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sertifikat Belum Tersedia
          </h2>
          <p className="text-gray-600 mb-4">
            {userInternData
              ? userInternData.isSertifikatVerified
                ? "Sedang memuat sertifikat..."
                : "Sertifikat Anda belum diverifikasi oleh admin."
              : "Data magang Anda tidak ditemukan."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Sertifikat Magang
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefreshData}
              disabled={refreshing}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors flex items-center"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memuat...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Perbarui Data
                </>
              )}
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div
            ref={sertifikatRef}
            className={`print-container ${styles.printWrapper}`}
            style={{ margin: "0 auto" }}
          >
            <PreviewSertifikat template={sertifikat} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handlePrint}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11V3m0 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
            Download PDF
          </button>

          {userInternData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 sm:mt-0">
              <p className="text-green-700">
                <span className="font-semibold">Status: </span>
                Terverifikasi ✓
              </p>
              <p className="text-sm text-green-600 mt-1">
                Sertifikat ini telah diverifikasi oleh admin BPS
              </p>
              {userInternData.nomorSertifikat && (
                <p className="text-sm text-green-600 mt-1">
                  <span className="font-semibold">Nomor Sertifikat: </span>
                  {userInternData.nomorSertifikat}
                </p>
              )}
              {!userInternData.nomorSertifikat && (
                <p className="text-sm text-red-600 mt-1">
                  <span className="font-semibold">Nomor Sertifikat: </span>
                  Belum diisi oleh admin
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Debug info - User ID: {userInternData.userId} | Nama: {userInternData.nama}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
