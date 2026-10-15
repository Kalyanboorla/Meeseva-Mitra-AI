"""
MeeSeva Mitra AI — Service Layer
Handles all business logic for service catalogue queries.
"""

from __future__ import annotations
import re
from db import get_connection, get_db_type


# ── Simple keyword index for in-process fallback search ──────────────────────
# Used when MySQL FULLTEXT is unavailable or to augment it.

KEYWORD_MAP = {
    # Income Certificate / ఆదాయ ధృవీకరణ పత్రం
    "income": ["income certificate", "ఆదాయ", "ఆదాయం"],
    "salary": ["income certificate"],
    "earning": ["income certificate"],
    "aadayam": ["income certificate", "ఆదాయ"],
    "aadhayam": ["income certificate", "ఆదాయ"],
    "aadaayam": ["income certificate", "ఆదాయ"],
    "adhayam": ["income certificate", "ఆదాయ"],
    "aadhayamu": ["income certificate", "ఆదాయ"],
    "scholarship": ["income certificate"],

    # Caste / Community Certificate / కుల ధృవీకరణ పత్రం
    "caste": ["caste certificate", "కుల", "కులం"],
    "community": ["caste certificate"],
    "kulam": ["caste certificate", "కులం"],
    "kula": ["caste certificate", "కుల"],
    "kulam certificate": ["caste certificate", "కులం"],
    "sc": ["caste certificate"],
    "st": ["caste certificate"],
    "bc": ["caste certificate"],
    "obc": ["caste certificate"],
    "scheduled": ["caste certificate"],
    "samudhayam": ["caste certificate"],

    # Birth Certificate / జనన ధృవీకరణ పత్రం
    "birth": ["birth certificate", "జన్మ", "పుట్టిన", "జనన"],
    "born": ["birth certificate"],
    "dob": ["birth certificate"],
    "puttina": ["birth certificate", "పుట్టిన"],
    "puttuka": ["birth certificate", "పుట్టుక"],
    "janana": ["birth certificate", "జనన"],
    "jananam": ["birth certificate", "జనన"],
    "pillalu": ["birth certificate"],
    "bidda": ["birth certificate"],
    "delivery": ["birth certificate"],

    # Residence / Local / Nativity / నివాస ధృవీకరణ పత్రం
    "residence": ["residence certificate", "నివాస"],
    "domicile": ["residence certificate"],
    "nativity": ["residence certificate"],
    "address": ["residence certificate"],
    "local": ["residence certificate"],
    "nivasa": ["residence certificate", "నివాస"],
    "nivasam": ["residence certificate", "నివాస"],
    "sthanika": ["residence certificate", "స్థానిక"],
    "sthanikatha": ["residence certificate", "స్థానికత"],
    "illu": ["residence certificate"],

    # Ration Card / Food Security Card / రేషన్ కార్డు (ఆహార భద్రత కార్డు)
    "ration": ["ration card", "రేషన్"],
    "resan": ["ration card", "రేషన్"],
    "reshan": ["ration card", "రేషన్"],
    "food": ["ration card"],
    "pds": ["ration card"],
    "bpl": ["ration card"],
    "fsc": ["ration card"],
    "subsidy": ["ration card"],
    "biyyam": ["ration card", "బియ్యం"],
    "chitti": ["ration card", "రేషన్ కార్డు"],
    "ahara": ["ration card", "ఆహార"],
    "cardu": ["ration card", "కార్డు"],
}


SERVICE_KEYWORD_MAP = {
    # Income Certificate
    "income": "income-certificate",
    "salary": "income-certificate",
    "earning": "income-certificate",
    "aadayam": "income-certificate",
    "aadhayam": "income-certificate",
    "aadaayam": "income-certificate",
    "adhayam": "income-certificate",
    "aadhayamu": "income-certificate",
    "scholarship": "income-certificate",
    "ఆదాయ": "income-certificate",
    "ఆదాయం": "income-certificate",
    "ఇన్కమ్": "income-certificate",
    "ఇన్‌కమ్": "income-certificate",

    # Caste / Community Certificate
    "caste": "caste-certificate",
    "community": "caste-certificate",
    "kulam": "caste-certificate",
    "kula": "caste-certificate",
    "sc": "caste-certificate",
    "st": "caste-certificate",
    "bc": "caste-certificate",
    "obc": "caste-certificate",
    "scheduled": "caste-certificate",
    "samudhayam": "caste-certificate",
    "కుల": "caste-certificate",
    "కులం": "caste-certificate",

    # Birth Certificate
    "birth": "birth-certificate",
    "born": "birth-certificate",
    "dob": "birth-certificate",
    "puttina": "birth-certificate",
    "puttuka": "birth-certificate",
    "janana": "birth-certificate",
    "jananam": "birth-certificate",
    "pillalu": "birth-certificate",
    "bidda": "birth-certificate",
    "delivery": "birth-certificate",
    "జన్మ": "birth-certificate",
    "జనన": "birth-certificate",
    "పుట్టిన": "birth-certificate",

    # Residence / Local / Nativity
    "residence": "residence-certificate",
    "domicile": "residence-certificate",
    "nativity": "residence-certificate",
    "sthanika": "residence-certificate",
    "sthanikatha": "residence-certificate",
    "nivasa": "residence-certificate",
    "nivasam": "residence-certificate",
    "illu": "residence-certificate",
    "నివాస": "residence-certificate",
    "స్థానిక": "residence-certificate",

    # Ration Card / Food Security Card
    "ration": "ration-card",
    "resan": "ration-card",
    "reshan": "ration-card",
    "biyyam": "ration-card",
    "fsc": "ration-card",
    "pds": "ration-card",
    "bpl": "ration-card",
    "chitti": "ration-card",
    "ahara": "ration-card",
    "రేషన్": "ration-card",
    "బియ్యం": "ration-card",
    "ఆహార": "ration-card",
}


def _sanitize(text: str) -> str:
    """Strip potentially harmful characters from a search query."""
    return re.sub(r"[^\w\s\u0C00-\u0C7F]", " ", text).strip()[:300]


def search_services(query: str, lang: str = "en") -> list[dict]:
    """
    Hybrid search: Service Keyword Scoring + MySQL FULLTEXT / keyword ranking.
    Returns a list of matching service dicts ordered by relevance score.
    """
    if not query:
        return []

    clean_q = _sanitize(query)
    q_lower = clean_q.lower()
    results: list[dict] = []

    try:
        conn = get_connection()
        db_type = get_db_type()
        with conn.cursor() as cur:
            all_sql = """
                SELECT s.id, s.service_code, s.name_en, s.name_te, s.slug,
                       s.description_en, s.description_te, s.category,
                       s.fee_en, s.processing_time_en, s.official_url,
                       s.alternate_url, s.portal_label_en, s.portal_label_te,
                       s.is_verified, s.verification_note,
                       s.keywords_en, s.keywords_te,
                       d.name_en AS dept_name_en, d.name_te AS dept_name_te
                FROM services s
                JOIN departments d ON d.id = s.department_id
                WHERE s.is_active = 1
            """
            cur.execute(all_sql)
            all_candidates = [dict(r) for r in cur.fetchall()]

            scored = []
            for svc in all_candidates:
                score = 0.0
                slug = svc["slug"]
                name_en_l = (svc.get("name_en") or "").lower()
                name_te = svc.get("name_te") or ""
                kw_en_l = (svc.get("keywords_en") or "").lower()
                kw_te = svc.get("keywords_te") or ""
                desc_en_l = (svc.get("description_en") or "").lower()

                # 1. Distinctive service keyword mapping match
                for kw, target_slug in SERVICE_KEYWORD_MAP.items():
                    is_telugu_kw = bool(re.search(r"[\u0C00-\u0C7F]", kw))
                    matched = False
                    if is_telugu_kw:
                        matched = (kw in clean_q)
                    else:
                        # Require word boundary for Latin keywords
                        matched = bool(re.search(r"\b" + re.escape(kw) + r"\b", q_lower))

                    if matched and target_slug == slug:
                        score += 50.0

                # 2. Exact name match
                if name_en_l in q_lower or slug in q_lower:
                    score += 30.0
                elif name_te and name_te in clean_q:
                    score += 40.0

                # 3. Explicit keywords match
                for token in [t.strip() for t in kw_en_l.split(",") if t.strip()]:
                    if len(token) >= 3 and re.search(r"\b" + re.escape(token) + r"\b", q_lower):
                        # Avoid generic words matching all services
                        if token not in {"certificate", "telangana", "meeseva", "service", "portal", "application", "status"}:
                            score += 15.0

                for token in [t.strip() for t in kw_te.split(",") if t.strip()]:
                    if len(token) >= 2 and token in clean_q:
                        score += 20.0

                if score > 0:
                    svc["score"] = score
                    scored.append(svc)

            scored.sort(key=lambda x: x["score"], reverse=True)
            results = scored[:5]

        conn.close()
    except Exception as exc:
        print(f"[search_services] DB error: {exc}")
        results = []

    return results


def get_all_services(lang: str = "en") -> list[dict]:
    """Return all active services ordered by display_order."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.id, s.service_code, s.name_en, s.name_te, s.slug,
                       s.description_en, s.description_te, s.category,
                       s.fee_en, s.processing_time_en, s.official_url,
                       s.alternate_url, s.portal_label_en, s.portal_label_te,
                       s.is_verified, d.name_en AS dept_name_en, d.name_te AS dept_name_te
                FROM services s
                JOIN departments d ON d.id = s.department_id
                WHERE s.is_active = 1
                ORDER BY s.display_order ASC
            """)
            rows = cur.fetchall()
        return [dict(r) for r in rows]
    except Exception as exc:
        print(f"[get_all_services] DB error: {exc}")
        return []
    finally:
        if conn:
            conn.close()


def get_service_by_slug(slug: str) -> dict | None:
    """Return full service details + requirements + sources for a given slug."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.*, d.name_en AS dept_name_en, d.name_te AS dept_name_te,
                       d.official_url AS dept_url
                FROM services s
                JOIN departments d ON d.id = s.department_id
                WHERE s.slug = %s AND s.is_active = 1
                LIMIT 1
            """, (slug,))
            service = cur.fetchone()
            if not service:
                return None

            service = dict(service)

            # Requirements
            cur.execute("""
                SELECT req_type, is_mandatory, condition_note_en, condition_note_te,
                       name_en, name_te, description_en, description_te, sort_order
                FROM requirements
                WHERE service_id = %s
                ORDER BY req_type, is_mandatory DESC, sort_order ASC
            """, (service["id"],))
            service["requirements"] = [dict(r) for r in cur.fetchall()]

            # Sources
            cur.execute("""
                SELECT title, url, domain, verified_at, is_official, notes
                FROM sources
                WHERE service_id = %s
                ORDER BY is_official DESC
            """, (service["id"],))
            service["sources"] = [dict(r) for r in cur.fetchall()]

            return service
    except Exception as exc:
        print(f"[get_service_by_slug] DB error: {exc}")
        return None
    finally:
        if conn:
            conn.close()


def get_service_by_id(service_id: int) -> dict | None:
    """Retrieve service by numeric ID."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.*, d.name_en AS dept_name_en, d.name_te AS dept_name_te
                FROM services s
                JOIN departments d ON d.id = s.department_id
                WHERE s.id = %s AND s.is_active = 1
                LIMIT 1
            """, (service_id,))
            row = cur.fetchone()
        return dict(row) if row else None
    except Exception as exc:
        print(f"[get_service_by_id] DB error: {exc}")
        return None
    finally:
        if conn:
            conn.close()


def save_feedback(
    service_id: int | None,
    session_id: str | None,
    rating: int | None,
    helpful: bool | None,
    comment: str | None,
    lang: str = "en",
    page: str | None = None,
) -> bool:
    """Persist feedback. Returns True on success."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO feedback
                    (service_id, session_id, rating, helpful, comment_text, language_used, page_context)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (service_id, session_id, rating, helpful,
                  (comment or "")[:1000], lang, page))
        return True
    except Exception as exc:
        print(f"[save_feedback] DB error: {exc}")
        return False
    finally:
        if conn:
            conn.close()


# ── Sensitive Data Redaction ──────────────────────────────────────────────────

def redact_sensitive_data(text: str) -> tuple[str, bool]:
    """
    Redact sensitive citizen identifiers:
    - 12-digit Aadhaar numbers (with or without spaces/hyphens)
    - 6-digit OTP codes
    - 10-digit mobile numbers
    Returns (cleaned_text, had_redaction).
    """
    if not text:
        return "", False

    redacted = False
    cleaned = text

    # 1. 12-digit Aadhaar
    aadhaar_pattern = r"\b\d{4}[ -]?\d{4}[ -]?\d{4}\b"
    if re.search(aadhaar_pattern, cleaned):
        cleaned = re.sub(aadhaar_pattern, "[REDACTED_AADHAAR]", cleaned)
        redacted = True

    # 2. 6-digit OTP
    otp_pattern = r"\b(?<!\d)\d{6}(?!\d)\b"
    if re.search(otp_pattern, cleaned):
        cleaned = re.sub(otp_pattern, "[REDACTED_CODE]", cleaned)
        redacted = True

    # 3. 10-digit Phone numbers
    phone_pattern = r"\b(?:\+91|91)?[6-9]\d{9}\b"
    if re.search(phone_pattern, cleaned):
        cleaned = re.sub(phone_pattern, "[REDACTED_PHONE]", cleaned)
        redacted = True

    return cleaned, redacted


# ── Application Error & Rejection Guidance Knowledge Base ─────────────────────

REJECTION_RULES = [
    {
        "id": "aadhaar_demographic_mismatch",
        "keywords": ["aadhaar mismatch", "name mismatch", "dob mismatch", "demographic", "aadhaar details not matching", "spell mistake", "aadhaar name", "aadhar", "aadhaar", "ఆధార్", "పేరు"],
        "service_slug": None,  # Applies to all
        "title_en": "Demographic / Name Mismatch with Aadhaar",
        "title_te": "ఆధార్ వివరాలతో పేరు లేదా పుట్టిన తేదీ తేడా",
        "explanation_en": "Government verification portals compare your application details directly against the UIDAI database. Even minor discrepancies in surname, initials, or date of birth trigger an automated rejection.",
        "explanation_te": "ప్రభుత్వ పోర్టల్ మీ దరఖాస్తు వివరాలను ఆధార్ డేటాబేస్‌తో సరిపోలుస్తుంది. ఇంటిపేరు, ఇనిషియల్స్ లేదా పుట్టిన తేదీలో స్వల్ప తేడాలు ఉన్నా ఆటోమేటిక్‌గా తిరస్కరణ జరుగుతుంది.",
        "steps_en": [
            "Visit the official UIDAI portal (myaadhaar.uidai.gov.in) or nearest Aadhaar Seva Kendra to update your name/DOB with valid ID proof.",
            "If the name changed due to marriage, obtain a Gazetted Notification or registered marriage certificate.",
            "Once updated in Aadhaar, re-apply at your nearest MeeSeva centre using the updated Aadhaar details."
        ],
        "steps_te": [
            "చెల్లుబాటు అయ్యే గుర్తింపు రుజువుతో ఆధార్ సేవా కేంద్రాన్ని సందర్శించి పేరు/పుట్టిన తేదీని అప్‌డేట్ చేయండి.",
            "వివాహం వల్ల పేరు మారితే, గెజిట్ ప్రకటన లేదా వివాహ ధ్రువీకరణ పత్రం సమర్పించండి.",
            "ఆధార్ అప్‌డేట్ అయిన తర్వాత, నవీకరించిన వివరాలతో మీసేవ ద్వారా మళ్లీ దరఖాస్తు చేసుకోండి."
        ],
        "escalation_channel": "Nearest Aadhaar Seva Kendra (ASK) / MeeSeva Centre",
        "official_url": "https://myaadhaar.uidai.gov.in/"
    },
    {
        "id": "income_limit_or_missing_proof",
        "keywords": ["income exceed", "income limit", "salary slip missing", "itr missing", "affidavit", "income rejection", "vro report", "ఆదాయం", "జీతం"],
        "service_slug": "income-certificate",
        "title_en": "Income Certificate Rejection — Verification / Documentation Issue",
        "title_te": "ఆదాయ ధృవీకరణ తిరస్కరణ — పత్రాల లోపం లేదా ఆదాయ పరిమితి",
        "explanation_en": "Tahsildar / Mandal Revenue Office rejected the application because the income reported exceeded scheme limits, or mandatory income proof (Payslip, Form 16, or Notarized Affidavit) was incomplete.",
        "explanation_te": "నివేదించిన ఆదాయం స్కీమ్ పరిమితి కంటే ఎక్కువగా ఉన్నందున లేదా తప్పనిసరి ఆదాయ రుజువు (జీతం స్లిప్, ఫారం 16, లేదా అఫిడవిట్) సరిగా లేనందున తహసీల్దార్ కార్యాలయం తిరస్కరించింది.",
        "steps_en": [
            "For private/salaried employees: Attach official Form 16 and last 3 months pay slips signed by employer.",
            "For self-employed/daily wage earners: Obtain a notarized Income Self-Declaration Affidavit on ₹100 stamp paper.",
            "Request Mandal Revenue Inspector (RI) field enquiry if the family income was incorrectly calculated by the field officer.",
            "If wrongfully rejected, present your grievance directly at Prajavani (Monday grievance redressal) at the District Collectorate / Tahsildar office."
        ],
        "steps_te": [
            "జీతం పొందే ఉద్యోగులు: యజమాని సంతకం చేసిన ఫారం 16 మరియు గత 3 నెలల పే-స్లిప్‌లు జతపరచండి.",
            "స్వయం ఉపాధి పొందే వ్యక్తులు: ₹100 స్టాంప్ పేపర్‌పై నోటరీ చేయించిన ఆదాయ అఫిడవిట్ పొందండి.",
            "ఆదాయం తప్పుగా లెక్కించబడితే, పునః పరిశీలన కోసం తహసీల్దార్ లేదా ప్రజావాణిలో దరఖాస్తు చేయండి."
        ],
        "escalation_channel": "Tahsildar / MRO Office & Prajavani Grievance Portal",
        "official_url": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm"
    },
    {
        "id": "caste_lineage_proof_missing",
        "keywords": ["caste proof", "father caste", "blood relation", "caste enquiry", "lineage", "kulam proof", "social status"],
        "service_slug": "caste-certificate",
        "title_en": "Caste Certificate Rejection — Inadequate Lineage Proof",
        "title_te": "కుల ధృవీకరణ తిరస్కరణ — పూర్వీకుల/కుటుంబ ఆధారాల లోపం",
        "explanation_en": "Under Telangana Community Certificate rules, caste is established primarily through paternal blood relation. Applications without father's, sibling's, or paternal uncle's school records / caste certificate face rejection.",
        "explanation_te": "తెలంగాణ కమ్యూనిటీ సర్టిఫికెట్ నిబంధనల ప్రకారం, కులం ప్రధానంగా పితృస్వామ్య రక్త సంబంధం ద్వారా మాత్రమే ధృవీకరించబడుతుంది. తండ్రి లేదా తోబుట్టువుల రికార్డులు లేకపోతే తిరస్కరణ జరుగుతుంది.",
        "steps_en": [
            "Obtain certified copies of your father's, brother's, or sister's official caste certificate issued by Tahsildar.",
            "Submit your 1st to 10th class study certificates clearly displaying the caste recorded at school admission.",
            "If no existing family records exist, request a formal local enquiry by the Revenue Inspector (RI) and Village Revenue Assistant (VRA).",
            "Appeal to the Revenue Divisional Officer (RDO) within 30 days of rejection notice."
        ],
        "steps_te": [
            "తండ్రి, అన్నయ్య లేదా సోదరి యొక్క అధికారిక కుల ధృవీకరణ పత్రాన్ని జత చేయండి.",
            "పాఠశాల ప్రవేశ సమయంలో నమోదు చేసిన కులాన్ని చూపే 1వ నుండి 10వ తరగతి అధ్యయన పత్రాలను సమర్పించండి.",
            "కుటుంబ ఆధారాలు లేకపోతే, రెవెన్యూ ఇన్‌స్పెక్టర్ (RI) స్థానిక విచారణను కోరండి."
        ],
        "escalation_channel": "Revenue Divisional Officer (RDO) / Tahsildar Office",
        "official_url": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm"
    },
    {
        "id": "birth_late_registration_unregistered",
        "keywords": ["birth record not found", "late birth", "not registered", "delayed registration", "hospital record", "magistrate order", "birth rejection"],
        "service_slug": "birth-certificate",
        "title_en": "Birth Record Not Found / Late Registration",
        "title_te": "జనన రికార్డు కనుగొనబడలేదు / ఆలస్య నమోదు",
        "explanation_en": "Under the Registration of Births and Deaths Act 1969, births not reported within 1 year cannot be registered directly by MeeSeva. They require a Non-Availability Certificate (NAC) and Sub-Divisional Magistrate / RDO Order.",
        "explanation_te": "రిజిస్ట్రేషన్ ఆఫ్ బర్త్స్ & డెత్స్ చట్టం 1969 ప్రకారం, 1 సంవత్సరం దాటిన జననాలను మీసేవ నేరుగా నమోదు చేయలేదు. వీటికి నాన్-అవైలబిలిటీ సర్టిఫికెట్ (NAC) మరియు RDO/మేజిస్ట్రేట్ ఉత్తర్వు అవసరం.",
        "steps_en": [
            "Search CDMA portal (cdma.telangana.gov.in) with exact Date of Birth and parent names to confirm record does not exist.",
            "Obtain a Non-Availability Certificate (NAC) from the relevant Municipality / GHMC ward office.",
            "Apply before the Revenue Divisional Officer (RDO) / Executive Magistrate for a Late Birth Registration order with hospital discharge slip, school memo, and parents' affidavit.",
            "Once the magistrate order is issued, submit it at MeeSeva to generate the official birth certificate."
        ],
        "steps_te": [
            "రికార్డు నిజంగా లేదని నిర్ధారించుకోవడానికి CDMA పోర్టల్‌లో శోధించండి.",
            "మున్సిపాలిటీ / GHMC నుండి నాన్-అవైలబిలిటీ సర్టిఫికెట్ (NAC) పొందండి.",
            "ఆసుపత్రి రికార్డు మరియు అఫిడవిట్‌తో RDO / మేజిస్ట్రేట్ నుండి ఆలస్య నమోదు ఉత్తర్వు పొందండి.",
            "మేజిస్ట్రేట్ ఆర్డర్ వచ్చిన తర్వాత, మీసేవలో సమర్పించి సర్టిఫికెట్ తీసుకోండి."
        ],
        "escalation_channel": "CDMA Helpdesk / Revenue Divisional Officer (RDO) Court",
        "official_url": "https://cdma.telangana.gov.in/en/birth-and-death-registrations"
    },
    {
        "id": "ration_card_member_exists_duplicate",
        "keywords": ["already exists", "member already added", "duplicate aadhaar", "ration card rejection", "fsc rejection", "member mapped"],
        "service_slug": "ration-card",
        "title_en": "Ration Card Rejection — Member Already Active on Another Card",
        "title_te": "రేషన్ కార్డు తిరస్కరణ — సభ్యుడు ఇప్పటికే వేరే కార్డులో ఉన్నారు",
        "explanation_en": "The EPDS portal system detected that one or more family member Aadhaar numbers are already tagged to an active Food Security Card (often parent's card for married couples or students).",
        "explanation_te": "కుటుంబంలోని ఒక సభ్యుని ఆధార్ ఇప్పటికే వేరే క్రియాశీల రేషన్ కార్డులో (ఉదాహరణకు తల్లిదండ్రుల కార్డులో) నమోదై ఉన్నట్లు EPDS వ్యవస్థ గుర్తించింది.",
        "steps_en": [
            "Check current card mapping on epds.telangana.gov.in using the member's Aadhaar.",
            "Apply for 'Member Deletion / Name Removal' from the existing parent Food Security Card at any MeeSeva centre.",
            "Collect the Member Deletion Acknowledgement Slip.",
            "Submit a fresh application or modification request to add the member to the new card."
        ],
        "steps_te": [
            "epds.telangana.gov.in లో ఆధార్ ఉపయోగించి ప్రస్తుత కార్డును పరిశీలించండి.",
            "మీసేవ కేంద్రంలో పాత కార్డు నుండి 'సభ్యుని తొలగింపు (Member Deletion)' కోసం దరఖాస్తు చేయండి.",
            "తొలగింపు రసీదు వచ్చిన తర్వాత, కొత్త కార్డులో సభ్యుని చేర్చడానికి దరఖాస్తు చేయండి."
        ],
        "escalation_channel": "Civil Supplies District Office & EPDS Helpline: 1967",
        "official_url": "https://epds.telangana.gov.in/"
    },
    {
        "id": "document_blurred_or_illegible",
        "keywords": ["illegible", "blurred", "document scan", "file corrupt", "unreadable", "poor quality", "re-upload"],
        "service_slug": None,
        "title_en": "Application Rejected — Document Scan Illegible or Blurred",
        "title_te": "దరఖాస్తు తిరస్కరణ — పత్రం స్పష్టంగా లేదు లేదా స్కాన్ సరిగా లేదు",
        "explanation_en": "The scrutiny officer rejected the submission because the uploaded PDF or JPEG scan was low resolution, cropped, or text was unreadable.",
        "explanation_te": "అప్‌లోడ్ చేసిన స్కాన్ కాపీ అస్పష్టంగా ఉండడం లేదా అక్షరాలు చదవడానికి వీలులేనంత తక్కువ రిజల్యూషన్‌లో ఉన్నందున దరఖాస్తు తిరస్కరించబడింది.",
        "steps_en": [
            "Re-scan the original physical document at 150–200 DPI in PDF format under 500 KB.",
            "Ensure all four corners, seals, signatures, and dates are completely visible.",
            "Do not upload photocopies of photocopies. Use original documents for scanning.",
            "Submit correction / resubmission request through the official MeeSeva portal or kiosk."
        ],
        "steps_te": [
            "అసలు పత్రాన్ని 150-200 DPI లో 500 KB లోపు స్పష్టంగా మళ్లీ స్కాన్ చేయండి.",
            "సీల్స్, సంతకాలు మరియు తేదీలు పూర్తిగా స్పష్టంగా కనిపించేలా చూడండి.",
            "మీసేవ ద్వారా రీ-సబ్మిషన్ లేదా కరెక్షన్ దరఖాస్తు చేయండి."
        ],
        "escalation_channel": "MeeSeva Helpline: 1100 / Nearest MeeSeva Kiosk",
        "official_url": "https://ts.meeseva.telangana.gov.in/"
    }
]


def analyze_rejection_error(error_text: str, service_slug: str | None = None, lang: str = "en") -> dict:
    """
    Analyze a citizen's reported application error / rejection message:
    1. Redacts any sensitive data (Aadhaar / OTP / Phone).
    2. Identifies matching procedural failure pattern.
    3. Provides plain-language explanation, official remediation steps, and escalation links.
    4. Provides transparent disclaimer that this is procedural guidance, not official adjudication.
    """
    clean_text, had_redaction = redact_sensitive_data(error_text)
    clean_lower = clean_text.lower()

    matched_rule = None

    # Search for matching rejection rule
    for rule in REJECTION_RULES:
        if service_slug and rule["service_slug"] and rule["service_slug"] != service_slug:
            continue
        for kw in rule["keywords"]:
            if kw in clean_lower:
                matched_rule = rule
                break
        if matched_rule:
            break

    # If no rule matched, check by service slug alone
    if not matched_rule and service_slug:
        for rule in REJECTION_RULES:
            if rule["service_slug"] == service_slug:
                matched_rule = rule
                break

    is_telugu = lang in ("te", "telugish")

    if matched_rule:
        title = matched_rule["title_te"] if is_telugu else matched_rule["title_en"]
        explanation = matched_rule["explanation_te"] if is_telugu else matched_rule["explanation_en"]
        steps = matched_rule["steps_te"] if is_telugu else matched_rule["steps_en"]
        escalation = matched_rule["escalation_channel"]
        official_url = matched_rule["official_url"]
        rule_id = matched_rule["id"]
    else:
        title = "సాధారణ దరఖాస్తు తిరస్కరణ విశ్లేషణ" if is_telugu else "General Application Rejection Guidance"
        explanation = (
            "మీరు పేర్కొన్న తిరస్కరణ కారణం సాధారణ కారణాల పరిధిలోకి రాలేదు. అధికారిక తహసీల్దార్ లేదా శాఖాధికారి తిరస్కరణ లేఖలో పేర్కొన్న నిర్దిష్ట కారణాన్ని పరిశీలించండి."
            if is_telugu else
            "Your reported error reason could not be matched to an automatic rule. Most government rejections are due to missing supporting documents, unverified claims, or jurisdictional mismatch."
        )
        steps = [
            "మీ దరఖాస్తు రసీదులోని తిరస్కరణ కారణం (Rejection Remarks) ను స్పష్టంగా చదవండి." if is_telugu else "Check the exact rejection remarks provided by the scrutiny officer on the acknowledgement slip.",
            "మీసేవ కేంద్రంలో దరఖాస్తు స్థితిని తనిఖీ చేసి అధికారుల వివరణ కోరండి." if is_telugu else "Visit your nearest MeeSeva centre to request the detailed officer remarks log.",
            "ప్రజావాణి పోర్టల్ (prajavani.telangana.gov.in) లేదా హెల్ప్‌లైన్ 1100 లో ఫిర్యాదు చేయండి." if is_telugu else "File a grievance at Telangana Prajavani (prajavani.telangana.gov.in) or call MeeSeva Helpline 1100."
        ]
        escalation = "Telangana Prajavani (Public Grievance Portal) & MeeSeva 1100"
        official_url = "https://prajavani.telangana.gov.in/"
        rule_id = "general_fallback"

    disclaimer = (
        "గమనిక: ఇది పౌరుల చార్టర్ ఆధారంగా అందించిన సహాయక మార్గదర్శకత్వం మాత్రమే. ఇది అధికారిక ప్రభుత్వ ఉత్తర్వు లేదా ఆమోదం కాదు."
        if is_telugu else
        "DISCLAIMER: This is procedural guidance based on official citizen charters and does not constitute an official government adjudication or guarantee of approval."
    )

    return {
        "status": "success",
        "rule_id": rule_id,
        "title": title,
        "input_sanitized": clean_text,
        "had_privacy_redaction": had_redaction,
        "explanation": explanation,
        "steps": steps,
        "escalation_channel": escalation,
        "official_url": official_url,
        "disclaimer": disclaimer,
        "lang": lang
    }

