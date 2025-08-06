"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./../app/firebase/config";
import { React, useEffect, useState } from "react";
import axios from "axios";
import SignOutButton from "./signOutButton";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Added missing Link import

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Add a helper function to check if time is late
const isLate = (timeString) => {
  if (!timeString) return false;

  const [hours, minutes] = timeString.split(":").map(Number);

  // Check if time is after 7:30 AM
  return hours > 7 || (hours === 7 && minutes > 30);
};

export default function Dashboard() {
  // Modal component for izin details
  const IzinModal = ({ isOpen, onClose, izinData }) => {
    if (!isOpen || !izinData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Detail Izin</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Jenis Izin</p>
              <p className="font-medium capitalize">{izinData.keteranganIzin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">{formatDate(izinData.izinDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Keterangan</p>
              <p className="font-medium">{izinData.messageIzin}</p>
            </div>
            {izinData.linkBukti && (
              <div>
                <p className="text-sm text-gray-500">Bukti</p>
                <a
                  href={izinData.linkBukti}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Lihat Bukti
                </a>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [kuota, setKuota] = useState("15");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPembimbing, setIsPembimbing] = useState(false);
  const [userStatus, setUserStatus] = useState("pending");
  const [userDivision, setUserDivision] = useState("-");
  const [userPeriod, setUserPeriod] = useState(null);
  const [userInternData, setUserInternData] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [userGrade, setUserGrade] = useState("-");
  const [userMentor, setUserMentor] = useState('-')
  const [mentor, setMentor] = useState([]);
  const [currentMentorData, setCurrentMentorData] = useState(null);
  const [menteeCount, setMenteeCount] = useState(0);
  const [waktuHadir, setWaktuHadir] = useState(null);
  const [waktuPulang, setWaktuPulang] = useState(null);
  const [isIzin, setIsIzin] = useState(null);
  const [izinData, setIzinData] = useState(null);
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);

  const route = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const token = await user.getIdTokenResult();
        // Matikan saat Production
        // Sampai Sini
        const admin = token.claims.role === "admin";
        const pembimbing = token.claims.role === "pembimbing";
        setIsAdmin(admin);
        setIsPembimbing(pembimbing);
        if (token.claims.role === "pembimbing") {
          console.log("ini pembimbing");
        } else {
          console.log("ini bukan pembimbing");
        }
        if (token.claims.role === "admin") {
          console.log("👑 Ini admin");
        } else {
          console.log("🙅‍♂️ Bukan admin");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day

        // Fetch Izin Data

        // Fetch absen data
        axios
          .get("/api/absen", {
            params: {
              userId: token.claims.user_id,
              date: today.toISOString(),
            },
          })
          .then((response) => {
            if (response.data && response.data.absensi && response.data.absensi.length > 0) {
              // Find today's absen data
              const todayAbsen = response.data.absensi.find((absen) => {
                const absenDate = new Date(absen.absenDate);
                absenDate.setHours(0, 0, 0, 0);
                return absenDate.getTime() === today.getTime();
              });

              if (todayAbsen) {
                // Format the check-in time
                const absenDate = new Date(todayAbsen.absenDate);
                const hours = absenDate.getHours().toString().padStart(2, "0");
                const minutes = absenDate.getMinutes().toString().padStart(2, "0");
                const formattedTime = `${hours}:${minutes}`;

                setWaktuHadir(formattedTime);

                // If there's checkout time
                if (todayAbsen.checkoutTime) {
                  const checkoutDate = new Date(todayAbsen.checkoutTime);
                  const checkoutHours = checkoutDate.getHours().toString().padStart(2, "0");
                  const checkoutMinutes = checkoutDate.getMinutes().toString().padStart(2, "0");
                  const formattedCheckout = `${checkoutHours}:${checkoutMinutes}`;

                  setWaktuPulang(formattedCheckout);
                }
              } else {
                setWaktuHadir(null);
                setWaktuPulang(null);
              }
            } else {
              setWaktuHadir(null);
              setWaktuPulang(null);
            }
          })
          .catch((error) => {
            console.error("Error fetching absen data:", error);
            setWaktuHadir(null);
            setWaktuPulang(null);
          });

        // Fetch Data Izin
        axios.get("/api/izin", {
          params: {
            userId: token.claims.user_id,
            date: today.toISOString(),
          },
        })
        .then(response => {
          if (response.data && response.data.izin && response.data.izin.length > 0) {
            // Find today's izin data
            const todayIzin = response.data.izin.find(izin => {
              const izinDate = new Date(izin.izinDate);
              izinDate.setHours(0, 0, 0, 0);
              return izinDate.getTime() === today.getTime();
            });
            
            if (todayIzin) {
              setIzinData(todayIzin);
            } else {
              setIzinData(null);
            }
          } else {
            setIzinData(null);
          }
        })
        .catch(error => {
          console.error("Error fetching izin data:", error);
          setIzinData(null);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchMentors() {
      try {
        const res = await axios.get("/api/mentor");
        setMentor(res.data);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  useEffect(() => {
    if (user && interns && interns.length > 0) {
      const me = interns.find((i) => i.userId === user.uid);
      if (me) {
        setUserInternData(me);
        setUserStatus(me.status ?? "pending");
        setUserDivision(me.divisi ?? "-");
        setUserMentor(me.pembimbing?.nama ?? "-");
        setUserPeriod(`${formatDate(me.tanggalMulai)} s.d. ${formatDate(me.tanggalSelesai)}`);
      }
    }
  }, [user, interns]);

  useEffect(() => {
    if (user && mentor && mentor.length > 0) {
      const me = mentor.find((m) => m.userId === user.uid);
      if (me) {
        setCurrentMentorData(me);
      }
    }
  }, [user, mentor]);

  useEffect(() => {
    if (isPembimbing && currentMentorData && interns.length > 0) {
      const activeMentees = interns.filter((interns) => interns.pembimbing?._id === currentMentorData._id && interns.status === "aktif").length;

      setMenteeCount(activeMentees);
    }
  }, [isPembimbing, currentMentorData, interns]);

  useEffect(() => {
    async function fetchInterns() {
      try {
        const res = await axios.get("/api/intern");
        setInterns(res.data.interns);
      } catch (error) {
        console.error("Failed to fetch interns:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInterns();
  }, []);

  useEffect(() => {
    const fetchGrade = async () => {
      if (!userInternData) return;

      try {
        const res = await axios.get(`/api/assessment?internId=${userInternData._id}`);

        if (res.data.success && res.data.assessments.length > 0) {
          const aspek = res.data.assessments[0].aspekNilai;
          const numbers = Object.values(aspek).filter((v) => typeof v === "number" && v >= 0);
          const avg = numbers.length > 0 ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length) : "-";

          setUserGrade(avg);
        } else {
          setUserGrade("-");
        }
      } catch (err) {
        console.error("Gagal mengambil nilai:", err);
        setUserGrade("-");
      }
    };

    fetchGrade();
  }, [userInternData]);

  useEffect(() => {
    const checkCertificateStatus = async () => {
      if (!userInternData) return;

      try {
        // Cek langsung flag isSertifikatVerified dari userInternData
        setHasCertificate(userInternData.isSertifikatVerified === true);
      } catch (error) {
        console.error("Error checking certificate status:", error);
        setHasCertificate(false);
      }
    };

    checkCertificateStatus();
  }, [userInternData]);

  const activeCount = interns.filter((i) => i.status === "aktif").length;
  const mostCommonDivisi = interns.length
    ? interns.reduce((acc, curr) => {
        acc[curr.divisi] = (acc[curr.divisi] || 0) + 1;
        return acc;
      }, {})
    : {};

  const mostPopularDivisi = Object.entries(mostCommonDivisi).reduce((max, curr) => (curr[1] > max[1] ? curr : max), ["", 0])[0];

  const StatCard = ({ title, value, icon, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl capitalize font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`select-none text-4xl bg-${color}-50 p-3 rounded-full`}>{icon}</div>
      </div>
    </div>
  );

  const MenuCard = ({ href, icon, title, description, color = "gray", onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:bg-${color}-50 cursor-pointer transition-all duration-300 hover:-translate-y-1 group`}>
      <div className="text-center">
        <div className={`select-none text-5xl mb-4 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
        <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );

  const handleMenuClick = (href) => {
    setPageLoading(true);
    setTimeout(() => {
      route.push(href);
    }, 500);
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Add the IzinModal component at the end of render
  const renderIzinModal = () => {
    return (
      <IzinModal 
        isOpen={showIzinModal}
        onClose={() => setShowIzinModal(false)}
        izinData={izinData}
      />
    );
  }

  const getStatusColor = (userStatus) => {
    switch (userStatus?.toLowerCase()) {
      case "aktif":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "selesai":
        return "text-blue-500";
      case "dikeluarkan":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {userInternData && <p className="text-lg font-medium text-gray-600 mb-1">Hi, {userInternData.nama}</p>}
              {isAdmin && (
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  <span className="text-blue-500">ADMIN</span>
                </h1>
              )}
              {currentMentorData && (
                <>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    <span className="text-blue-500">PEMBIMBING</span>
                  </h1>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    <span className="text-orange-500">{currentMentorData.nama}</span>
                  </h1>
                </>
              )}
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard <span className="text-blue-500">MAGNET</span>
              </h1>
              {isAdmin || isPembimbing ? <p className="text-gray-600">Kelola data dan monitor aktivitas magang dengan mudah</p> : <p className="text-gray-600">Pantau Status Pengajuan Magang dan Progress Magang Kamu Di Sini</p>}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 ">
              {isAdmin && (
                <button
                  onClick={() => route.push("/admin")}
                  className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  Pengaturan Role
                </button>
              )}
              <SignOutButton />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : isAdmin || isPembimbing ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatCard
                title="Peserta Magang Aktif"
                value={activeCount}
                icon="👥"
                color="green"
              />
              {isPembimbing && (
                <StatCard
                  title="Jumlah Peserta Bimbingan Aktif"
                  value={menteeCount}
                  icon="🧑‍🏫"
                  color="red"
                />
              )}

              <StatCard
                title="Total Kuota Harian"
                value={kuota}
                icon="📊"
                color="blue"
              />
            </div>

            {/* Menu Cards */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Menu Utama</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MenuCard
                  icon="📅"
                  title="Kalender Jadwal"
                  description="Lihat dan kelola jadwal magang"
                  color="blue"
                  onClick={() => handleMenuClick("/kalender")}
                />

                <MenuCard
                  onClick={() => handleMenuClick("/dataMagang")}
                  icon="👥"
                  title="Data Peserta Magang"
                  description="Monitor dan kelola informasi peserta magang"
                  color="green"
                />
                <MenuCard
                  onClick={() => handleMenuClick("/dataMentor")}
                  icon="🧑‍🏫"
                  title="Data Pembimbing Magang"
                  description="Monitor dan kelola informasi pembimbing magang"
                  color="blue"
                />
                <MenuCard
                  onClick={() => handleMenuClick("/divisi")}
                  icon="🏢"
                  title="Tim & Penempatan"
                  description="Monitor dan atur tim dan penempatan"
                  color="purple"
                />
                <MenuCard
                  onClick={() => handleMenuClick("/quotaManagement")}
                  icon="📊"
                  title="Kuota & Monitoring"
                  description="Monitor kuota dan progress"
                  color="orange"
                />
                <MenuCard
                  icon="📑"
                  title="Pemantauan Daftar Hadir"
                  description="Pantau Riwayat Daftar Hadir Peserta Magang"
                  color="blue"
                  onClick={() => handleMenuClick("/historiDaftarHadir")}
                />
                <MenuCard
                  icon="📑"
                  title="Pemantauan Perizinan Tidak Hadir"
                  description="Pantau Riwayat Izin Peserta Magang"
                  color="blue"
                  onClick={() => handleMenuClick("/historiIzin")}
                />

                <MenuCard
                  onClick={() => handleMenuClick("/pengaturanAbsen")}
                  icon="⚙️"
                  title="Pengaturan Daftar Hadir"
                  description="Atur batas jam masuk, pulang, batas jarak daftar hadir, dan titik lokasi pusat"
                  color="green"
                />
                <MenuCard
                  onClick={() => handleMenuClick("/templateSertifikat")}
                  icon="🎨"
                  title="Template Sertifikat"
                  description="Atur Template Sertifikat"
                  color="purple"
                />
                <MenuCard
                  onClick={() => handleMenuClick("/sertifikat")}
                  icon="✅"
                  title="Verifikasi Sertifikat"
                  description="Verifikasi Peserta yang mendapatkan sertifikat"
                  color="orange"
                />
              </div>
            </div>

            {/* Quick Stats Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Cepat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-medium text-gray-800">Status Aktif</p>
                    <p className="text-sm text-gray-600">
                      {activeCount} dari {interns.length} peserta magang
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {userInternData && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Halo, <span className="text-blue-500">{userInternData.nama}</span> 👋
                </h2>
                <div className="grid grid-cols-1 gap-y-2 text-gray-700 text-sm">
                  <div className="text-xl">
                    <span className="font-semibold text-gray-600">NIM:</span> {userInternData.nim}
                  </div>
                  <div className="text-xl">
                    <span className="font-semibold text-gray-600">Prodi:</span> {userInternData.prodi}
                  </div>
                  <div className="text-xl">
                    <span className="font-semibold text-gray-600">Kampus:</span> {userInternData.kampus}
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Cards */}
            {userInternData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {userStatus === "aktif" && (
                  izinData ? (
                    // Show izin card if user has izin today
                    <div 
                      onClick={() => setShowIzinModal(true)}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer lg:col-span-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Status Kehadiran Hari Ini</p>
                          <p className="text-3xl capitalize font-bold text-yellow-600">
                            {izinData.keteranganIzin === 'sakit' ? 'Sakit' : 
                            izinData.keteranganIzin === 'izin' ? 'Izin' : 'Tidak Hadir'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Klik untuk detail</p>
                        </div>
                        <div className="select-none text-4xl bg-yellow-50 p-3 rounded-full">
                          {izinData.keteranganIzin === 'sakit' ? '🤒' : 
                          izinData.keteranganIzin === 'izin' ? '📝' : '🏠'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show regular attendance cards if no izin
                    <div className="flex flex-col md:flex-row gap-6 lg:col-span-2">
                      <div className="w-full md:w-1/2">
                        <StatCard
                          title="Waktu Absen Datang"
                          value={<span className={isLate(waktuHadir) ? "text-red-500" : "text-green-400"}>{waktuHadir || "Belum absen"}</span>}
                          icon={
                            <img
                              src={"/assets/image/start.png"}
                              className={"w-[50px]"}
                            />
                          }
                        />
                      </div>
                      <div className="w-full md:w-1/2">
                        <StatCard
                          title="Waktu Absen Pulang"
                          value={waktuPulang || "Belum checkout"}
                          icon={
                            <img
                              src={"/assets/image/finish.png"}
                              className={"w-[50px]"}
                            />
                          }
                        />
                      </div>
                    </div>
                  )
                )}
                <StatCard
                  title="Status Magang Kamu"
                  value={<span className={getStatusColor(userStatus)}>{userStatus}</span>}
                  icon="⌛"
                />

                <StatCard
                  title="Tim Kamu Saat Ini"
                  value={userDivision}
                  icon="🏛️"
                  color="blue"
                />
                <StatCard
                  title="Pembimbing Kamu Saat Ini"
                  value={userMentor}
                  icon="👤"
                  color="blue"
                />
                <StatCard
                  title="Periode Magang Kamu"
                  value={userPeriod}
                  icon="🗓️"
                  color="blue"
                />
                {/* ini harus disinkronisasi dengan perhitungan kuota dan jumlah intern */}
                <StatCard
                  title="Kuota magang saat periode magang kamu"
                  value="kuota tersedia"
                  icon="📊"
                  color="blue"
                />
                <StatCard
                  title="Nilai Magang Kamu"
                  value={userGrade === "-" ? "Belum ada nilai" : userGrade}
                  icon="⭐"
                  color="blue"
                />
              </div>
            )}

            {/* Menu Cards */}
            {userStatus == "pending" && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Menu Utama</h2>
                <div className="grid grid-cols-1 gap-6">
                  <MenuCard
                    onClick={() => handleMenuClick("/dashboard")}
                    icon="🗓️"
                    title="Jadwal Tersedia Kesempatan Magang"
                    description="Lihat ketersediaan jadwal magang"
                    color="blue"
                  />
                </div>
              </div>
            )}
            {userStatus !== "pending" && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Menu Utama</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MenuCard
                    onClick={() => handleMenuClick("/dashboard")}
                    icon="🗓📖"
                    title="Pengumpulan Laporan"
                    description="Submit Laporan Magang Kamu di sini"
                    color="blue"
                  />
                  <MenuCard
                    onClick={() => handleMenuClick("/historiDaftarHadir")}
                    icon="📓🔄"
                    title="Histori Daftar Hadir"
                    description="Lihat histori daftar hadirmu!"
                    color="green"
                  />
                  <MenuCard
                    onClick={() => handleMenuClick("/historiIzin")}
                    icon="📓🔄"
                    title="Histori Izin"
                    description="Lihat histori Izin"
                    color="green"
                  />
                  {hasCertificate && (
                    <MenuCard
                      onClick={() => handleMenuClick("/sertifikatSaya")}
                      icon="📜"
                      title="Sertifikat"
                      description="Lihat dan unduh sertifikatmu"
                      color="green"
                    />
                  )}
                </div>
              </div>
            )}

            {userStatus === "aktif" && !izinData && (
              <div className="fixed bottom-5 right-5 hover:bottom-7 transition-all ease-out duration-200 z-50">
                <button
                  onClick={() => handleMenuClick("/absen")}
                  className="bg-blue-500 focus:bg-blue-700 focus:translate-y-4 rounded-2xl hover:bg-blue-700 hover:px-6 hover:py-4 hover:rounded-xl text-white px-4 py-3 hover:shadow-lg font-medium transition-all ease-out cursor-pointer duration-300">
                  ✅ Isi Daftar Hadir
                </button>
              </div>
            )}
            
            {/* Render the izin modal */}
            {renderIzinModal()}
          </>
        )}
        {loading ? (
          <div className="text-center py-6">Loading...</div>
        ) : isPembimbing ? (
          <div className="mb-6">
            <MenuCard
              onClick={() => handleMenuClick("/penilaian")}
              icon="📝"
              title="Penugasan & Penilaian"
              description="Penilaian peserta magang"
              color="green"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}