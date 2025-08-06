import PengaturanAbsenPage from "@/components/PengaturanAbsenPage";
import ProtectedRoute from "@/components/ProtectedRoutes";

export default function pengaturanAbsen() {
  return (
    <ProtectedRoute>
      <PengaturanAbsenPage />
    </ProtectedRoute>
  );
}
