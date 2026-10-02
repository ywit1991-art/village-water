export type SurveyStatus = 'draft' | 'submitted' | 'approved'
export type OverallCondition = 'ดี' | 'พอใช้' | 'ต้องปรับปรุง' | 'เร่งด่วน'

// ========================================
// Water Rate Types
// ========================================
export type WaterRateType = 'flat' | 'tiered' | 'by_user_type'

export interface WaterRateTier {
  from: number
  to: number | null
  rate: number
  label?: string
}

// ========================================
// Entities
// ========================================
export interface Village {
  id: number
  village_no: number
  village_name: string
  tambon: string
  amphoe: string
  province: string
  created_at: string
}

export interface CommitteeMember {
  name: string
  position: string
  phone: string
}

export interface Pump {
  brand?: string
  model?: string
  hp?: string
  age?: string
  condition?: string
}

export interface Signature {
  name: string
  phone: string
  position: string
  date: string
}

export interface MaintenanceItem {
  status: string
  note: string
}

export interface Survey {
  id: string
  village_id: number
  water_system_id: number | null
  survey_date: string | null
  status: SurveyStatus

  water_system_name: string | null
  group_name: string | null
  location: string | null
  lat: number | null
  lng: number | null

  committee_status: string | null
  committee_order_no: string | null
  committee_order_date: string | null
  committee_start_date: string | null
  committee_term: string | null
  committee_members: CommitteeMember[]

  operator_name: string | null
  operator_position: string | null
  operator_phone: string | null
  operator_years: number | null
  operator_duties: string[]

  water_source_type: string[]
  water_source_name: string | null
  water_source_distance: number | null
  water_source_lat: number | null
  water_source_lng: number | null
  water_source_condition: string[]
  water_source_sufficiency: string | null
  water_source_notes: string | null

  pump_types: string[]
  pump_count: number | null
  pumps: Pump[]
  production_capacity: number | null    // ⭐ เพิ่ม

  
  electrical_phase: string | null
  electrical_meter_no: string | null
  control_box_condition: string[]
  control_box_other: string | null
  electrical_wiring_condition: string | null
  electrical_notes: string | null

  production_type: string[]
  production_other: string | null
  has_filter: string | null
  filter_type: string | null
  filter_condition: string[]
  chlorination: string | null

  tank_types: string[]
  tank_other: string | null
  tank_count: number | null
  tank_capacity: number | null
  tank_condition: string[]
  tank_surrounding: string[]
  tank_notes: string | null

  pipe_materials: string[]
  pipe_other: string | null
  pipe_main_size: string | null
  pipe_total_length: number | null
  pipe_condition: string[]
  problem_areas: string | null

  household_count: number | null
  user_count: number | null
  metered_user_count: number | null
  unmetered_user_count: number | null
  has_user_registry: string | null

  has_regulations: string | null
  meeting_frequency: string | null
  has_financial_books: string | null
  has_bank_account: string | null
  has_fee_collection: string | null
  water_rate_type: WaterRateType | null
  water_rate_tiers: WaterRateTier[] | null
  water_rate: number | null
  has_debt: string | null
  debt_notes: string | null

  has_maintenance: string | null
  maintenance_items: Record<string, MaintenanceItem>

  water_quality_appearance: string[]
  water_quality_other: string | null
  has_quality_test: string | null
  last_quality_test_date: string | null
  quality_test_result: string | null

  problems: string[]
  improvements: string[]
  committee_suggestions: string | null

  overall_condition: OverallCondition | null
  summary: string | null

  photos: string[]
  signatures: Signature[]

  created_by: string | null
  created_at: string
  updated_at: string
}

export interface VillageWithSurvey extends Village {
  survey: Survey | null
}

// ========================================
// Water System
// ========================================
export type SystemStatus = 'active' | 'inactive' | 'closed'

export interface WaterSystem {
  id: number
  village_id: number
  system_no: number
  system_name: string
  code: string | null
  lat: number | null
  lng: number | null
  status: SystemStatus
  overall_condition: OverallCondition | null
  user_count: number
  household_count: number
  water_source_type: string | null
  water_rate: number | null
  tank_capacity: number | null
  production_capacity: number | null    // ⭐ เพิ่ม
  tank_count: number | null
  water_source_sufficiency: string | null
  pipe_total_length: number | null
  operator_name: string | null
  operator_phone: string | null
  last_survey_id: string | null
  last_survey_date: string | null
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WaterSystemWithVillage extends WaterSystem {
  village: Village
}