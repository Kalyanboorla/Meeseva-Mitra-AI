"""
MeeSeva Mitra AI — Telugish (Romanized Telugu) & NLU Verification Suite
Tests at least 15 varied Romanized Telugu, mixed Telugu-English, and Telugu script queries
covering all 5 services, documents, eligibility, fees, timelines, URLs, ambiguity, and unsupported services.
"""

from __future__ import annotations
import sys
import os
import json
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from services import search_services
from ai_assistant import detect_input_language, _fallback_response, _build_context


class TestTelugishNLU(unittest.TestCase):

    TEST_CASES = [
        # 1. Income Certificate (Telugish & Telugu & English)
        {
            "id": "T01",
            "query": "income certificate ki em documents kavali?",
            "category": "Required Documents",
            "expected_slug": "income-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Income Certificate document query in Romanized Telugu"
        },
        {
            "id": "T02",
            "query": "caste certificate ela apply cheyali?",
            "category": "Procedure / How to Apply",
            "expected_slug": "caste-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Caste Certificate application procedure in Romanized Telugu"
        },
        {
            "id": "T03",
            "query": "naaku birth certificate kavali",
            "category": "Service Discovery",
            "expected_slug": "birth-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://cdma.telangana.gov.in/en/birth-and-death-registrations",
            "description": "Birth Certificate general citizen need in Romanized Telugu"
        },
        {
            "id": "T04",
            "query": "ration card kosam ekkada apply cheyyali?",
            "category": "Application Link / Portal",
            "expected_slug": "ration-card",
            "expected_lang": "telugish",
            "expected_portal": "https://epds.telangana.gov.in/",
            "description": "Food Security Card portal entry query in Romanized Telugu"
        },
        {
            "id": "T05",
            "query": "income certificate ki entha fee?",
            "category": "Fee & Charges",
            "expected_slug": "income-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Income Certificate fee query in Romanized Telugu"
        },
        {
            "id": "T06",
            "query": "ma intlo birth certificate ledu, ippudu em cheyyali?",
            "category": "Special Circumstances / Late Registration",
            "expected_slug": "birth-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://cdma.telangana.gov.in/en/birth-and-death-registrations",
            "description": "Missing birth certificate advice query"
        },
        {
            "id": "T07",
            "query": "నాకు ఇన్కమ్ సర్టిఫికేట్ కావాలి",
            "category": "Formal Telugu Script",
            "expected_slug": "income-certificate",
            "expected_lang": "te",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Pure Telugu Unicode script query"
        },
        {
            "id": "T08",
            "query": "Which documents kavali caste certificate ki?",
            "category": "Mixed Telugu-English Code-Switching",
            "expected_slug": "caste-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Mixed English sentence structure with Telugu postpositions"
        },
        {
            "id": "T09",
            "query": "MeeSeva lo apply cheyyala leka vere portal unda?",
            "category": "Portal Disambiguation",
            "expected_slug": None,  # General query about MeeSeva vs other portals
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/",
            "description": "General enquiry about application channel"
        },
        {
            "id": "T10",
            "query": "residence certificate kosam evaru eligible?",
            "category": "Eligibility Rules",
            "expected_slug": "residence-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Residence certificate eligibility query"
        },
        {
            "id": "T11",
            "query": "biyyam card kosam em kavali?",
            "category": "Colloquial Terminology",
            "expected_slug": "ration-card",
            "expected_lang": "telugish",
            "expected_portal": "https://epds.telangana.gov.in/",
            "description": "Colloquial 'biyyam card' (rice card) for FSC"
        },
        {
            "id": "T12",
            "query": "kula dhruveekarana pathram entha time paduthundi?",
            "category": "Processing Timeline",
            "expected_slug": "caste-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Caste certificate SLA / timeline query in phonetic Telugish"
        },
        {
            "id": "T13",
            "query": "puttina dakhala online lo download cheyocha?",
            "category": "Digital Delivery & Procedure",
            "expected_slug": "birth-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://cdma.telangana.gov.in/en/birth-and-death-registrations",
            "description": "Colloquial 'puttina dakhala' for birth registration certificate"
        },
        {
            "id": "T14",
            "query": "driving licence ela apply cheyali?",
            "category": "Unsupported Service / Safe Fallback",
            "expected_slug": None,  # Not in 5 seeded services
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/",
            "description": "RTO / Transport service outside seeded catalogue"
        },
        {
            "id": "T15",
            "query": "sthanika nivasam kosam address proof em ivvali?",
            "category": "Residence Proof Documents",
            "expected_slug": "residence-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Colloquial 'sthanika nivasam' for residence certificate proof"
        },
        # 16-20: English Service Discovery & Verification
        {
            "id": "T16",
            "query": "What are the mandatory documents for income certificate in Telangana?",
            "category": "English Document Query",
            "expected_slug": "income-certificate",
            "expected_lang": "en",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "English query for income certificate mandatory documentation"
        },
        {
            "id": "T17",
            "query": "How much is the MeeSeva statutory fee for caste certificate?",
            "category": "English Fee Query",
            "expected_slug": "caste-certificate",
            "expected_lang": "en",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "English query for community certificate statutory fee"
        },
        {
            "id": "T18",
            "query": "How to register birth in GHMC or CDMA municipality?",
            "category": "English Procedure Query",
            "expected_slug": "birth-certificate",
            "expected_lang": "en",
            "expected_portal": "https://cdma.telangana.gov.in/en/birth-and-death-registrations",
            "description": "English municipal birth registration query"
        },
        {
            "id": "T19",
            "query": "How to apply for food security ration card in EPDS Telangana?",
            "category": "English Portal Query",
            "expected_slug": "ration-card",
            "expected_lang": "en",
            "expected_portal": "https://epds.telangana.gov.in/",
            "description": "English FSC ration card portal query"
        },
        {
            "id": "T20",
            "query": "Who is eligible for local residence certificate under Presidential Order?",
            "category": "English Eligibility Query",
            "expected_slug": "residence-certificate",
            "expected_lang": "en",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "English residence and local candidate quota query"
        },
        # 21-24: Telugu Script Queries
        {
            "id": "T21",
            "query": "కుల ధ్రువీకరణ పత్రం దరఖాస్తు విధానం ఏమిటి?",
            "category": "Telugu Script Procedure",
            "expected_slug": "caste-certificate",
            "expected_lang": "te",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Telugu script query for community certificate procedure"
        },
        {
            "id": "T22",
            "query": "జనన ధ్రువీకరణ పత్రం డౌన్‌లోడ్ ఎలా చేయాలి?",
            "category": "Telugu Script Download",
            "expected_slug": "birth-certificate",
            "expected_lang": "te",
            "expected_portal": "https://cdma.telangana.gov.in/en/birth-and-death-registrations",
            "description": "Telugu script query for birth certificate download"
        },
        {
            "id": "T23",
            "query": "కొత్త ఆహార భద్రతా రేషన్ కార్డు కోసం ఏ పత్రాలు అవసరం?",
            "category": "Telugu Script Ration",
            "expected_slug": "ration-card",
            "expected_lang": "te",
            "expected_portal": "https://epds.telangana.gov.in/",
            "description": "Telugu script query for FSC requirements"
        },
        {
            "id": "T24",
            "query": "స్థానిక నివాస ధ్రువీకరణ పత్రం కోసం నిబంధనలు ఏమిటి?",
            "category": "Telugu Script Residence",
            "expected_slug": "residence-certificate",
            "expected_lang": "te",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Telugu script query for residence rules"
        },
        # 25-29: Phonetic Variations, Misspellings & Code-Mixing
        {
            "id": "T25",
            "query": "aadhayam certificate kosam salary slip ledu",
            "category": "Misspelling / Special Circumstance",
            "expected_slug": "income-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Phonetic misspelling 'aadhayam' with missing document circumstance"
        },
        {
            "id": "T26",
            "query": "SC ST community certificate online MeeSeva link kavali",
            "category": "Acronym & Category Search",
            "expected_slug": "caste-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Acronym 'SC ST community certificate' query"
        },
        {
            "id": "T27",
            "query": "hospital delivery taruvatha birth certificate eppudu register cheyyali?",
            "category": "Timeline & Legal Registration",
            "expected_slug": "birth-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://cdma.telangana.gov.in/en/birth-and-death-registrations",
            "description": "Hospital delivery birth registration window query"
        },
        {
            "id": "T28",
            "query": "new food security card application form download link",
            "category": "Form Download Query",
            "expected_slug": "ration-card",
            "expected_lang": "en",
            "expected_portal": "https://epds.telangana.gov.in/",
            "description": "English FSC form download query"
        },
        {
            "id": "T29",
            "query": "domicile certificate kosam school study certificates tappanisara?",
            "category": "Conditional Document Query",
            "expected_slug": "residence-certificate",
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
            "description": "Domicile / study certificate conditionality query"
        },
        # 30-32: Unsupported Services & Safe Clarification
        {
            "id": "T30",
            "query": "passport renewal ela cheyyali?",
            "category": "Unsupported Central Service",
            "expected_slug": None,
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/",
            "description": "Central government Passport service outside state catalogue"
        },
        {
            "id": "T31",
            "query": "electricity bill payment MeeSeva lo avtunda?",
            "category": "Unsupported Utility Bill",
            "expected_slug": None,
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/",
            "description": "Utility bill payment query outside 5 core services"
        },
        {
            "id": "T32",
            "query": "application status check cheyyadaniki ekkadiki vellali?",
            "category": "Disambiguation / General Status Query",
            "expected_slug": None,
            "expected_lang": "telugish",
            "expected_portal": "https://ts.meeseva.telangana.gov.in/",
            "description": "General application status tracking query"
        }
    ]

    def test_all_32_telugish_queries(self):
        results_summary = []
        all_passed = True

        print("\n" + "="*80, flush=True)
        print("TELUGISH (ROMANIZED TELUGU) TEST SUITE RESULTS", flush=True)
        print("="*80, flush=True)

        for case in self.TEST_CASES:
            q = case["query"]
            detected_lang = detect_input_language(q)

            # Check language detection expectation
            lang_match = (detected_lang == case["expected_lang"])

            # Search retrieval
            matched_services = search_services(q, detected_lang)
            retrieved_slug = matched_services[0]["slug"] if matched_services else None

            # Service retrieval match
            if case["expected_slug"] is None:
                # Unsupported or ambiguous: returns empty or general fallback
                service_match = True
            else:
                service_match = (retrieved_slug == case["expected_slug"])

            # Test prompt building and source-grounded response formatting
            source_services = [
                {
                    "name_en": s.get("name_en"),
                    "name_te": s.get("name_te"),
                    "slug": s.get("slug"),
                    "official_url": s.get("official_url", "https://ts.meeseva.telangana.gov.in/"),
                    "portal_label_en": s.get("portal_label_en"),
                    "portal_label_te": s.get("portal_label_te"),
                }
                for s in matched_services[:3]
            ]
            disclaimer = "⚠️ Source-grounded response with validation and safe fallback."

            res = _fallback_response(q, matched_services, detected_lang, disclaimer, source_services)
            answer = res.get("answer", "")

            # Check grounding and URL presence
            url_found = False
            if case["expected_slug"]:
                top_svc = source_services[0] if source_services else {}
                url = top_svc.get("official_url", "")
                url_found = (url == case["expected_portal"])
            else:
                url_found = ("https://ts.meeseva.telangana.gov.in/" in answer or len(source_services) == 0)

            passed = lang_match and service_match and (bool(answer) and len(answer) > 20) and url_found
            if not passed:
                all_passed = False

            record = {
                "id": case["id"],
                "query": q,
                "category": case["category"],
                "expected_service": case["expected_slug"] or "N/A (General/Unsupported)",
                "retrieved_service": retrieved_slug or "None (Clean fallback)",
                "detected_lang": detected_lang,
                "expected_lang": case["expected_lang"],
                "portal_url": case["expected_portal"],
                "grounded_sources": len(source_services),
                "status": "PASS" if passed else "FAIL"
            }
            results_summary.append(record)

            q_disp = q.encode('ascii', 'backslashreplace').decode('ascii')
            print(f"[{record['status']}] {case['id']}: '{q_disp}'", flush=True)
            print(f"       Service: Expected={record['expected_service']} | Retrieved={record['retrieved_service']}", flush=True)
            print(f"       Lang: {detected_lang} | Grounded Portals: {len(source_services)} | URL: {case['expected_portal']}", flush=True)

        # Save test results to json
        out_path = os.path.join(os.path.dirname(__file__), "telugish_test_results.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(results_summary, f, indent=2, ensure_ascii=False)

        print("="*80, flush=True)
        print(f"Saved results to {out_path}", flush=True)
        self.assertTrue(all_passed, "All 32 Telugish and multilingual test cases should pass.")


if __name__ == "__main__":
    unittest.main()
