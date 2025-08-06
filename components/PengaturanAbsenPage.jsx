"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputAbsen from "@/components/ui/inputabsen";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import MapPicker from "./ui/MapPicker";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import marker icon locally
const markerIcon = L.icon({
  iconUrl: "/assets/image/marker-icon.png", // Simpan di public folder
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function PengaturanAbsenPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    centerLongitude: "",
    centerLatitude: "",
    radius: "",
  });
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [user, setUser] = useState(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(user);
        const tokenResult = await user.getIdTokenResult();
        setUser(user);
        setRole(tokenResult.claims.role);
        // Load existing geofencing settings
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      const response = await fetch("/api/geofencing");
      if (response.ok) {
        const data = await response.json();
        setFormData({
          centerLongitude: data.longitude || "",
          centerLatitude: data.latitude || "",
          radius: data.radius || "",
        });

        setLocation({
          latitude: parseFloat(data.latitude) || "",
          longitude: parseFloat(data.longitude) || "",
        });

        // Set informasi user yang terakhir mengubah pengaturan
        setLastUpdatedBy(data.changeByUser);
        setLastUpdatedAt(data.updatedAt);
      }
    } catch (error) {
      console.error("Error loading current settings:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "centerLatitude" || name === "centerLongitude") {
      setLocation((prev) => ({
        ...prev,
        [name === "centerLatitude" ? "latitude" : "longitude"]: value,
      }));
    }
  };

  const handleMenuClick = (href) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(href);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setSubmitError("");
    setSuccess("");

    // Validasi user login
    if (!user) {
      setSubmitError("Anda harus login terlebih dahulu");
      setFormLoading(false);
      return;
    }

    // Validasi input
    if (!formData.centerLongitude || !formData.centerLatitude) {
      setSubmitError("Koordinat longitude dan latitude harus diisi");
      setFormLoading(false);
      return;
    }

    // Validasi format koordinat
    const longitude = parseFloat(formData.centerLongitude);
    const latitude = parseFloat(formData.centerLatitude);

    if (isNaN(longitude) || isNaN(latitude)) {
      setSubmitError("Format koordinat tidak valid");
      setFormLoading(false);
      return;
    }

    try {
      // Persiapkan data untuk dikirim ke API pengaturan geofencing
      const dataToSubmit = {
        centerLongitude: location.longitude,
        centerLatitude: location.latitude,
        radius: formData.radius ? parseFloat(formData.radius) : 100, // default 100 meter
        changeByUser: user?.uid, // ID user yang mengubah pengaturan
      };

      console.log("Data pengaturan yang akan dikirim:", dataToSubmit);

      // Kirim data ke API pengaturan geofencing
      const response = await fetch("/api/geofencing", {
        method: "PUT", // Mengubah dari POST menjadi PUT untuk operasi update
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error("Terjadi kesalahan saat menyimpan pengaturan");
      }

      const result = await response.json();

      setSuccess("Pengaturan koordinat berhasil diperbarui!");

      // Update informasi pengaturan terakhir
      if (result.data) {
        setLastUpdatedBy(result.data.changeByUser);
        setLastUpdatedAt(result.data.updatedAt);
      }

      // Redirect ke dashboard setelah 1.5 detik
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error saat submit pengaturan:", err);
      setSubmitError(err.message || "Terjadi kesalahan saat menyimpan pengaturan");
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {role === "admin" ? (
        <div>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="p-6 max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                <Button
                  onClick={() => handleMenuClick("/dashboard")}
                  varian="link"
                  size={"default"}
                  className={"mb-5 bg-blue-300 cursor-pointer hover:bg-blue-800 hover:text-white duration-300 ease-out"}>
                  <ArrowLeft />
                  Kembali ke Dashboard
                </Button>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Pengaturan Daftar Hadir</h1>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">{success}</p>
                  </div>
                )}

                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">{submitError}</p>
                  </div>
                )}

                {/* Info pengaturan terakhir */}
                {lastUpdatedBy && lastUpdatedAt && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">📍 Info Pengaturan Terakhir</h3>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Diubah oleh:</span> {lastUpdatedBy}
                    </p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Waktu:</span> {new Date(lastUpdatedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <MapPicker
                    // onLocationPick={(coords) => setLocation(coords)}
                    // initialLocation={location}
                    // radius={parseFloat(formData.radius) || 100}
                    onLocationPick={(coords) => {
                      // Update location state
                      setLocation(coords);

                      // Also update form data
                      setFormData((prev) => ({
                        ...prev,
                        centerLatitude: coords.latitude.toString(),
                        centerLongitude: coords.longitude.toString(),
                      }));
                    }}
                    initialLocation={location}
                    radius={parseFloat(formData.radius) || 100}
                  />
                  <form
                    onSubmit={handleSubmit}
                    className="w-full">
                    <InputAbsen
                      key="longitude-input"
                      type={"number"}
                      name={"centerLongitude"}
                      label={"Koordinat Longitude Pusat"}
                      placeholder={"Contoh: 105.2734644 (longitude pusat area absen)"}
                      required={true}
                      readonly={false}
                      value={formData.centerLongitude}
                      onChange={handleInputChange}
                      step="any"
                    />
                    <InputAbsen
                      key="latitude-input"
                      type={"number"}
                      name={"centerLatitude"}
                      label={"Koordinat Latitude Pusat"}
                      placeholder={"Contoh: -5.4282987 (latitude pusat area absen)"}
                      required={true}
                      readonly={false}
                      value={formData.centerLatitude}
                      onChange={handleInputChange}
                      step="any"
                    />
                    <InputAbsen
                      key="radius-input"
                      type={"number"}
                      name={"radius"}
                      label={"Radius Area Absen (meter)"}
                      placeholder={"Contoh: 100 (jarak maksimal dari titik pusat)"}
                      required={false}
                      readonly={false}
                      value={formData.radius}
                      onChange={handleInputChange}
                    />
                    <div className="mt-6">
                      <Button
                        type="submit"
                        variant={"default"}
                        size={"default"}
                        disabled={formLoading}
                        className={"cursor-pointer bg-blue-300 hover:bg-blue-600 hover:p-5 hover:-translate-y-2 hover:-translate-x-1 hover:text-white transition-all ease-out duration-500"}>
                        {formLoading ? "Memproses..." : "Perbarui Pengaturan"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center items-center">
            <img
              src="/assets/image/error.png"
              alt="error icon"
              className="h-20 mx-auto mb-4 motion-safe:animate-pulse hover:animate-none"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">Halaman ini hanya dapat diakses oleh Administrator!</p>
          </div>
        </div>
      )}
    </div>
  );
}
