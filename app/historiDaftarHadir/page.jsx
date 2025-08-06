import ProtectedRoute from '@/components/ProtectedRoutes';
import HistoriDaftarHadir from '@/components/HistoriDaftarHadir';
import useEffect from 'react';

export default function historiDaftarHadir(){
    return(
        <ProtectedRoute>
            <HistoriDaftarHadir />
        </ProtectedRoute>
    )
}