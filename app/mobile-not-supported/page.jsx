"use client";
import { useEffect } from "react";

export default function MobileNotSupported() {
  useEffect(() => {
    // Redirect back to dashboard after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Desktop Only
        </h1>
        
        <p className="text-gray-600 mb-6">
          Fitur ini hanya tersedia di desktop. Silakan akses melalui komputer atau laptop untuk melihat sertifikat Anda.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Kembali
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors"
          >
            Ke Dashboard
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Redirecting ke dashboard dalam 3 detik...
        </p>
      </div>
    </div>
  );
} 