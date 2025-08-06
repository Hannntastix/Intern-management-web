"use client"
import React from 'react';
import ProtectedRoute from "@/components/ProtectedRoutes";
import InternDataManagement from "@/components/InternDataManagement";

export default function EditDataPage({ params }) {
  const { id } = params;
  
  return (
    <ProtectedRoute>
      <EditDataContent id={id} />
    </ProtectedRoute>
  );
}

// Client Component untuk menampilkan konten
function EditDataContent({ id }) {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/intern/${id}`, {
          headers: {
            'Cache-Control': 'no-store'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch intern data');
        }
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
        setError('Data intern tidak ditemukan atau terjadi kesalahan saat mengambil data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Memuat...</h2>
        </div>
      </div>
    );
  }

  if (error || !data || !data.intern) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-500">Error</h2>
          <p className="mt-2">{error || 'Data intern tidak ditemukan atau terjadi kesalahan saat mengambil data.'}</p>
        </div>
      </div>
    );
  }
  
  const { nama, nim, prodi, kampus, tanggalMulai, tanggalSelesai, divisi, status, pembimbing } = data.intern;
  
  return (
    <InternDataManagement 
      id={id} 
      nama={nama} 
      nim={nim} 
      prodi={prodi} 
      kampus={kampus} 
      tanggalMulai={tanggalMulai} 
      tanggalSelesai={tanggalSelesai} 
      divisi={divisi} 
      status={status} 
      pembimbing={pembimbing} 
    />
  );
}
