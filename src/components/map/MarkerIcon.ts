import L from 'leaflet';
import { VULN, type VulnType } from '@/lib/constants';

export function buildMarkerIcon(vuln: VulnType[], isActive = false): L.DivIcon {
  // 🛡️ ดัก Error เผื่อข้อมูล vulnerabilities ส่งมาเป็นค่าว่างหรือผิดรูปแบบ
  const safeVuln = Array.isArray(vuln) ? vuln : [];
  
  let color = '#EC4899'; // สีชมพูเริ่มต้น

  if (safeVuln.length > 0 && VULN[safeVuln[0]]) {
    color = VULN[safeVuln[0]].color;
  }

  return L.divIcon({
    className: 'custom-marker', // ใช้คลาสจาก globals.css
    html: `<div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12], // จุดกึ่งกลางหมุด
  });
}