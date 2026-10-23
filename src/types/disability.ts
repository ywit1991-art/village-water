export interface DisabilityFormData {
  // ส่วนที่ 1
  nickname: string;
  maritalStatus: string;
  education: string;
  houseStatus: string;
  houseCondition: string;
  houseFacilities: string[];
  
  // ส่วนที่ 2
  congenitalDiseases: string[];
  medicalRights: string[];
  medicalEquipment: string;
  healthNeeds: string;

  // ส่วนที่ 3
  isRegistered: boolean;
  disabilityType: string;
  disabilityCause: string;
  disabilityLevel: string;
  canCommunicate: boolean;

  // ส่วนที่ 4
  hasCaregiver: boolean;
  caregiverName: string;
  caregiverRelation: string;
  caregiverPhone: string;

  // ส่วนที่ 5
  occupations: string[];
  incomeLevel: string;
  familyIncome: string;
  hasDebt: boolean;
  receivedWelfare: string[];
  socialActivities: string[];
  needsVocationalTraining: boolean;

  // ส่วนที่ 6 (ADL)
  adlScores: Record<string, number>;
}