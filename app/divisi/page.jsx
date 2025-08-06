import DivisionPageClient from '@/components/DivisionPageClient';
import ProtectedRoute from '@/components/ProtectedRoutes';

export default function DivisiPage() {
  return (
    <ProtectedRoute>
      <DivisionPageClient />
    </ProtectedRoute>
  )
}