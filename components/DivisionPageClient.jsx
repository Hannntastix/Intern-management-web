"use client"

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../app/firebase/config';
import DivisionCard from '@/components/DivisionCard';
import NavbarGeneral from '@/components/NavbarGeneral';
import NotFound from '../app/notFound/page';
import { useRouter } from 'next/navigation';

export default function DivisionPageClient() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [interns, setInterns] = useState([]);

    const route = useRouter();

    // Fetch interns data
    useEffect(() => {
        const fetchInterns = async () => {
            try {
                const res = await fetch('/api/intern');
                if (!res.ok) throw new Error('Gagal mengambil data intern');
                const data = await res.json();
                setInterns(data.interns || []);
            } catch (error) {
                console.error('Error fetching interns:', error);
                setInterns([]);
            }
        };

        fetchInterns();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const token = await user.getIdTokenResult();
                const admin = token.claims.role === "admin";
                setIsAdmin(admin);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const allDivisions = ['Umum', 'Produksi', 'Sosial', 'Distribusi', 'Nerwilis', 'PTID', 'Sektoral'];

    const groupedByDivisi = interns
        .filter(intern => intern.status === "aktif")
        .reduce((acc, intern) => {
            let divisiRaw = intern.divisi || 'tidak diketahui';
            if (divisiRaw === 'ptid`') divisiRaw = 'PTID';
            if (divisiRaw === 'sosial`') divisiRaw = 'Sosial';

            if (!allDivisions.includes(divisiRaw)) return acc;

            if (!acc[divisiRaw]) acc[divisiRaw] = [];
            acc[divisiRaw].push(intern);
            return acc;
        }, {});


    allDivisions.forEach(division => {
        if (!groupedByDivisi[division]) {
            groupedByDivisi[division] = [];
        }
    });

    const totalInterns = interns.length;
    const totalDivisions = Object.keys(groupedByDivisi).length;

    const pembimbingDivisi = {
        Umum: "Pak Gun Gun",
        Produksi: "Pak Darul",
        Sosial: "Pak Virgo",
        Distribusi: "Bu Erika",
        Nerwilis: "Bu April",
        PTID: "Bu Ari",
        Sektoral: "Bu Evie",
    };

    const handleRoute = () => {
        setLoading(true);
        route.push('/assignDivision')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className='p-6 max-w-7xl mx-auto'>
                <NavbarGeneral title="Dashboard Penempatan Tim" subTitle="Kelola penempatan tim untuk peserta magang" />
                <div className="bg-white shadow-sm rounded-xl mt-6">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Informasi Tim & Penempatan
                            </h1>
                            <p className="text-gray-600">
                                Kelola dan pantau distribusi peserta magang di setiap tim
                            </p>
                        </div>
                        <div className="flex justify-center space-x-8 text-center">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{totalInterns}</p>
                                <p className="text-sm text-gray-600">Total Peserta Magang</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-600">{totalDivisions}</p>
                                <p className="text-sm text-gray-600">Total Tim</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {Object.entries(groupedByDivisi).map(([divisi, anakMagang]) => (
                            <DivisionCard
                                key={divisi}
                                divisi={divisi}
                                interns={anakMagang}
                                pembimbing={pembimbingDivisi[divisi] || "Tidak diketahui"}
                            />
                        ))}
                    </div>
                    {isAdmin && (
                        <div className="text-center">
                            <button
                                onClick={handleRoute}
                                className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                Atur Penempatan Tim
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}