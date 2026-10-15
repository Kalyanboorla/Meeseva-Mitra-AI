"""
MeeSeva Mitra AI — API Integration & Unit Tests
Tests backend endpoints: health, services, search, detail, assistant, feedback.
"""

import sys
import os
import unittest
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app import app
from db import ping_db, get_db_type


class MeeSevaMitraApiTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        app.config["TESTING"] = True
        cls.client = app.test_client()

    def test_01_db_connection(self):
        """Test database connection is alive (MySQL or SQLite fallback)."""
        self.assertTrue(ping_db(), "Database ping should be True")
        engine = get_db_type()
        self.assertIn(engine, ["mysql", "sqlite"], "Database engine should be mysql or sqlite")

    def test_02_health_endpoint(self):
        """GET /api/health returns 200 and connected status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("db"), "connected")
        self.assertIn("engine", data)

    def test_03_get_services(self):
        """GET /api/services returns list of services."""
        response = self.client.get("/api/services")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("services", data)
        self.assertGreater(data.get("count", 0), 0)
        self.assertEqual(data.get("lang"), "en")

        first_service = data["services"][0]
        self.assertIn("name_en", first_service)
        self.assertIn("slug", first_service)
        self.assertIn("category", first_service)

    def test_04_get_services_telugu(self):
        """GET /api/services?lang=te returns services with Telugu language tag."""
        response = self.client.get("/api/services?lang=te")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("lang"), "te")
        self.assertGreater(data.get("count", 0), 0)

    def test_05_search_services(self):
        """GET /api/services/search?q=income returns relevant service."""
        response = self.client.get("/api/services/search?q=income")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("results", data)
        self.assertGreater(data.get("count", 0), 0)
        names = [s["name_en"] for s in data["results"]]
        self.assertTrue(any("Income" in n for n in names))

    def test_06_search_validation(self):
        """GET /api/services/search with empty or 1-char query returns 400 error."""
        response = self.client.get("/api/services/search?q=a")
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("error", data)

    def test_07_service_detail(self):
        """GET /api/services/<slug> returns full service details with requirements and sources."""
        response = self.client.get("/api/services/income-certificate")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("slug"), "income-certificate")
        self.assertIn("requirements", data)
        self.assertIn("sources", data)
        self.assertGreater(len(data["requirements"]), 0)

        # Check mandatory requirement
        has_mandatory = any(r.get("is_mandatory") == 1 for r in data["requirements"])
        self.assertTrue(has_mandatory, "Should have mandatory requirements")

    def test_08_service_detail_not_found(self):
        """GET /api/services/<nonexistent-slug> returns 404."""
        response = self.client.get("/api/services/this-service-does-not-exist")
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn("error", data)

    def test_09_assistant_endpoint(self):
        """POST /api/assistant generates answers grounded in service data."""
        payload = {
            "message": "How do I get an income certificate?",
            "lang": "en",
        }
        response = self.client.post(
            "/api/assistant",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("answer", data)
        self.assertIn("disclaimer", data)
        self.assertIn("source_services", data)
        self.assertIn("session_id", data)

    def test_10_assistant_telugu(self):
        """POST /api/assistant with lang=te generates Telugu response."""
        payload = {
            "message": "ఆదాయ ధృవీకరణ పత్రం ఎలా పొందాలి?",
            "lang": "te",
        }
        response = self.client.post(
            "/api/assistant",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("answer", data)
        self.assertIn("disclaimer", data)

    def test_11_feedback_submission(self):
        """POST /api/feedback saves user rating and comment."""
        payload = {
            "service_id": 1,
            "session_id": "test-session-123",
            "rating": 5,
            "helpful": True,
            "comment": "Very helpful information!",
            "lang": "en",
            "page": "/services/income-certificate"
        }
        response = self.client.post(
            "/api/feedback",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("message", data)

    def test_12_rejection_guidance_aadhaar(self):
        """POST /api/guidance/rejection returns actionable steps for Aadhaar demographic mismatch."""
        payload = {
            "error_text": "Application rejected due to Aadhaar name mismatch with school records",
            "service_slug": "income-certificate",
            "lang": "en"
        }
        response = self.client.post(
            "/api/guidance/rejection",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data.get("rule_id"), "aadhaar_demographic_mismatch")
        self.assertIn("steps", data)
        self.assertGreater(len(data["steps"]), 0)
        self.assertIn("escalation_channel", data)
        self.assertIn("disclaimer", data)

    def test_13_rejection_guidance_privacy_redaction(self):
        """POST /api/guidance/rejection automatically redacts 12-digit Aadhaar and OTPs."""
        payload = {
            "error_text": "Citizen Aadhaar 9876 5432 1098 rejected with OTP 654321 because name mismatch",
            "lang": "en"
        }
        response = self.client.post(
            "/api/guidance/rejection",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("had_privacy_redaction"))
        self.assertNotIn("9876 5432 1098", data.get("input_sanitized", ""))
        self.assertIn("[REDACTED_AADHAAR]", data.get("input_sanitized", ""))
        self.assertNotIn("654321", data.get("input_sanitized", ""))

    def test_14_rejection_guidance_telugu(self):
        """POST /api/guidance/rejection returns Telugu guidance when lang=te."""
        payload = {
            "error_text": "ఆధార్ పేరు సరిపోలడం లేదు",
            "lang": "te"
        }
        response = self.client.post(
            "/api/guidance/rejection",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("lang"), "te")
        self.assertIn("ఆధార్", data.get("title", ""))

    def test_15_rejection_guidance_validation(self):
        """POST /api/guidance/rejection with short query returns 400 error."""
        response = self.client.post(
            "/api/guidance/rejection",
            data=json.dumps({"error_text": "a"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    def test_16_assistant_privacy_redaction(self):
        """POST /api/assistant redacts sensitive Aadhaar numbers before processing."""
        payload = {
            "message": "My Aadhaar is 1234 5678 9012, how to get income certificate?",
            "lang": "en"
        }
        response = self.client.post(
            "/api/assistant",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data.get("had_privacy_redaction"))


if __name__ == "__main__":
    unittest.main()

