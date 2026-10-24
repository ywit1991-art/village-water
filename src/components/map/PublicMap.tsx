'use client';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useMap } from 'react-leaflet';
import ThawangthongBoundary from './ThawangthongBoundary';

interface Village {
  id: number;
  name: string;
  count: number;
  color: string;
}

function MapController({ data }: { data: any }) {
  const map = useMap();
  useLayoutEffect(() => {
    map.invalidateSize();
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    if (map.getContainer()) resizeObserver.observe(map.getContainer());
    return () => resizeObserver.disconnect();
  }, [map]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        const bounds = L.geoJSON(data).getBounds();
        map.fitBounds(bounds, { padding: [10, 10] });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data, map]);
  return null;
}

export default function PublicMap({ villages }: { villages: Village[] }) {
  const [boundaryData, setBoundaryData] = useState<any>(null);

  useEffect(() => {
    fetch('/thawangthong.geojson')
      .then((res) => res.json())
      .then((data) => setBoundaryData(data))
      .catch((err) => console.error('ไม่พบไฟล์ขอบเขต:', err));
  }, []);

  return (
    <div className="absolute inset-0 bg-white">
      <MapContainer
        center={[19.168849, 99.915143]}
        zoom={13}
        className="w-full h-full z-0"
        // 👇 ล็อคแผนที่ ไม่ให้ลาก ไม่ให้ซูม 👇
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <MapController data={boundaryData} />

        {boundaryData && (
          <ThawangthongBoundary 
            boundary={boundaryData}
            spaceColor="#ffffff" // 👈 สีพื้นหลังนอกเขตเป็นสีขาว
            outlineColor="#EC4899"
          />
        )}
      </MapContainer>
    </div>
  );
}