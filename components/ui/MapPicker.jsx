"use client";

import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [-6.2, 106.8]; // Default to Jakarta

const markerIcon = L.icon({
  iconUrl: "/assets/image/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEventHandler({ onLocationPick, initialLocation, setMarkerPosition }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const position = [lat, lng];
      setMarkerPosition(position);
      onLocationPick({
        latitude: lat,
        longitude: lng
      });
    },
  });

  useEffect(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      const position = [
        parseFloat(initialLocation.latitude),
        parseFloat(initialLocation.longitude)
      ];
      setMarkerPosition(position);
      map.setView(position, 15);
    }
  }, [initialLocation, map, setMarkerPosition]);

  return null;
}

export default function MapPicker({ onLocationPick, initialLocation, radius = 100 }) {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      return [parseFloat(initialLocation.latitude), parseFloat(initialLocation.longitude)];
    }
    return DEFAULT_CENTER;
  });

  // Update map center when initial location changes
  useEffect(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      const newCenter = [parseFloat(initialLocation.latitude), parseFloat(initialLocation.longitude)];
      setMapCenter(newCenter);
      setMarkerPosition(newCenter);
    }
  }, [initialLocation]);

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: "400px", width: "100%" }}
        className="z-0">
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        <MapEventHandler 
          onLocationPick={onLocationPick}
          initialLocation={initialLocation}
          setMarkerPosition={setMarkerPosition}
        />
        {markerPosition && (
          <>
            <Marker 
              position={markerPosition} 
              icon={markerIcon}
            />
            <Circle 
              center={markerPosition}
              radius={radius}
              pathOptions={{ 
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.1
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
