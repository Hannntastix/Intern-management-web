import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import InputAbsen from "./ui/inputabsen";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function FormIzin({ userId, nama }) {
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    izinType: "",
    penjelasanIzin: "",
    linkBukti: ""
  });
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const dataToSubmit = {
        idUser: userId,
        keteranganIzin: formData.izinType,
        messageIzin: formData.penjelasanIzin,
        linkBukti: formData.linkBukti
      };

      const response = await axios.post("/api/izin", dataToSubmit);

      if (response.status === 201) {
        alert("Form izin berhasil dikirim!");
        router.push("/dashboard");
      } else {
        throw new Error(response.data.error || "Gagal mengirim form izin");
      }
    } catch (error) {
      alert(error.response?.data?.error || error.message || "Terjadi kesalahan saat mengirim form izin");
    } finally {
      setFormLoading(false);
    }
  };

  const izinOptions = [
    { value: "sakit", label: "Sakit" },
    { value: "izin", label: "Izin" },
    { value: "lainnya", label: "Lainnya" },
  ];

  return (
    <>
      <form onSubmit={handleSubmit}>
        <InputAbsen
          type="text"
          name="nama"
          label="Nama"
          placeholder="Nama Anda"
          value={nama}
          required={true}
          readonly={true}
        />

        {/* <InputAbsen
          type="select"
          name="izinType"
          label="Jenis Izin"
          placeholder="Pilih Jenis Izin"
          options={izinOptions} // Change from value to options
          value={formData.izinType} // Add current selected value
          onChange={handleInputChange}
          required={true}
          readonly={false}
        /> */}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Jenis Izin</label>
          <select
            name="izinType"
            value={formData.izinType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Pilih Jenis Izin</option>
            {izinOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <InputAbsen
          type={"text"}
          name={"penjelasanIzin"}
          label={"Penjelasan Izin"}
          placeholder={"Jelaskan jenis izin anda sesuai dengan keadaan yang sebenarnya"}
          onChange={handleInputChange}
          required={true}
          readonly={false}
        />

        <InputAbsen
          type={"text"}
          name={"linkBukti"}
          label={"Link Bukti (opsional)"}
          placeholder={"Masukkan link dokumen bukti izin anda dalam link Google Drive"}
          onChange={handleInputChange}
          required={false}
          readonly={false}
        />

        <div className="mt-6">
          <Button
            type="submit"
            variant={"default"}
            size={"default"}
            disabled={formLoading}
            className={"cursor-pointer bg-blue-300 hover:bg-blue-600 hover:p-5 hover:-translate-y-2 hover:-translate-x-1 hover:text-white transition-all ease-out duration-500"}>
            {formLoading ? "Memproses..." : "Kirim Form Izin"}
          </Button>
        </div>
      </form>
    </>
  );
}
