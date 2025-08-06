import PreviewSertifikat from "../../components/PreviewSertifikat";
import ProtectedRoute from "@/components/ProtectedRoutes";
import React from "react";

export default function SertifikatPreview() {
  return (
    <ProtectedRoute>
      <PreviewSertifikat />
    </ProtectedRoute>
  );
}