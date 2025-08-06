"use client"

import { faTruckField } from '@fortawesome/free-solid-svg-icons';
import { ArrowLeft, Building, Calendar, CheckCircle, GraduationCap, Hash, User, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import SuccessModal from './SuccessModal';
export default function InternDataManagement({
    id,
    nama,
    nim,
    prodi,
    kampus,
    tanggalMulai,
    tanggalSelesai,
    status,
    divisi,
    pembimbing,
}) {

    const [newNama, setNewNama] = useState(nama);
    const [newNim, setNewNim] = useState(nim);
    const [newProdi, setNewProdi] = useState(prodi);
    const [newKampus, setNewKampus] = useState(kampus);
    
    // Format tanggal ke YYYY-MM-DD untuk input type="date"
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Invalid date
        return date.toISOString().split('T')[0];
    };
    
    const [newTanggalMulai, setNewTanggalMulai] = useState(formatDate(tanggalMulai));
    const [newTanggalSelesai, setNewTanggalSelesai] = useState(formatDate(tanggalSelesai));
    const [newStatus, setNewStatus] = useState(status);
    const [interns, setInterns] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [newDivisi, setNewDivisi] = useState(divisi);
    const [newPembimbingId, setNewPembimbingId] = useState(pembimbing?._id || "");
    const [pembimbingList, setPembimbingList] = useState([]);

    const handleTanggalMulaiChange = (e) => setNewTanggalMulai(e.target.value);
    const handleTanggalSelesaiChange = (e) => setNewTanggalSelesai(e.target.value);
    const handleDivisiChange = (e) => setNewDivisi(e.target.value);
    const handlePembimbingChange = (e) => setNewPembimbing(e.target.value);
    const handleStatusChange = (e) => {
        const newStatusValue = e.target.value;
        setNewStatus(newStatusValue);

        if (newStatusValue !== 'aktif') {
            setNewDivisi('-');
        }
    };

    const route = useRouter();

    useEffect(() => {
        const fetchAllPembimbings = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/mentor', {
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error("Gagal mengambil daftar pembimbing");

                const data = await res.json();
                setPembimbingList(data);
            } catch (error) {
                console.error("Error fetching pembimbings: ", error);
                setError(error.message);
            } finally {
                setIsFetching(false);
            }
        };

        fetchAllPembimbings();
    }, []);

    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/intern/${id}`, {
                    cache: 'no-store',
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await res.json();
                setInterns(data.interns);
            } catch (error) {
                console.error("Error loading data: ", error);
                console.log('FETCHING:', `api/intern/${id}`);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInterns();
    }, [id]);

    if (error) {
        return <div className='text-red-500'>Error: {error}</div>;
    }

    const statusOptions = [
        { value: "aktif", label: "Aktif", color: "text-green-600" },
        { value: "selesai", label: "Selesai", color: "text-blue-600" },
        { value: "dikeluarkan", label: "Dikeluarkan", color: "text-red-600" },
        { value: "pending", label: "Pending", color: "text-yellow-600" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (newStatus === 'aktif' && !newPembimbingId) {
            alert('Silakan pilih pembimbing untuk status aktif.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/intern/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newNama,
                    newNim,
                    newProdi,
                    newKampus,
                    newTanggalMulai,
                    newTanggalSelesai,
                    newStatus,
                    newDivisi,
                    newPembimbing: newPembimbingId,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menyimpan data peserta magang');
            }

            setShowSuccessModal(true);

        } catch (error) {
            console.log('Error', error);
            alert('Terjadi kesalahan saat menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <>
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => route.push('/dataMagang')}
                            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>Kembali</span>
                        </button>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Data Peserta Magang</h1>
                            <p className="text-gray-600">Lengkapi formulir di bawah untuk merubah data anak magang baru</p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Informasi Peserta Magang
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Nama */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Lengkap
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="nama"
                                                    placeholder="Masukkan nama lengkap"
                                                    value={newNama}
                                                    onChange={(e) => setNewNama(e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* NIM */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                NIM
                                            </label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="nim"
                                                    placeholder="Nomor Induk Mahasiswa"
                                                    value={newNim}
                                                    onChange={(e) => setNewNim(e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Program Studi */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Program Studi
                                            </label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="prodi"
                                                    placeholder="Contoh: Teknik Informatika"
                                                    value={newProdi}
                                                    onChange={(e) => setNewProdi(e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Universitas */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Universitas/Kampus
                                            </label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    name="kampus"
                                                    placeholder="Nama universitas atau kampus"
                                                    value={newKampus}
                                                    onChange={(e) => setNewKampus(e.target.value)}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Section */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Periode Magang
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Tanggal Mulai */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanggal Mulai
                                            </label>
                                            <input
                                                type="date"
                                                name="tanggalMulai"
                                                value={newTanggalMulai}
                                                onChange={handleTanggalMulaiChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg"
                                            />
                                        </div>

                                        {/* Tanggal Selesai */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanggal Selesai
                                            </label>
                                            <input
                                                type="date"
                                                name="tanggalSelesai"
                                                value={newTanggalSelesai}
                                                onChange={handleTanggalSelesaiChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Assignment Section */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                        Penempatan & Status
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                name="status"
                                                value={newStatus}
                                                onChange={handleStatusChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg"
                                            >
                                                {statusOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>
                                                        {o.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Mentor Section */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Pemilihan Pembimbing
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pilih Pembimbing
                                        </label>
                                        <select
                                            name="pembimbing"
                                            value={newPembimbingId}
                                            onChange={(e) => setNewPembimbingId(e.target.value)}
                                            className="w-full cursor-pointer px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            <option value="">-- Tidak Ada / Belum Di Set --</option>
                                            {pembimbingList.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => route.back()}
                                            className="flex-1 px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={20} />
                                                    Perbarui Data
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Data Berhasil Diupdate!"
                message="Selamat, data berhasil diperbarui."
                buttonText="Lihat Semua Data"
                redirectUrl="/dataMagang"
            />

        </>
    )
}