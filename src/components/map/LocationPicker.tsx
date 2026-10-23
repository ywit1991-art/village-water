'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MUNICIPALITY_OFFICE } from '@/lib/constants';

// สร้างไอคอนหมุดสีแดงสำหรับปักพิกัด
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="vuln-pin" style="background:#EF4444;"></div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

interface Props {
  position: { lat: number; lng: number };
  setPosition: (pos: { lat: number; lng: number }) => void;
}

// คอมโพเนนต์จัดการการคลิกบนแผนที่
function LocationMarker({ position, setPosition }: Props) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  ) : null;
}

export default function LocationPicker({ position, setPosition }: Props) {
  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 z-0 relative">
      <MapContainer
        center={position.lat ? [position.lat, position.lng] : [MUNICIPALITY_OFFICE.lat, MUNICIPALITY_OFFICE.lng]}
        zoom={15}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 text-xs text-center text-slate-600 py-1 rounded-lg pointer-events-none backdrop-blur">
        แตะบนแผนที่เพื่อปักหมุด หรือลากหมุดเพื่อปรับตำแหน่ง
      </div>
    </div>
  );
}