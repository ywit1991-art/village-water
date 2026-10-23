export interface Person {
  id: string;
  national_id: string;
  prefix: string | null;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  photo_urls: string[];
  note: string | null;
  vulnerabilities: string[];
  created_by: string;
  created_at: string;
  interventions?: Intervention[];
}

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