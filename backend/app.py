"""
MeeSeva Mitra AI — Flask Application
Main entrypoint: defines all REST API endpoints.
"""

from __future__ import annotations
import os
import sys
import time
import re
import uuid
from collections import defaultdict
from datetime import datetime, timezone

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv

from db import ping_db, get_db_type
from services import (
    search_services,
    get_all_services,
    get_service_by_slug,
    get_service_by_id,
    save_feedback,
    analyze_rejection_error,
    redact_sensitive_data,
)
from ai_assistant import generate_response

load_dotenv()

# ── App factory ───────────────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

_cors_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]
CORS(app, origins=_cors_origins, supports_credentials=False)

# ── Simple in-memory rate limiter for AI endpoint ─────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
AI_RATE_LIMIT = int(os.getenv("AI_RATE_LIMIT", 10))  # requests per minute


def _check_rate_limit(ip: str) -> bool:
    """Return True if the request is within limits, False if exceeded."""
    now = time.time()
    window = 60.0
    times = [t for t in _rate_store[ip] if now - t < window]
    times.append(now)
    _rate_store[ip] = times
    return len(times) <= AI_RATE_LIMIT


def _sanitize_str(value: str | None, max_len: int = 500) -> str:
    """Sanitize a string input."""
    if not value:
        return ""
    return re.sub(r"[<>\"']", "", str(value)).strip()[:max_len]


def _json_error(message: str, code: int = 400) -> tuple:
    return jsonify({"error": message, "status": code}), code


# ── Root Welcome ─────────────────────────────────────────────────────────────

@app.get("/")
def index():
    return jsonify({
        "name": "MeeSeva Mitra AI — Backend API",
        "version": "1.0.0",
        "status": "online",
        "health": "/api/health",
        "services": "/api/services",
        "search": "/api/services/search?q=income",
        "assistant": "/api/assistant",
        "frontend": "http://localhost:5173",
        "message": "Backend API is running. Access the user interface at http://localhost:5173",
    })


# ── Health check ──────────────────────────────────────────────────────────────


@app.get("/api/health")
def health():
    """
    GET /api/health
    Returns application and database health status.
    """
    db_ok = ping_db()
    return jsonify({
        "status": "ok" if db_ok else "degraded",
        "db": "connected" if db_ok else "unavailable",
        "engine": get_db_type() if db_ok else None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
    }), 200 if db_ok else 503


# ── Services catalogue ────────────────────────────────────────────────────────

@app.get("/api/services")
def list_services():
    """
    GET /api/services
    Returns all active services.
    Query params:
      lang=en|te  (default: en)
    """
    lang = request.args.get("lang", "en")
    if lang not in ("en", "te"):
        lang = "en"

    services = get_all_services(lang)
    return jsonify({
        "services": services,
        "count": len(services),
        "lang": lang,
    })


@app.get("/api/services/search")
def search():
    """
    GET /api/services/search?q=<query>&lang=en|te
    Hybrid search: MySQL FULLTEXT + keyword matching.
    """
    q = _sanitize_str(request.args.get("q", ""), max_len=300)
    lang = request.args.get("lang", "en")
    if lang not in ("en", "te"):
        lang = "en"

    if not q or len(q) < 2:
        return _json_error("Search query 'q' must be at least 2 characters.", 400)

    results = search_services(q, lang)
    return jsonify({
        "query": q,
        "results": results,
        "count": len(results),
        "lang": lang,
    })


@app.get("/api/services/<slug>")
def service_detail(slug: str):
    """
    GET /api/services/<slug>
    Returns full service details including requirements and sources.
    """
    slug_clean = re.sub(r"[^\w-]", "", slug)[:100]
    service = get_service_by_slug(slug_clean)
    if not service:
        return _json_error(f"Service '{slug_clean}' not found.", 404)
    return jsonify(service)


# ── AI Assistant ──────────────────────────────────────────────────────────────

@app.post("/api/assistant")
def assistant():
    """
    POST /api/assistant
    Body (JSON):
      {
        "message": "string (required)",
        "lang": "en|te (default: en)",
        "session_id": "string (optional, for continuity)",
        "history": [{"role": "user|assistant", "content": "..."}]  (optional, last 5)
      }
    Returns:
      {
        "answer": "...",
        "source_services": [...],
        "ai_used": bool,
        "disclaimer": "..."
      }
    """
    # Rate limiting
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    if not _check_rate_limit(client_ip):
        return _json_error("Too many requests. Please wait a moment before asking again.", 429)

    data = request.get_json(silent=True) or {}
    message = _sanitize_str(data.get("message", ""), max_len=500)
    lang = data.get("lang") or data.get("language") or "en"
    session_id = _sanitize_str(data.get("session_id", ""), max_len=100) or str(uuid.uuid4())
    history = data.get("history", [])

    if lang not in ("en", "te", "telugish", "auto"):
        lang = "auto"

    if not message or len(message) < 3:
        return _json_error("'message' must be at least 3 characters.", 400)

    # Privacy filter: Redact Aadhaar, OTPs, or phone numbers before processing
    cleaned_message, had_redaction = redact_sensitive_data(message)

    # Retrieve relevant services for RAG context
    services = search_services(cleaned_message, lang)

    # Generate response (AI or rule-based fallback)
    result = generate_response(cleaned_message, services, lang, history[-5:] if history else [])
    result["session_id"] = session_id
    result["had_privacy_redaction"] = had_redaction
    return jsonify(result)


# ── Application Error & Rejection Guidance ────────────────────────────────────

@app.post("/api/guidance/rejection")
def rejection_guidance():
    """
    POST /api/guidance/rejection
    Body (JSON):
      {
        "error_text": "string (required, citizen description or officer remarks)",
        "service_slug": "string (optional)",
        "lang": "en|te|telugish (default: en)"
      }
    Returns:
      {
        "status": "success",
        "rule_id": "...",
        "title": "...",
        "explanation": "...",
        "steps": [...],
        "escalation_channel": "...",
        "official_url": "...",
        "had_privacy_redaction": bool,
        "disclaimer": "..."
      }
    """
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    if not _check_rate_limit(client_ip):
        return _json_error("Too many requests. Please wait a moment before trying again.", 429)

    data = request.get_json(silent=True) or {}
    error_text = _sanitize_str(data.get("error_text", ""), max_len=1000)
    service_slug = _sanitize_str(data.get("service_slug", ""), max_len=100) or None
    lang = data.get("lang", "en")
    if lang not in ("en", "te", "telugish"):
        lang = "en"

    if not error_text or len(error_text) < 3:
        return _json_error("'error_text' must be at least 3 characters.", 400)

    result = analyze_rejection_error(error_text, service_slug, lang)
    return jsonify(result), 200


# ── Feedback ──────────────────────────────────────────────────────────────────

@app.post("/api/feedback")
def feedback():
    """
    POST /api/feedback
    Body (JSON):
      {
        "service_id": int (optional),
        "session_id": str (optional),
        "rating": 1–5 (optional),
        "helpful": bool (optional),
        "comment": str (optional, max 1000 chars),
        "lang": "en|te",
        "page": str (optional)
      }
    """
    data = request.get_json(silent=True) or {}

    service_id = data.get("service_id")
    if service_id is not None:
        try:
            service_id = int(service_id)
        except (ValueError, TypeError):
            service_id = None

    rating = data.get("rating")
    if rating is not None:
        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                rating = None
        except (ValueError, TypeError):
            rating = None

    helpful = data.get("helpful")
    if helpful is not None:
        helpful = bool(helpful)

    comment = _sanitize_str(data.get("comment", ""), max_len=1000)
    lang = data.get("lang", "en")
    if lang not in ("en", "te"):
        lang = "en"
    session_id = _sanitize_str(data.get("session_id", ""), max_len=100)
    page = _sanitize_str(data.get("page", ""), max_len=255)

    ok = save_feedback(service_id, session_id, rating, helpful, comment, lang, page)
    if ok:
        return jsonify({"message": "Feedback received. Thank you!", "status": 201}), 201
    return _json_error("Could not save feedback. Please try again later.", 500)


# ── Error handlers ────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found.", "status": 404}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed.", "status": 405}), 405


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error. Please try again later.", "status": 500}), 500


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    print(f"\n[MeeSeva Mitra AI] Backend starting on http://localhost:{port}")
    print(f"   DB ping: {'connected' if ping_db() else 'not connected — check .env'}")
    app.run(host="0.0.0.0", port=port, debug=debug)
