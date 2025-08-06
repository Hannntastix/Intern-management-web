import HistoriIzin from "@/components/HistoriIzin";
import ProtectedRoute from "@/components/ProtectedRoutes";

export default function historiIzin(){
    return(
        <ProtectedRoute>
            <HistoriIzin />
        </ProtectedRoute>
    )
}