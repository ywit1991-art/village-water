'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MUNICIPALITY_OFFICE } from '@/lib/constants';

// 👇 สร้างไอคอนหมุดเองด้วยโค้ด HTML (ไม่ต้องพึ่งไฟล์รูปภาพ) 👇
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: #EC4899; 
      width: 24px; 
      height: 24px; 
      border-radius: 50%; 
      border: 4px solid white; 
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%); 
        width: 8px; 
        height: 8px; 
        background-color: white; 
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12], // จุดกึ่งกลางของหมุด
});

interface Props {
  position: { lat: number; lng: number };
  setPosition: (pos: { lat: number; lng: number }) => void;
}

// คอมโพเนนต์จัดการการคลิกบนแผนที่
function LocationMarker({ position, setPosition }: Props) {
  useMapEvents({
    click(e) {
      // เมื่อคลิกบนแผนที่ ให้ย้ายหมุดไปที่จุดนั้น
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
          // เมื่อลากหมุดเสร็จ ให้อัปเดตพิกัดใหม่
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
        className="w-full h-full z-0"
        // 👇 เปิดการซูม/ลากปกติไว้ เพื่อให้用户可以เลือกพิกัดได้ 👇
        scrollWheelZoom={true} 
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      
      {/* 👇 แถบข้อความด้านล่าง (ใส่ pointer-events-none เพื่อไม่ให้มันบังการคลิกแผนที่) 👇 */}
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 text-xs text-center text-slate-600 py-1.5 rounded-lg pointer-events-none backdrop-blur z-[1000] shadow-sm font-medium">
        แตะบนแผนที่เพื่อปักหมุด หรือลากหมุดเพื่อปรับตำแหน่ง
      </div>
    </div>
  );
}