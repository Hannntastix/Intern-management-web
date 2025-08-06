"use client";
import React, { useState, useEffect } from "react";
import PreviewSertifikat from "../../components/PreviewSertifikat";
import NavbarGeneral from "@/components/NavbarGeneral";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase/config"; // sesuaikan dengan path firebase config Anda

export default function TemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditElement, setShowEditElement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const token = await user.getIdTokenResult();
          setRole(token.claims.role);
        } catch (error) {
          console.error("Error getting token:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch templates dari MongoDB
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/template");
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleCleanupTemplates = async () => {
    if (!confirm("Apakah kamu yakin ingin menghapus semua template kecuali DEFAULT?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/template/cleanup", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to clean up templates");
      }

      const data = await res.json();
      setMessage(data.message);
      // Refresh templates after cleanup
      fetchTemplates();
    } catch (error) {
      console.error("Error cleaning up templates:", error);
      setMessage("Gagal menghapus template");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000); // Clear message after 5 seconds
    }
  };

  const handleSetDefault = (id) => {
    setTemplates((prevTemplates) => prevTemplates.map((template) => (template._id === id ? { ...template, status: "DEFAULT" } : { ...template, status: "NON" })));
  };

  const handleOpenEditElement = (template) => {
    setSelectedTemplate(template);
    setShowEditElement(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/template", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTemplate),
      });

      if (!res.ok) throw new Error("Failed to save template");

      const updatedTemplate = await res.json();

      setTemplates((prevTemplates) => prevTemplates.map((template) => (template._id === updatedTemplate._id ? updatedTemplate : template)));
      setShowEditElement(false);
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Gagal menyimpan template");
    }
  };

  return (
    <div className="p-6">
      {role === "admin" ? (
        <>
          <NavbarGeneral
            title="Template Sertifikat Peserta Magang"
            subTitle="Atur elemen dalam template sertifikat yang akan digunakan untuk peserta magang"
          />

          <div className="bg-white rounded-xl shadow-lg border md:max-w-7xl mx-auto border-gray-100 p-2.5 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold">Template Sertifikat</h1>
              </div>
              <div>
                <button
                  onClick={handleCleanupTemplates}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors">
                  {loading ? "Processing..." : "Hapus Template Non-Default"}
                </button>
              </div>
            </div>

            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">{message}</div>}

            <div className="bg-blue-600 text-white px-4 py-2 rounded-t">Data Template</div>

            <div className="overflow-x-auto border">
              <table className="w-full table-auto text-sm">
                <thead className="bg-blue-200 text-left">
                  <tr>
                    <th className="px-4 py-2">NO</th>
                    <th className="px-4 py-2">TEMPLATE</th>
                    <th className="px-4 py-2">STATUS</th>
                    <th className="px-4 py-2">NAMA TEMPLATE</th>
                    <th className="px-4 py-2">PROCESS</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template, index) => (
                    <tr
                      key={template._id}
                      className="border-t">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">
                        {template.imageUrl ? (
                          <img
                            src={template.imageUrl}
                            alt="Template"
                            className="w-40 border"
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-bold text-blue-600">{template.status}</td>
                      <td className="px-4 py-2">{template.nama}</td>
                      <td className="px-4 py-2 space-x-2">
                        {/* <button
                        className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                        onClick={() => handleSetDefault(template._id)}
                      >
                        ATUR DEFAULT
                      </button> */}
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-pointer"
                          onClick={() => handleOpenEditElement(template)}>
                          ELEMENT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 text-sm text-gray-600">
                Total : {templates.length}, Row (1 - {templates.length})
              </div>
            </div>
          </div>

          {/* Modal Edit Element */}
          {showEditElement && selectedTemplate && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-auto p-3">
              <div className="bg-white w-full max-w-[1400px] h-[90vh] p-6 rounded shadow-lg flex gap-3 overflow-auto">
                {/* Preview kiri */}
                <div className="w-1/2 flex items-center justify-center">
                  <PreviewSertifikat template={selectedTemplate} />
                </div>

                {/* Form element */}
                <div className="w-1/2">
                  <h2 className="text-xl font-bold mb-4">EDIT ELEMENT</h2>
                  <form onSubmit={handleSubmit}>
                    {selectedTemplate.elements
                      .filter((el) => ["Nomor", "Tanggal", "Jabatan", "Nama Penandatangan"].includes(el.label))
                      .map((el, index) => (
                        <div
                          key={el.id}
                          className="mb-3">
                          <label className="text-sm">{el.label}</label>
                          <input
                            type="text"
                            value={el.value}
                            onChange={(e) => {
                              const updated = [...selectedTemplate.elements];
                              const targetIdx = updated.findIndex((x) => x.id === el.id);
                              updated[targetIdx].value = e.target.value;
                              setSelectedTemplate({
                                ...selectedTemplate,
                                elements: updated,
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.preventDefault();
                            }}
                            className="w-full border px-3 py-2 rounded"
                          />
                        </div>
                      ))}

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditElement(false)}
                        className="px-4 py-2 bg-gray-300 rounded cursor-pointer">
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
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
