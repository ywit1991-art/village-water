'use client';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useLayoutEffect } from 'react';
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
        map.setMaxBounds(bounds);
        map.options.maxBoundsViscosity = 1.0;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data, map]);
  return null;
}

// 👇 ฟังก์ชันสร้างตารางกริด 14 ช่องจากขอบเขตตำบล 👇
const generateGrid = (boundaryData: any) => {
  if (!boundaryData) return null;
  const bounds = L.geoJSON(boundaryData).getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  
  const rows = 4;
  const cols = 4;
  const latStep = (ne.lat - sw.lat) / rows;
  const lngStep = (ne.lng - sw.lng) / cols;

  const features = [];
  let id = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (id > 14) break;
      features.push({
        type: 'Feature',
        properties: { id: id },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [sw.lng + c * lngStep, sw.lat + r * latStep],
            [sw.lng + (c + 1) * lngStep, sw.lat + r * latStep],
            [sw.lng + (c + 1) * lngStep, sw.lat + (r + 1) * latStep],
            [sw.lng + c * lngStep, sw.lat + (r + 1) * latStep],
            [sw.lng + c * lngStep, sw.lat + r * latStep]
          ]]
        }
      });
      id++;
    }
  }
  return { type: 'FeatureCollection', features };
};

export default function PublicMap({ villages }: { villages: Village[] }) {
  const [boundaryData, setBoundaryData] = useState<any>(null);
  const [gridData, setGridData] = useState<any>(null);

  useEffect(() => {
    fetch('/thawangthong.geojson')
      .then((res) => res.json())
      .then((data) => {
        setBoundaryData(data);
        setGridData(generateGrid(data)); // สร้างกริดเมื่อโหลดขอบเขตเสร็จ
      })
      .catch((err) => console.error('ไม่สามารถโหลดไฟล์ขอบเขตได้:', err));
  }, []);

  // 👇 ฟังก์ชันลงสีแต่ละช่องตามข้อมูลหมู่บ้าน 👇
  const getStyle = (feature: any) => {
    const villageId = feature.properties.id;
    const villageInfo = villages.find(v => v.id === villageId);
    return {
      fillColor: villageInfo?.color || '#FDF2F8',
      weight: 1,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const villageId = feature.properties.id;
    const villageInfo = villages.find(v => v.id === villageId);
    if (villageInfo) {
      layer.bindTooltip(
        `<div class="text-center px-2 py-1">
          <div class="font-bold text-slate-800 text-sm mb-1">${villageInfo.name}</div>
          <div class="font-bold text-xl" style="color: ${villageInfo.color}">${villageInfo.count} คน</div>
        </div>`,
        { permanent: false, direction: 'center', className: 'custom-tooltip', sticky: true }
      );
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-50">
      <MapContainer
        center={[19.168849, 99.915143]}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
        dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <MapController data={boundaryData} />

        {/* 👇 วาดตารางกริดสี (อยู่ใต้ Mask) 👇 */}
        {gridData && (
          <GeoJSON 
            data={gridData} 
            style={getStyle} 
            onEachFeature={onEachFeature} 
          />
        )}

        {/* 👇 Mask ขอบเขต (อยู่บนสุด เพื่อตัดขอบกริดให้เป็นรูปตำบล) 👇 */}
        {boundaryData && (
          <ThawangthongBoundary 
            boundary={boundaryData}
            spaceColor="#ffffff"
            outlineColor="#EC4899"
          />
        )}
      </MapContainer>
    </div>
  );
}