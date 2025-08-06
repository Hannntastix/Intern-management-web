// components/SertifikatPreview.jsx
import React from "react";

export default function SertifikatPreview({ template }) {
  if (!template) return null;

  return (
    <div
      className="relative"
      style={{
        width: "100%",
        maxWidth: "700px",
        aspectRatio: "1.420", // Ukuran rasio landscape A4
        backgroundColor: "#ffffff", // Fallback background putih
        border: "1px solid #ccc",
        overflow: "hidden",
      }}
    >
      {/* Gunakan <img> sebagai background agar bisa ditangkap oleh react-to-print */}
      <img
        src={template.imageUrl}
        alt="Background Sertifikat"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      {/* Logo BPS dan Tulisan */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 1,
        }}
      >
        <img
          src="/uploads/logobps.png"
          alt="Logo Kiri"
          style={{
            width: "60px",
            height: "auto",
          }}
        />
        <div
          style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontStyle: "italic",
            textTransform: "uppercase",
            fontSize: "8px",
            lineHeight: "1.5",
            marginTop: "-10px",
            marginLeft: "-3px",
          }}
        >
          <div>BADAN PUSAT STATISTIK</div>
          <div>KOTA BANDAR LAMPUNG</div>
        </div>
      </div>

      {/* Logo Berakhlak */}
      <img
        src="/uploads/logoberakhlak.png"
        alt="Logo Kanan 1"
        style={{
          position: "absolute",
          top: "15px",
          right: "100px",
          width: "78px",
          zIndex: 1,
        }}
      />

      {/* Logo Melayani Bangsa */}
      <img
        src="/uploads/logomelayani.png"
        alt="Logo Kanan 2"
        style={{
          position: "absolute",
          top: "15px",
          right: "20px",
          width: "70px",
          zIndex: 1,
        }}
      />

      {/* Elemen Sertifikat */}
      {template.elements.map((el) => (
        <div
          key={el.id}
          style={{
            position: "absolute",
            top: el.top ? `${el.top - 60}px` : "0px", // Subtract 80px to move elements further up
            left: el.left ? `${el.left}%` : "0%",
            transform: el.transform || "translateX(-50%)",
            fontSize: el.fontSize ? `${el.fontSize}px` : "16px",
            fontWeight: el.fontWeight || "normal",
            fontFamily: el.fontFamily || "inherit",
            maxWidth: el.maxWidth || "500px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.4",
            textAlign: el.textAlign || "center",
            zIndex: 1,
            ...(el.label === "Jabatan" && {
              width: "190px",
              minWidth: "190px",
              maxWidth: "190px",
              display: "block",
              wordWrap: "break-word",
              whiteSpace: "normal",
            }),
          }}
        >
          {el.value}
        </div>
      ))}
    </div>
  );
}
