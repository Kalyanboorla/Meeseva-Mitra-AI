// MeeSeva Mitra AI — Type definitions

export type Lang = 'en' | 'te';

export interface Requirement {
  req_type: 'document' | 'eligibility' | 'note';
  is_mandatory: 0 | 1;
  condition_note_en?: string;
  condition_note_te?: string;
  name_en: string;
  name_te?: string;
  description_en?: string;
  description_te?: string;
  sort_order?: number;
}

export interface Source {
  title: string;
  url: string;
  domain?: string;
  verified_at?: string;
  is_official: 0 | 1;
  notes?: string;
}

export interface Service {
  id: number;
  service_code: string;
  name_en: string;
  name_te?: string;
  slug: string;
  description_en: string;
  description_te?: string;
  eligibility_en?: string;
  eligibility_te?: string;
  procedure_en?: string;
  procedure_te?: string;
  fee_en?: string;
  fee_te?: string;
  processing_time_en?: string;
  processing_time_te?: string;
  official_url?: string;
  alternate_url?: string;
  portal_label_en?: string;
  portal_label_te?: string;
  category?: string;
  is_verified?: 0 | 1;
  verification_note?: string;
  dept_name_en?: string;
  dept_name_te?: string;
  requirements?: Requirement[];
  sources?: Source[];
  score?: number;
}

export interface SearchResult {
  query: string;
  results: Service[];
  count: number;
  lang: Lang;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source_services?: Pick<Service, 'name_en' | 'name_te' | 'slug' | 'official_url' | 'portal_label_en' | 'portal_label_te' | 'alternate_url'>[];
  ai_used?: boolean;
  detected_lang?: string;
  disclaimer?: string;
  timestamp: Date;
}

export interface AssistantResponse {
  answer: string;
  source_services: Pick<Service, 'name_en' | 'name_te' | 'slug' | 'official_url' | 'portal_label_en' | 'portal_label_te' | 'alternate_url'>[];
  ai_used: boolean;
  detected_lang?: string;
  disclaimer: string;
  session_id: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  db: 'connected' | 'unavailable';
  timestamp: string;
  version: string;
}

export interface FeedbackPayload {
  service_id?: number;
  session_id?: string;
  rating?: number;
  helpful?: boolean;
  comment?: string;
  lang?: Lang;
  page?: string;
}

export interface RejectionGuidanceResponse {
  status: string;
  rule_id: string;
  title: string;
  input_sanitized: string;
  had_privacy_redaction: boolean;
  explanation: string;
  steps: string[];
  escalation_channel: string;
  official_url: string;
  disclaimer: string;
  lang: string;
}

