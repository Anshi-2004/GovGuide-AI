/**
 * GovGuide AI — API Client
 * Centralized fetch wrapper for FastAPI backend at localhost:8000
 */

const API_BASE = "http://localhost:8000";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Chat
export function sendChat({ question, language, state, category, income, document_text, session_id }) {
  return request("/api/chat", {
    method: "POST",
    body: JSON.stringify({ question, language, state, category, income, document_text, session_id }),
  });
}

// Schemes
export function fetchSchemes({ state, category, income, search } = {}) {
  const params = new URLSearchParams();
  if (state && state !== "Select State" && state !== "All") params.append("state", state);
  if (category && category !== "Select Category" && category !== "All") params.append("category", category);
  if (search) params.append("search", search);
  return request(`/api/schemes?${params.toString()}`);
}

// Document analyze
export function analyzeDocument({ document_text, language, document_title }) {
  return request("/api/documents/analyze", {
    method: "POST",
    body: JSON.stringify({ document_text, language, document_title }),
  });
}

// Feedback
export function submitFeedback({ question, answer_preview, feedback_type, language, state, category }) {
  return request("/api/feedback", {
    method: "POST",
    body: JSON.stringify({ question, answer_preview, feedback_type, language, state, category }),
  });
}

// Feedback stats
export function fetchFeedbackStats() {
  return request("/api/feedback/stats");
}

// Health
export function fetchHealth() {
  return request("/api/health");
}
