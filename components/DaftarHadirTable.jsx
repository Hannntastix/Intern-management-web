"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./../app/firebase/config";
import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { getPreciseDistance } from "geolib";

export default function DaftarHadirTable() {
  const [data, setData] = useState({ absensi: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [nullLength, setNullLength] = useState(false);
  const [latCenter, setLatCenter] = useState(null);
  const [longCenter, setLongCenter] = useState(null);
  const [internList, setInternList] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "attendance"
  const [userInternData, setUserInternData] = useState(null);

  // Handler untuk mengambil lokasi pusat yang ditentukan admin
  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        const response = await axios.get("/api/geofencing");
        if (response.data) {
          setLatCenter(response.data.latitude);
          setLongCenter(response.data.longitude);
        }
      } catch (error) {
        console.error("Error loading current settings:", error);
      }
    };

    loadCurrentSettings();
  }, []);

  // Auth state dan role management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const token = await user.getIdTokenResult();
          setUserId(token.claims.user_id);
          setRole(token.claims.role);
          
          // Log role status
          if (token.claims.role === "admin") {
            console.log("👑 Ini admin");
            // Fetch list of interns if admin
            fetchInternList();
          } else {
            console.log("🙅‍♂️ Bukan admin");
          }
        } catch (error) {
          console.error("Error getting token:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch list of all interns (for admin)
  const fetchInternList = async () => {
    try {
      const response = await axios.get("/api/intern");
      if (response.data && response.data.interns) {
        setInternList(response.data.interns);
      }
    } catch (error) {
      console.error("Error fetching intern list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance data for a specific intern
  const fetchAttendanceForIntern = async (internId) => {
    setIsLoading(true);
    try {
      const url = "/api/absen";
      const config = { params: { userId: internId } };
      
      console.log(`Fetching attendance data for intern ID: ${internId}`);
      
      const response = await axios.get(url, config);
      setData(response.data.absensi?.length ? response.data : setNullLength(true));
      setViewMode("attendance");
    } catch (err) {
      console.error("Fetch attendance error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance data for regular users
  useEffect(() => {
    if (!userId || role === null || role === "admin") return; // skip for admins, they use different flow

    const fetchAll = async () => {
      try {
        const url = "/api/absen";
        const config = { params: { userId } };

        console.log(`Fetching data untuk user ${userId}…`);

        const response = await axios.get(url, config);
        setData(response.data.absensi?.length ? response.data : setNullLength(true));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [userId, role]);

  // Fetch user intern data for regular users
  useEffect(() => {
    if (!userId || role === null || role === "admin") return; // skip for admins

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/intern?email=${user.email}`);
        if (response.data && response.data.interns && response.data.interns.length > 0) {
          setUserInternData(response.data.interns[0]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user && user.email) {
      fetchUserData();
    }
  }, [userId, role, user]);

  // For back button in attendance view
  const goBackToInternList = () => {
    setViewMode("list");
    setSelectedIntern(null);
  };

  // Helper function untuk format tanggal
  const formatDate = (dateString) => {
    const absenDate = new Date(dateString);
    const date = absenDate.getDate();
    const month = absenDate.getMonth();
    const monthStr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const year = absenDate.getFullYear();
    return `${date} ${monthStr[month]} ${year}`;
  };

  // Helper function untuk format waktu
  const formatTime = (timeString, fallbackDate) => {
    if (timeString) return timeString;
    if (fallbackDate) {
      const date = new Date(fallbackDate);
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
    return "-";
  };

  // Helper function untuk format waktu checkout
  const formatCheckoutTime = (checkoutTime) => {
    if (!checkoutTime) return "-";
    const date = new Date(checkoutTime);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // Helper function untuk extract keterangan masuk dan pulang
  const extractKeterangan = (keteranganMasuk) => {
    if (!keteranganMasuk) return { masuk: "-", pulang: "-" };
    
    if (keteranganMasuk.includes(" | ")) {
      const [masuk, pulang] = keteranganMasuk.split(" | ");
      return { masuk: masuk || "-", pulang: pulang || "-" };
    }
    
    return { masuk: keteranganMasuk, pulang: "-" };
  };

  // Helper function untuk kalkulasi jarak
  const calculateDistance = (lat, long, type) => {
    if (!lat || !long || !latCenter || !longCenter) {
      return "Tidak tersedia";
    }

    try {
      const userLoc = {
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
      };
      const centerLoc = {
        latitude: parseFloat(latCenter),
        longitude: parseFloat(longCenter),
      };
      return `${getPreciseDistance(userLoc, centerLoc)} meter`;
    } catch (error) {
      console.error(`Error calculating ${type} distance:`, error);
      return "Error kalkulasi";
    }
  };

  // Render admin intern list view
  const renderInternList = () => {
    if (internList.length === 0) {
      return <div className="text-center py-6">Tidak ada data anak magang yang tersedia</div>;
    }

    return (
      <div className="overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Daftar Anak Magang</h2>
        <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">NIM</th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Kampus</th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Divisi</th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Periode</th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {internList.map((intern, index) => {
              const startDate = new Date(intern.tanggalMulai).toLocaleDateString('id-ID');
              const endDate = new Date(intern.tanggalSelesai).toLocaleDateString('id-ID');
              
              return (
                <tr
                  key={intern._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.nim}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.kampus}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.divisi || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{`${startDate} s/d ${endDate}`}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      intern.status === 'aktif' ? 'bg-green-100 text-green-800' : 
                      intern.status === 'selesai' ? 'bg-blue-100 text-blue-800' :
                      intern.status === 'dikeluarkan' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button
                      onClick={() => {
                        setSelectedIntern(intern);
                        fetchAttendanceForIntern(intern.userId);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Lihat Absensi
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Unified attendance table renderer
  const renderAttendanceTable = () => {
    return (
      <>
        {selectedIntern && (
          <div className="mb-6">
            <button 
              onClick={goBackToInternList}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mb-4 flex items-center"
            >
              <span className="mr-2">←</span> Kembali ke Daftar Anak Magang
            </button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-bold mb-2">Data Absensi: {selectedIntern.nama}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">NIM</p>
                  <p className="font-medium">{selectedIntern.nim}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Divisi</p>
                  <p className="font-medium">{selectedIntern.divisi || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{selectedIntern.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {nullLength ? (
          <div className="flex justify-center items-center p-8 bg-white rounded-lg shadow min-h-[300px] w-full">
            <p className="text-lg">Anak magang ini belum memiliki riwayat absensi</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
            <table className="w-full min-w-[1200px] bg-white">
              <thead className="sticky top-0">
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jam Absen Masuk</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jarak Masuk</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Pesan Masuk</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jam Absen Pulang</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jarak Pulang</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Pesan Pulang</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Keterangan Masuk</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Keterangan Pulang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.absensi.map((item, index) => {
                  const keterangan = extractKeterangan(item.keteranganMasuk);
                  return (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{formatDate(item.absenDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(null, item.absenDate)}</td>
                      <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{calculateDistance(item.latCordinate, item.longCordinate, "masuk")}</td>
                      <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.messageText || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCheckoutTime(item.checkoutTime)}</td>
                      <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.checkoutTime ? calculateDistance(item.checkoutLatCordinate, item.checkoutLongCordinate, "pulang") : "-"}</td>
                      <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.checkoutMessageText || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{keterangan.masuk}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{keterangan.pulang}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  // Main render
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px] w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Admin view
  if (role === "admin") {
    return (
      <div className="w-full">
        {viewMode === "list" ? renderInternList() : renderAttendanceTable()}
      </div>
    );
  }

  // Regular user view
  return (
    <div className="w-full">
      {userInternData && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold mb-2">Data Absensi Saya</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium">{userInternData.nama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NIM</p>
                <p className="font-medium">{userInternData.nim}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Divisi</p>
                <p className="font-medium">{userInternData.divisi || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{userInternData.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {nullLength ? (
        <div className="flex justify-center items-center min-h-[300px] w-full">
          <h1>Anda belum memiliki riwayat daftar hadir sama sekali</h1>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="w-full min-w-[1200px] bg-white">
            <thead className="sticky top-0">
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jam Absen Masuk</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jarak Masuk</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Pesan Masuk</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jam Absen Pulang</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jarak Pulang</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Pesan Pulang</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Keterangan Masuk</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Keterangan Pulang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.absensi.map((item, index) => {
                const keterangan = extractKeterangan(item.keteranganMasuk);
                return (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{formatDate(item.absenDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(null, item.absenDate)}</td>
                    <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{calculateDistance(item.latCordinate, item.longCordinate, "masuk")}</td>
                    <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.messageText || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCheckoutTime(item.checkoutTime)}</td>
                    <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.checkoutTime ? calculateDistance(item.checkoutLatCordinate, item.checkoutLongCordinate, "pulang") : "-"}</td>
                    <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.checkoutMessageText || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{keterangan.masuk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{keterangan.pulang}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
