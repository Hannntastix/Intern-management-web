// components/LocationMap.js
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Perbaikan untuk ikon Leaflet yang tidak muncul
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Komponen ini menerima props: onLocationUpdate dan coords
const LocationMap = ({ onLocationUpdate, coords }) => {
  // Jika tidak ada koordinat, tampilkan pesan
  if (!coords) {
    return <p>Tidak ada data lokasi untuk ditampilkan.</p>;
  }

  // Jika koordinat sudah ada, tampilkan peta
  return (
    <div className="mb-6">
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[coords.latitude, coords.longitude]}>
          <Popup>
            Ini adalah lokasi Anda saat ini. <br />
            Lat: {coords.latitude.toFixed(4)}, Long: {coords.longitude.toFixed(4)}
            {coords.accuracy && (
              <p>Akurasi: ±{Math.round(coords.accuracy)} meter</p>
            )}
          </Popup>
        </Marker>
        
        {/* Menampilkan radius akurasi jika tersedia */}
        {coords.accuracy && (
          <Circle
            center={[coords.latitude, coords.longitude]}
            radius={coords.accuracy}
            pathOptions={{ 
              color: 'blue',
              fillColor: '#3388ff',
              fillOpacity: 0.1
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;