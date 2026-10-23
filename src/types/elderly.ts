export interface ElderlyFormData {
  // ส่วนที่ 1: ข้อมูลทั่วไป
  maritalStatus: string;
  occupation: string;
  communityActivity: string;

  // ส่วนที่ 2: สุขภาพกาย
  weight: string;
  height: string;
  vision: string;
  hearing: string;
  selfRatedHealth: string;
  diseases: string[];
  physicalProblems: string[];
  exerciseHabit: string;
  smokingHabit: string;
  drinkingHabit: string;

  // ส่วนที่ 3: ความสามารถในการปฏิบัติกิจวัตรประจำวัน (ADL - Barthel Index)
  adlScores: Record<string, number>;

  // ส่วนที่ 4: สุขภาพจิต (TGDS - 15 ข้อ简短)
  tgdsScores: Record<string, number>;

  // ส่วนที่ 5: สุขภาพสังคม
  hasFinancialSupport: boolean;
  hasCaregiverSupport: boolean;
  hasMentalSupport: boolean;
}