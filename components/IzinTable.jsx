"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./../app/firebase/config";
import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

export default function IzinTable() {
  const [data, setData] = useState({ izin: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [nullLength, setNullLength] = useState(false);
  const [internList, setInternList] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const [userInternData, setUserInternData] = useState(null);

  const fetchUserInternData = async (queryParam) => {
    try {
      const response = await axios.get(`/api/intern?${queryParam}`);
      if (response.data?.interns?.length > 0) {
        console.log("✅ Intern ditemukan:", response.data.interns[0].nama);
        setUserInternData(response.data.interns[0]);
      } else {
        console.warn("⚠️ Intern tidak ditemukan dengan query:", queryParam);
      }
    } catch (err) {
      console.error("❌ Error fetching intern data:", err);
    }
  };

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

  // Fetch izin data for a specific intern
  const fetchIzinForIntern = async (internId) => {
    setIsLoading(true);
    try {
      const url = "/api/izin";
      const config = { params: { userId: internId } };

      console.log(`Fetching izin data for intern ID: ${internId}`);

      const response = await axios.get(url, config);
      setData(response.data.izin?.length ? response.data : { izin: [] });
      setNullLength(!response.data.izin?.length);
      setViewMode("detail");
    } catch (err) {
      console.error("Fetch izin error:", err);
      setData({ izin: [] });
      setNullLength(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user intern data for regular users
  useEffect(() => {
    if (!userId || role === null || role === "admin") return; // skip for admins

    const fetchUserData = async () => {
      // try {
      //   // Gunakan userId daripada email
      //   const response = await axios.get(`/api/intern`);
      //   console.log("Debug - Fetching with userId:", userId);

      //   if (response.data && response.data.interns && response.data.interns.length > 0) {
      //     console.log("Debug - Found intern data:", response.data.interns[0].nama);
      //     setUserInternData(response.data.interns[0]);
      //   } else {
      //     console.log("Debug - No data found with userId, trying email as fallback");
      //     // Fallback ke email jika userId tidak ditemukan
      //     const emailResponse = await axios.get(`/api/intern?email=${user.email}`);
      //     if (emailResponse.data && emailResponse.data.interns && emailResponse.data.interns.length > 0) {
      //       console.log("Debug - Found intern data with email:", emailResponse.data.interns[0].nama);
      //       setUserInternData(emailResponse.data.interns[0]);
      //     }
      //   }
      // } catch (error) {
      //   console.error("Error fetching user data:", error);
      // }

      const fetchData = async () => {
        // Coba cari pake userId dulu, fallback ke email
        await fetchUserInternData(`userId=${userId}`);
        if (!userInternData && user?.email) {
          await fetchUserInternData(`email=${user.email}`);
        }
      };

      fetchData();
    };

    if (user && userId) {
      fetchUserData();
    }
  }, [userId, role, user]);

  // Fetch izin data for regular users
  useEffect(() => {
    if (!userId || role === null || role === "admin") return; // skip for admins, they use different flow

    const fetchAll = async () => {
      try {
        // const url = "/api/izin";
        // const config = { params: { email : user.email } };
        const response = await axios.get(`/api/intern?userId=${userId}`);

        console.log(`Fetching izin data untuk user ${userId}…`);

        // const response = await axios.get(url, config);
        if (response.data && response.data.izin?.length) {
          setData(response.data);
          setNullLength(false);
        } else {
          setData({ izin: [] });
          setNullLength(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setData({ izin: [] });
        setNullLength(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [user, role]);

  // For back button in detail view
  const goBackToInternList = () => {
    setViewMode("list");
    setSelectedIntern(null);
  };

  // Format tanggal yang dibaca dari database
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";

    const day = date.getDate();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  // Mendapatkan status color badge
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "disetujui":
        return "bg-green-100 text-green-800";
      case "ditolak":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Render intern list untuk admin
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
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {internList.map((intern, index) => {
              return (
                <tr
                  key={intern._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.nim}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.kampus}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{intern.divisi || "-"}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${intern.status === "aktif" ? "bg-green-100 text-green-800" : intern.status === "selesai" ? "bg-blue-100 text-blue-800" : intern.status === "dikeluarkan" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button
                      onClick={() => {
                        setSelectedIntern(intern);
                        fetchIzinForIntern(intern.userId);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      Lihat Izin
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

  // Modifikasi renderIzinDetail untuk menyesuaikan dengan struktur database
  const renderIzinDetail = () => {
    return (
      <>
        {selectedIntern && (
          <div className="mb-6">
            <button
              onClick={goBackToInternList}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mb-4 flex items-center">
              <span className="mr-2">←</span> Kembali ke Daftar Anak Magang
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-bold mb-2">Data Izin: {selectedIntern.nama}</h2>
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
            <p className="text-lg">Belum ada pengajuan izin dari peserta magang ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
            <table className="w-full min-w-[1000px] bg-white">
              <thead className="sticky top-0">
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Tanggal Pengajuan</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Tanggal Izin</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jenis Izin</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Pesan Izin</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.izin.map((item, index) => {
                  return (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.izinDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.keteranganIzin || "-"}</td>
                      <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.messageIzin || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.linkBukti ? (
                          <a
                            href={item.linkBukti}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline">
                            Lihat Bukti
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
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
    return <div className="w-full">{viewMode === "list" ? renderInternList() : renderIzinDetail()}</div>;
  }

  // Regular user view
  return (
    <div className="w-full">
      {userInternData && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold mb-2">Data Pengajuan Izin Saya</h2>
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
          <h1>Anda belum memiliki riwayat pengajuan izin</h1>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="w-full min-w-[1000px] bg-white">
            <thead className="sticky top-0">
              <tr className="bg-gray-100">
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Tanggal Pengajuan</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Tanggal Izin</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Jenis Izin</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Pesan Izin</th>
                <th className="px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.izin.map((item, index) => {
                return (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.izinDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.keteranganIzin || "-"}</td>
                    <td className="px-6 py-4 whitespace-break-spaces text-sm text-gray-900">{item.messageIzin || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.linkBukti ? (
                        <a
                          href={item.linkBukti}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 underline">
                          Lihat Bukti
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
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
