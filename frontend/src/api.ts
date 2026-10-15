// MeeSeva Mitra AI — API client
import axios from 'axios';
import type {
  Service, SearchResult, AssistantResponse, HealthResponse, FeedbackPayload,
  RejectionGuidanceResponse,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Health ────────────────────────────────────────────────────────────────
export const checkHealth = async (): Promise<HealthResponse> => {
  const res = await api.get<HealthResponse>('/api/health');
  return res.data;
};

// ── Services (with offline caching) ──────────────────────────────────────────
export const fetchAllServices = async (lang = 'en'): Promise<Service[]> => {
  try {
    const res = await api.get<{ services: Service[] }>('/api/services', { params: { lang } });
    if (res.data?.services && res.data.services.length > 0) {
      try {
        localStorage.setItem(`meeseva_services_cache_${lang}`, JSON.stringify({
          data: res.data.services,
          cachedAt: new Date().toISOString()
        }));
      } catch {
        // ignore storage errors
      }
    }
    return res.data.services;
  } catch (err) {
    try {
      const cached = localStorage.getItem(`meeseva_services_cache_${lang}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.data;
      }
    } catch {
      // ignore
    }
    throw err;
  }
};

export const searchServices = async (q: string, lang = 'en'): Promise<SearchResult> => {
  const res = await api.get<SearchResult>('/api/services/search', { params: { q, lang } });
  return res.data;
};

export const fetchServiceDetail = async (slug: string): Promise<Service> => {
  try {
    const res = await api.get<Service>(`/api/services/${slug}`);
    if (res.data) {
      try {
        localStorage.setItem(`meeseva_service_detail_${slug}`, JSON.stringify({
          data: res.data,
          cachedAt: new Date().toISOString()
        }));
      } catch {
        // ignore
      }
    }
    return res.data;
  } catch (err) {
    try {
      const cached = localStorage.getItem(`meeseva_service_detail_${slug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.data;
      }
    } catch {
      // ignore
    }
    throw err;
  }
};

// ── AI Assistant ──────────────────────────────────────────────────────────
export const sendMessage = async (
  message: string,
  lang: string,
  sessionId: string,
  history: { role: string; content: string }[] = [],
): Promise<AssistantResponse> => {
  const res = await api.post<AssistantResponse>('/api/assistant', {
    message,
    lang,
    session_id: sessionId,
    history: history.slice(-5),
  });
  return res.data;
};

// ── Feedback ──────────────────────────────────────────────────────────────
export const submitFeedback = async (payload: FeedbackPayload): Promise<void> => {
  await api.post('/api/feedback', payload);
};

// ── Application Error & Rejection Guidance ────────────────────────────────────
export const fetchRejectionGuidance = async (
  errorText: string,
  serviceSlug?: string,
  lang = 'en',
): Promise<RejectionGuidanceResponse> => {
  const res = await api.post<RejectionGuidanceResponse>('/api/guidance/rejection', {
    error_text: errorText,
    service_slug: serviceSlug,
    lang,
  });
  return res.data;
};

