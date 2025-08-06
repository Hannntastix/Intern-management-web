import Absen from "@/components/Absen";
import ProtectedRoute from "@/components/ProtectedRoutes";

export default function AbsenPage(){
    return(
        <ProtectedRoute>
            <Absen />
        </ProtectedRoute>
        
    )
}