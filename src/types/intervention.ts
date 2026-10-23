export interface Intervention {
  id: string;
  person_id: string;
  solution_type: string;
  agency: string | null;
  assistance_date: string | null;
  photo_url: string | null;
  created_by: string;
  created_at: string;
}