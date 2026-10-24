'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ฟังก์ชันซูมให้พอดีกับขอบเขตตำบล
function FitBounds({ data }: { data: any }) {
  const map = useMap();
  useEffect(() => {
    if (data) {
      // ใช้ GeoJSON ในการหาขอบเขต
      const bounds = L.geoJSON(data).getBounds();
      map.fitBounds(bounds, { padding: [10, 10] });
      // ล็อคไม่ให้ลากออกนอกพื้นที่
      map.setMaxBounds(bounds); 
    }
  }, [data, map]);
  return null;
}

export default function PublicMap({ villages }: { villages: any[] }) {
  const [geoData, setGeoData] = useState<any>(null);
  const [maskPositions, setMaskPositions] = useState<any[]>([]);

  useEffect(() => {
    // โหลดไฟล์ขอบเขต
    fetch('/thawangthong.geojson')
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
        
        // คำนวณพิกัดเพื่อทำ "หน้ากากสีขาว" (Mask)
        if (data.features && data.features[0].geometry.type === 'Polygon') {
          // ดึงพิกัดตำบล แล้วสลับจาก [Lng, Lat] เป็น [Lat, Lng] ให้ Leaflet
          const coords = data.features[0].geometry.coordinates[0];
          const innerRing = coords.map((c: any) => [c[1], c[0]]);
          
          // สร้างสี่เหลี่ยมผืนผ้าขนาดใหญ่ครอบโลกทั้งใบ
          const outerRing = [
            [90, -180], [90, 180], [-90, 180], [-90, -180]
          ];
          
          // ประกาศพิกัดแบบมีรูตรงกลาง (Hole)
          setMaskPositions([outerRing, innerRing]);
        }
      })
      .catch((err) => console.error('ไม่พบไฟล์ geojson:', err));
  }, []);

  // ตั้งค่าสีเส้นขอบตำบล (สีฟ้า) และพื้นหลัง (สีชมพู)
  const getStyle = () => {
    return {
      fillColor: '#FCE7F3', // ชมพูอ่อน
      weight: 3,            // ความหนาเส้นขอบ
      opacity: 1,
      color: '#0EA5E9',     // สีฟ้า
      fillOpacity: 0.8,     // ความทึบของสีชมพู
    };
  };

  return (
    <div className="w-full h-full relative z-0 bg-white">
      <MapContainer
        center={[19.1750, 99.9150]}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
        dragging={false}          // ล็อคไม่ให้ลากแผนที่
        scrollWheelZoom={false}   // ล็อคไม่ให้ซูมด้วยเมาส์
        doubleClickZoom={false}   // ล็อคไม่ให้ดับเบิ้ลคลิกซูม
        touchZoom={false}         // ล็อคไม่ให้ซูมด้วยนิ้ว
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {geoData && (
          <>
            <FitBounds data={geoData} />
            
            {/* 👇 1. วาดหน้ากากสีขาวทึบคลุมรอบนอก (โดยเว้นรูตรงกลางไว้) 👇 */}
            {maskPositions.length > 0 && (
              <Polygon 
                positions={maskPositions} 
                pathOptions={{ 
                  color: 'white', 
                  fillColor: 'white', 
                  fillOpacity: 1, // ทึบ 100%
                  weight: 0, 
                  interactive: false,
                  fillRule: 'evenodd' // บังคับให้ตรงกลางเป็นรูโปร่งใส
                }} 
              />
            )}

            {/* 👇 2. วาดพื้นที่ตำบลท่าวังทอง (สีชมพูขอบฟ้า) ทับลงไป 👇 */}
            <GeoJSON
              data={geoData}
              style={getStyle}
              interactive={false}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}