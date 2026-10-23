import L from 'leaflet';
import { VULN, type VulnType } from '@/lib/constants';

export function buildMarkerIcon(vuln: VulnType[], isActive = false): L.DivIcon {
  const colors = vuln.map((v) => VULN[v].color);
  const background =
    colors.length === 0
      ? '#94A3B8'
      : colors.length === 1
        ? colors[0]
        : `conic-gradient(${colors
            .map((c, i) => {
              const s = (i * 100) / colors.length;
              const e = ((i + 1) * 100) / colors.length;
              return `${c} ${s}% ${e}%`;
            })
            .join(', ')})`;

  return L.divIcon({
    className: `custom-marker ${isActive ? 'active' : ''}`,
    html: `<div class="vuln-pin" style="background:${background};"></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
}