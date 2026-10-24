'use client';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { buildMarkerIcon } from './MarkerIcon';
import { MUNICIPALITY_OFFICE } from '@/lib/constants';
import type { Person } from '@/types';
import { useEffect } from 'react';
import L from 'leaflet';

interface Props {
  persons: Person[];
  onSelect: (p: Person) => void;
}

// ฟังก์ชันซูมเข้าหาหมุด
function FitBounds({ persons }: { persons: Person[] }) {
  const map = useMap();
  useEffect(() => {
    // กรองเอาเฉพาะที่มีพิกัดเป็นตัวเลขจริงๆ
    const validPersons = persons.filter(p => !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude)));
    
    if (validPersons.length > 0) {
      const bounds = L.latLngBounds(validPersons.map(p => [Number(p.latitude), Number(p.longitude)]));
      // ซูมแบบนุ่มนวล
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [persons, map]);
  return null;
}

export default function MapView({ persons, onSelect }: Props) {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[MUNICIPALITY_OFFICE.lat, MUNICIPALITY_OFFICE.lng]}
        zoom={13}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        <FitBounds persons={persons} />

        {/* 👇 วาดหมุดลงบนแผนที่ 👇 */}
        {persons.map((p) => {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);

          // ถ้าพิกัดไม่ถูกต้อง ให้ข้ามไป
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={p.id}
              position={[lat, lng]}
              icon={buildMarkerIcon(p.vulnerabilities as any)}
              eventHandlers={{ click: () => onSelect(p) }}
              zIndexOffset={1000} // 👈 ดันให้หมุดอยู่บนสุด ไม่ถูกทับ
            />
          );
        })}
      </MapContainer>
    </div>
  );
}