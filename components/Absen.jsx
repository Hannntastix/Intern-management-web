"use client";
import InputAbsen from "@/components/ui/inputabsen";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "./../app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import FormIzin from "./FormIzin";
const LocationMap = dynamic(() => import("@/components/LocationMaps"), {
  ssr: false,
});

// Nilai akurasi minimum dalam meter (semakin kecil semakin akurat)
const MINIMUM_ACCURACY = 50; // 50 meter

export default function Absen() {
  // Semua state diletakkan di bagian atas komponen
  const [timeError, setTimeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [waitingForAccuracy, setWaitingForAccuracy] = useState(false);
  const [userStatus, setUserStatus] = useState(null); // Tambahkan state untuk status pengguna
  const [formData, setFormData] = useState({
    nama: "",
    longCordinate: "",
    latCordinate: "",
    dailyNote: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");
  const [isIzin, setIsIzin] = useState(false);

  // Handler untuk meminta lokasi - Harus dipicu oleh interaksi pengguna
  const requestLocation = () => {
    setLocationRequested(true);
    setIsLoading(true);
    setWaitingForAccuracy(true);

    if (navigator.geolocation) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      // Untuk mendapatkan akurasi yang lebih baik, kita bisa menggunakan watchPosition
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentAccuracy = position.coords.accuracy;
          setAccuracy(currentAccuracy);

          const newCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: currentAccuracy,
          };

          setCoordinates(newCoords);
          setFormData((prev) => ({
            ...prev,
            longCordinate: newCoords.longitude,
            latCordinate: newCoords.latitude,
          }));

          // Jika akurasi sudah memenuhi syarat, hentikan watch
          if (currentAccuracy <= MINIMUM_ACCURACY) {
            setWaitingForAccuracy(false);
            navigator.geolocation.clearWatch(watchId);
            console.log("Akurasi lokasi mencukupi:", currentAccuracy, "meter");
          }

          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
          setWaitingForAccuracy(false);
        },
        geoOptions
      );

      // Simpan watchId di ref untuk dibersihkan saat komponen unmount
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.error("Geolocation tidak didukung di browser ini");
      setIsLoading(false);
      setWaitingForAccuracy(false);
    }
  };

  // Fungsi untuk update lokasi (dipanggil dari komponen anak)
  const handleLocationUpdate = (coords) => {
    setCoordinates(coords);
    setFormData((prev) => ({
      ...prev,
      longCordinate: coords.longitude,
      latCordinate: coords.latitude,
    }));
  };

  // menentukan jam absen
  useEffect(() => {
    const waktuLokal = new Date();
    const jam = waktuLokal.getHours();

    if (jam >= 5 && jam < 23) {
      console.log(`User mengisi di waktu yang diperbolehkan, yaitu pada jam ${jam}`);
      setTimeError(false);
    } else {
      console.log(`User mengisi di waktu yang tidak diperbolehkan, yaitu pada jam ${jam}`);
      setTimeError(true);
    }
  }, []);

  // Mengambil data user dari Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const res = await axios.get("/api/intern");
          const myData = res.data.interns.find((i) => i.userId === currentUser.uid);

          if (myData) {
            setFormData((prev) => ({
              ...prev,
              nama: myData.nama,
            }));

            // Simpan status pengguna ke state
            setUserStatus(myData.status);
          }
        } catch (error) {
          console.error("Error mengambil data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset error jika pengguna mulai mengetik ulang
    if (submitError) setSubmitError("");
  };

  const route = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setSubmitError("");
    setSuccess("");
    setApiError("");
    setTimeError(false); // Reset time error

    try {
      const dataToSubmit = {
        userId: user?.uid,
        nama: formData.nama,
        longCordinate: formData.longCordinate,
        latCordinate: formData.latCordinate,
        dailyNote: formData.dailyNote,
      };


      const response = await fetch("/api/absen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (!response.ok) {
        // Cek pesan error dari server
        if (result.error && result.error.includes("di luar jam")) {
          setTimeError(true);
          return; // Hentikan eksekusi
        }
        throw new Error(result.error || "Terjadi kesalahan saat menyimpan absensi");
      }

      setSuccess("Absensi berhasil disimpan!");
      setFormData((prev) => ({
        ...prev,
        dailyNote: "",
      }));

      setTimeout(() => {
        if (result.redirectUrl) {
          route.push(result.redirectUrl);
        }
      }, 1500);
    } catch (err) {
      console.error("Error saat submit absensi:", err);
      if (err.message.includes("di luar jam")) {
        setTimeError(true);
      } else {
        setSubmitError(err.message || "Terjadi kesalahan saat mengirim data");
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika status pengguna adalah "pending", tampilkan pesan
  if (userStatus === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center items-center">
          <img
            src="/assets/image/error.png"
            alt="error icon"
            className="h-20 mx-auto mb-4 motion-safe:animate-pulse hover:animate-none"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">Anda belum dapat mengisi daftar hadir karena status akun Anda masih dalam tinjauan. Silahkan hubungi admin untuk informasi lebih lanjut.</p>
        </div>
      </div>
    );
  } else if (timeError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">
            <img
              src="/assets/image/forbidden.png"
              alt="error icon"
              className="h-20 mx-auto mb-4 motion-safe:animate-pulse hover:animate-none"
            />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Waktu Absen Tidak Sesuai</h2>
          <p className="text-gray-600 mb-6">
            Silakan absen pada jam yang telah ditentukan:
            <br />
            <span className="font-semibold">
              Pagi: 05:00 - 07:30
              <br />
              Sore: 16:00 - 23:00
            </span>
          </p>
          <Button
            onClick={() => {
              setTimeError(false);
              setLoading(true);
              route.push("/dashboard");
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <Button
              varian="link"
              size={"default"}
              className={"mb-5 bg-blue-300 hover:bg-blue-800 hover:text-white duration-300 ease-out"}>
              <ArrowLeft />
              <Link href={"/dashboard"}> Kembali ke Dashboard </Link>
            </Button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isIzin ? 'Form Tidak Hadir' : 'Isi Daftar Hadir'}
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {isIzin ? (
              <FormIzin userId={user?.uid} nama={formData.nama} />
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Form Absensi</h2>
                {apiError && <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg">{apiError}</div>}
                {submitError && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">{submitError}</div>}
                {success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">{success}</div>}

                {!locationRequested ? (
                  <div className="mb-6 text-center">
                    <p className="mb-4 text-gray-700">Untuk mengisi absensi, kami memerlukan akses ke lokasi Anda.</p>
                    <Button
                      onClick={requestLocation}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all">
                      Izinkan Akses Lokasi
                    </Button>
                    <p className="my-4 text-gray-700">Atau</p>
                    <Button
                      onClick={() => setIsIzin(true)}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all">
                      Isi form Tidak Hadir
                    </Button>
                  </div>
                ) : isLoading ? (
                  <div className="mb-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Mendapatkan lokasi Anda...</p>
                  </div>
                ) : coordinates && (!waitingForAccuracy || (accuracy && accuracy <= MINIMUM_ACCURACY)) ? (
                  <>
                    {accuracy && <div className="mb-4 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">Akurasi lokasi: {Math.round(accuracy)} meter</div>}

                    <LocationMap
                      onLocationUpdate={handleLocationUpdate}
                      coords={coordinates}
                    />

                    <form
                      onSubmit={handleSubmit}
                      className="">
                      <InputAbsen
                        key="nama-input"
                        type={"text"}
                        name={"nama"}
                        label={"Masukkan Nama Anda"}
                        placeholder={"Memuat nama..."}
                        required={true}
                        readonly={true}
                        value={formData.nama}
                      />
                      <InputAbsen
                        key="long-input"
                        type={"number"}
                        name={"longCordinate"}
                        label={"Kordinat Longitude"}
                        placeholder={"Contoh: -6.2088"}
                        required={true}
                        readonly={true}
                        value={formData.longCordinate}
                      />
                      <InputAbsen
                        key="lat-input"
                        type={"number"}
                        name={"latCordinate"}
                        label={"Kordinat Latitude"}
                        placeholder={"Contoh: 106.8456"}
                        required={true}
                        readonly={true}
                        value={formData.latCordinate}
                      />
                      <InputAbsen
                        key="note-input"
                        type={"textarea"}
                        name={"dailyNote"}
                        label={"Catatan Kegiatan"}
                        placeholder={"Isikan Rencana kegiatan hari ini"}
                        required={true}
                        readonly={false}
                        note={"Isi Rencana Kegiatan yang akan dilakukan hari ini"}
                        minLength={50}
                        value={formData.dailyNote}
                        onChange={handleChange}
                      />
                      <div className="mt-6">
                        <Button
                          type="submit"
                          variant={"default"}
                          size={"default"}
                          disabled={formLoading}
                          className={"cursor-pointer bg-blue-300 hover:bg-blue-600 hover:p-5 hover:-translate-y-2 hover:-translate-x-1 hover:text-white transition-all ease-out duration-500"}>
                          {formLoading ? "Memproses..." : "Isi Daftar Hadir"}
                        </Button>
                      </div>
                    </form>
                  </>
                ) : coordinates && waitingForAccuracy ? (
                  <div className="mb-6">
                    <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg">
                      <p>Mencoba mendapatkan lokasi yang lebih akurat...</p>
                      <p>
                        Akurasi saat ini: {accuracy ? Math.round(accuracy) : "?"} meter (target: {MINIMUM_ACCURACY} meter)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: accuracy ? `${Math.min(100, (MINIMUM_ACCURACY / accuracy) * 100)}%` : "0%",
                          }}></div>
                      </div>
                      <p className="text-xs mt-2">Harap tunggu atau pindah ke area dengan sinyal GPS lebih baik</p>
                    </div>

                    <Button
                      onClick={() => setWaitingForAccuracy(false)}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all">
                      Gunakan Lokasi Saat Ini
                    </Button>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">Tidak bisa mendapatkan lokasi. Harap izinkan akses lokasi dan coba lagi.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
