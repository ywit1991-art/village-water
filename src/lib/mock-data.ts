export const MOCK_VILLAGES = Array.from({ length: 14 }).map((_, i) => ({
  id: i + 1,
  name: `หมู่ ${i + 1}`,
  // กำหนดตัวเลขตายตัว ไม่ใช้ Math.random()
  count: [12, 18, 9, 25, 14, 7, 20, 11, 16, 8, 22, 13, 19, 10][i], 
  elderly: [5, 8, 3, 10, 6, 2, 9, 4, 7, 3, 8, 5, 9, 4][i],
  disabled: [2, 3, 1, 4, 2, 1, 3, 2, 2, 1, 4, 2, 3, 1][i],
  bedridden: [1, 1, 0, 2, 1, 0, 1, 1, 1, 0, 2, 1, 1, 0][i],
}));

export const MOCK_AGES = [
  { name: 'เด็ก (0-14)', value: 120 },
  { name: 'วัยรุ่น (15-24)', value: 85 },
  { name: 'วัยทำงาน (25-59)', value: 310 },
  { name: 'สูงอายุ (60-69)', value: 150 },
  { name: 'สูงอายุมาก (70+)', value: 90 },
];

export const MOCK_STATUS = [
  { name: 'รับความช่วยเหลือแล้ว', value: 450, color: '#EC4899' },
  { name: 'รอดำเนินการ', value: 120, color: '#0EA5E9' },
  { name: 'ส่งต่อหน่วยงานอื่น', value: 80, color: '#F59E0B' },
];