export interface WelfareFormData {
  // ส่วนที่ 1: สภาวะความยากลำบาก
  hardshipTypes: string[]; // ประเภทความยากลำบาก
  hardshipCauses: string[]; // สาเหตุ
  healthStatus: string; // สถานะสุขภาพ
  healthStatusDetail: string; // รายละเอียดเพิ่มเติม (เช่น ลักษณะความพิการ)

  // ส่วนที่ 2: ความต้องการ
  governmentNeeds: string[]; // สิ่งที่ต้องการให้รัฐช่วย
  governmentNeedsDetail: string;
  communityNeeds: string[]; // สิ่งที่ต้องการให้ชุมชนช่วย
  communityNeedsDetail: string;

  // ส่วนที่ 3: ประวัติการช่วยเหลือ
  hasReceivedHelp: boolean;
  receivedHelpTypes: string[]; // บริการ, เงิน, สิ่งของ
  receivedHelpYear: string;
  receivedHelpAgency: string;

  // ส่วนที่ 4: สภาพเศรษฐกิจ
  incomeSufficiency: string; // รายรับ
  expenseSufficiency: string; // รายจ่าย
  debtStatus: string; // หนี้สิน
  
  // ประวัติเพิ่มเติม
  personalHistory: string;
  familyHistory: string;
}