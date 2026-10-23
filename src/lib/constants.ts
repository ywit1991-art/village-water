export const VULN = {
  ELDERLY: { label: 'ผู้สูงอายุ', color: '#A855F7', emoji: '👵' },
  DISABLED: { label: 'ผู้พิการ', color: '#F97316', emoji: '♿' },
  BEDRIDDEN: { label: 'ผู้ป่วยติดเตียง', color: '#EF4444', emoji: '🛏️' },
  LOW_INCOME: { label: 'ครัวเรือนรายได้น้อย', color: '#F59E0B', emoji: '💰' },
  PREGNANT: { label: 'ตั้งครรภ์/เลี้ยงเดี่ยว', color: '#3B82F6', emoji: '🤰' },
} as const;

export type VulnType = keyof typeof VULN;

// พิกัดสำนักงานเทศบาล (สมมติ: บางพลี สมุทรปราการ)
export const MUNICIPALITY_OFFICE = { lat: 19.1750, lng: 99.9150 };