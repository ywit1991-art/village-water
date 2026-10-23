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

// ฟังก์ชันสำหรับซูมให้เห็นพื้นที่ทั้งหมด
function FitBounds({ persons }: { persons: Person[] }) {
  const map = useMap();
  useEffect(() => {
    if (persons.length > 0) {
      const validPersons = persons.filter(p => p.latitude && p.longitude);
      if (validPersons.length > 0) {
        const bounds = L.latLngBounds(validPersons.map(p => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [persons, map]);
  return null;
}

export default function MapView({ persons, onSelect }: Props) {
  return (
    <div className="absolute inset-0">
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

        {/* 👇 ลบ CircleMarker จุดสีฟ้าออกแล้ว 👇 */}

        {persons
          .filter(p => p.latitude != null && p.longitude != null)
          .map((p) => (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={buildMarkerIcon(p.vulnerabilities as any)}
              eventHandlers={{ click: () => onSelect(p) }}
            />
        ))}
      </MapContainer>
    </div>
  );
}