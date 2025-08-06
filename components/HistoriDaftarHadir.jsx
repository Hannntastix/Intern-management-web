"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../app/firebase/config";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DaftarHadirTable from "./DaftarHadirTable";
import { useRouter } from "next/navigation";

export default function HistoriDaftarHadir() {
  const route = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  
  const handleMenuClick = (href) => {
    setIsLoading(true);
    setTimeout(() => {
      route.push(href);
    }, 500);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const token = await user.getIdTokenResult();
          const tokenRole = token.claims.role || "guest";
          console.log("Hasil dari tokenRole adalah : ", tokenRole);
          setUserRole(tokenRole);
          
          // Log peran pengguna - dipindahkan ke dalam useEffect terpisah
        } catch (error) {
          console.error("Error getting token:", error);
          setUserRole("guest"); // Default fallback
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setUserRole("guest");
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Effect terpisah untuk log role setelah state diperbarui
  useEffect(() => {
    if (userRole) {
      if (userRole === "admin") {
        console.log("Role anda adalah admin : ", userRole);
      } else {
        console.log("Role anda bukan admin : ", userRole);
      }
    }
  }, [userRole]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🔄 Riwayat Pengisian Daftar Hadir</h1>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <DaftarHadirTable />
          </div>
        </div>
      </div>
    </div>
  );
}
