"""
MeeSeva Mitra AI — AI Assistant Module
Provides RAG-style responses grounded in the service catalogue.
Falls back gracefully when the AI API is unavailable.
"""

from __future__ import annotations
import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

_GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

_ai_ready = False
_model = None

if _GEMINI_KEY:
    try:
        genai.configure(api_key=_GEMINI_KEY, transport="rest")
        _model = genai.GenerativeModel(_GEMINI_MODEL)
        _ai_ready = True
    except Exception as e:
        print(f"[ai_assistant] Gemini init failed: {e}")


# ── Language Detection & Normalization ────────────────────────────────────────

TELUGISH_PATTERNS = {
    "kavali", "kaavali", "ela", "yela", "kosam", "ekkada", "entha", "enta", "ledu", "ledhu",
    "dakhala", "kulam", "kula", "aadayam", "aadhayam", "aadaayam", "puttina", "puttuka",
    "janana", "jananam", "sthanika", "nivasa", "nivasam", "biyyam", "chitti", "cheyali",
    "cheyyali", "cheyandi", "cheyyandi", "undi", "undha", "unda", "unnara", "vastundi",
    "ivvandi", "choodandi", "chudandi", "leka", "vere", "intlo", "naaku", "naku", "maaku",
    "maku", "meeku", "miku", "cheppandi", "eppudu", "patram", "pathram", "darakhasthu",
    "avsaram", "avasaram", "pillala", "pilladu", "pedda", "cardu", "kaardu", "resan", "reshan",
    "kaavali", "chuddam", "theliyali", "teliyali", "avtunda", "avuthunda", "avtundha",
    "cheyyadaniki", "cheyadaniki", "ekkadiki", "vellali", "ravali", "vasthundi", "lo",
    "gurinchi", "ippudu", "mundu", "tharuvaatha", "taruvatha", "tappanisara", "tappanisari"
}


def detect_input_language(text: str) -> str:
    """
    Detect whether text is Telugu (te), Telugish / Romanized Telugu (telugish), or English (en).
    """
    if not text:
        return "en"
    # Check for Telugu script characters (U+0C00 - U+0C7F)
    if re.search(r"[\u0C00-\u0C7F]", text):
        return "te"

    # Check for Romanized Telugu vocabulary words
    words = re.findall(r"[a-zA-Z]+", text.lower())
    matches = sum(1 for w in words if w in TELUGISH_PATTERNS)
    if matches >= 1:
        return "telugish"

    return "en"


# ── Prompt templates ──────────────────────────────────────────────────────────

_SYSTEM_PROMPT_EN = """You are MeeSeva Mitra, a helpful and honest AI assistant for Telangana government services.

RULES — follow these strictly:
1. Only use the service information provided in the context below. Do NOT invent facts, fees, or timelines.
2. If the answer is not in the context, say so clearly and direct the user to the official MeeSeva portal: https://ts.meeseva.telangana.gov.in/ or helpline 1800-599-4747.
3. Never claim to have submitted an application, booked an appointment, or contacted a government department on behalf of the citizen.
4. Always advise that requirements and rules should be verified at the official portal or nearest MeeSeva centre.
5. Use simple, clear language suitable for citizens with limited digital literacy.
6. When listing documents, explicitly separate [MANDATORY] documents from [IF APPLICABLE / CONDITIONAL] documents.
7. CRITICAL URL RULE: You MUST provide the specific official URL and meaningful portal label from the service context (e.g. "Open Official EPDS Telangana Ration Card Portal -> https://epds.telangana.gov.in/"). Do NOT substitute a generic MeeSeva homepage link if a specific URL is provided in the context.
8. Suggest 1 or 2 relevant follow-up questions.
9. Disclaimer: You are an AI assistant, not an official government representative.

SERVICE CATALOGUE CONTEXT:
{context}

USER QUESTION: {question}

Respond in English."""

_SYSTEM_PROMPT_TE = """మీరు మీసేవ మిత్ర, తెలంగాణ ప్రభుత్వ సేవల కోసం సహాయకారి మరియు నిజాయితీగల AI సహాయకుడు.

నియమాలు — ఇవి కచ్చితంగా పాటించండి:
1. దిగువ అందించిన సేవా సమాచారాన్ని మాత్రమే ఉపయోగించండి. సమాచారాన్ని, ఫీజులను లేదా గడువులను స్వయంగా ఊహించి రాయవద్దు.
2. సమాధానం సందర్భంలో లేకపోతే, స్పష్టంగా చెప్పండి మరియు వినియోగదారుని అధికారిక మీసేవ పోర్టల్‌కు (https://ts.meeseva.telangana.gov.in/) లేదా 1800-599-4747 హెల్ప్‌లైన్‌కు మళ్ళించండి.
3. మీరు దరఖాస్తు సమర్పించారని, స్లాట్ బుక్ చేశారని లేదా ప్రభుత్వ శాఖను సంప్రదించారని ఎప్పుడూ చెప్పకండి.
4. అధికారిక మూలంలో లేదా సమీప మీసేవ కేంద్రంలో సమాచారాన్ని ధృవీకరించమని ఎల్లప్పుడూ పేర్కొనండి.
5. పరిమిత డిజిటల్ అక్షరాస్యత ఉన్న పౌరులకు తగిన సరళమైన, స్పష్టమైన తెలుగు భాషను ఉపయోగించండి.
6. పత్రాలను జాబితా చేసేటప్పుడు, [తప్పనిసరి] పత్రాలు మరియు [వర్తిస్తే / షరతులతో] పత్రాలను స్పష్టంగా వేరు చేయండి.
7. అధికారిక లింక్ నియమం: సేవా సందర్భంలో ఇచ్చిన నిర్దిష్ట అధికారిక పోర్టల్ లింక్ మరియు పోర్టల్ లేబుల్‌ను కచ్చితంగా చేర్చండి. నిర్దిష్ట లింక్ ఉన్నప్పుడు సాధారణ హోమ్‌పేజీ లింక్ ఇవ్వకండి.

సేవా నమోదు సందర్భం:
{context}

వినియోగదారు ప్రశ్న: {question}

తెలుగులో సమాధానం ఇవ్వండి."""

_SYSTEM_PROMPT_TELUGISH = """You are MeeSeva Mitra, a helpful and honest AI assistant for Telangana government services.
The citizen has asked a question in Telugish (Romanized Telugu / Telugu written using English alphabets, mixed with English words).

RULES — follow these strictly:
1. Only use the service information provided in the context below. Do NOT invent facts, fees, or timelines.
2. Respond in natural, easy-to-read Telugish (Romanized Telugu) mixed with clear English terms for official department and service names (e.g., 'Income Certificate', 'MeeSeva', 'Aadhaar Card', 'Tahsildar').
   Example format:
   "Meeru Income Certificate kosam adugutunnaru. Ee certificate ki kindi documents mandatory (tappanisari):
   • Aadhaar Card
   • Salary Certificate / Income Affidavit
   
   Fee: ₹45
   Processing Time: 7 working days
   
   Official Service Portal: Open Official Income Certificate Service (MeeSeva Revenue) -> https://ts.meeseva.telangana.gov.in/meeseva/service.htm"
3. Clearly distinguish between [MANDATORY / Tappanisari] documents and [IF APPLICABLE / Vartisthe] documents.
4. CRITICAL URL RULE: You MUST provide the specific official URL and meaningful portal label from the service context (e.g. 'Open Official EPDS Telangana Ration Card Portal -> https://epds.telangana.gov.in/'). Do NOT substitute a generic MeeSeva homepage link if a specific URL is provided in the context.
5. If the service is not found in the context, respond politely in Telugish:
   "Kshaminchandi, ee service details maa catalogue lo levu. Meeru official MeeSeva portal (https://ts.meeseva.telangana.gov.in/) lo chudandi leda 1800-599-4747 helpline ki call cheyyandi."
6. Never claim to have submitted an application or registered a request on behalf of the citizen.
7. Always advise the citizen to verify details at their local MeeSeva centre or official government portal.

SERVICE CATALOGUE CONTEXT:
{context}

USER QUESTION: {question}

Respond in clear, friendly Telugish (Romanized Telugu)."""


def _build_context(services: list[dict], lang: str = "en") -> str:
    """Format service records into a plain-text context for the prompt."""
    if not services:
        return "No matching services found in the catalogue."

    parts = []
    for svc in services[:3]:  # limit context size
        name_en = svc.get("name_en", "")
        name_te = svc.get("name_te", "")
        slug = svc.get("slug", "")
        dept = svc.get("dept_name_en", "")
        desc = svc.get("description_en", "")
        elig = svc.get("eligibility_en", "")
        proc = svc.get("procedure_en", "")
        fee = svc.get("fee_en", "")
        ptime = svc.get("processing_time_en", "")
        url = svc.get("official_url", "https://ts.meeseva.telangana.gov.in/")
        alt_url = svc.get("alternate_url", "")
        portal_label = svc.get("portal_label_en" if lang != "te" else "portal_label_te") or "Open Official Service Portal"

        reqs = svc.get("requirements", [])
        if not reqs and slug:
            try:
                from services import get_service_by_slug
                full_s = get_service_by_slug(slug)
                if full_s and full_s.get("requirements"):
                    reqs = full_s["requirements"]
                    svc["requirements"] = reqs
            except Exception:
                pass

        if lang == "te":
            doc_list = "\n  ".join(
                f"- {'[తప్పనిసరి] ' if r.get('is_mandatory') else '[వర్తిస్తే] '}{r.get('name_te') or r.get('name_en')}"
                for r in reqs if r.get("req_type") == "document"
            )
        else:
            doc_list = "\n  ".join(
                f"- {'[MANDATORY] ' if r.get('is_mandatory') else '[IF APPLICABLE] '}{r.get('name_en')}"
                for r in reqs if r.get("req_type") == "document"
            )

        parts.append(
            f"SERVICE: {name_en} ({name_te})\n"
            f"Department: {dept}\n"
            f"Description: {desc}\n"
            f"Eligibility: {elig}\n"
            f"Documents Required:\n  {doc_list or 'See official portal'}\n"
            f"Procedure: {proc}\n"
            f"Fee: {fee or 'Verify at MeeSeva centre'}\n"
            f"Processing Time: {ptime or 'Verify at MeeSeva centre'}\n"
            f"Verified Official Portal: {portal_label} -> {url}\n"
            f"Alternate Portal: {alt_url or 'N/A'}\n"
        )

    return "\n---\n".join(parts)


def generate_response(
    question: str,
    services: list[dict],
    lang: str = "en",
    history: list[dict] | None = None,
) -> dict:
    """
    Generate an AI-assisted response grounded in service catalogue data.

    Returns:
        {
            "answer": str,
            "source_services": [{"name_en", "slug", "official_url", "portal_label_en", ...}],
            "ai_used": bool,
            "detected_lang": str,
            "disclaimer": str
        }
    """
    detected_lang = detect_input_language(question)
    effective_lang = lang
    if lang == "auto" or (lang == "en" and detected_lang in ("telugish", "te")):
        effective_lang = detected_lang

    context = _build_context(services, effective_lang)

    source_services = [
        {
            "name_en": s.get("name_en"),
            "name_te": s.get("name_te"),
            "slug": s.get("slug"),
            "official_url": s.get("official_url", "https://ts.meeseva.telangana.gov.in/"),
            "alternate_url": s.get("alternate_url"),
            "portal_label_en": s.get("portal_label_en"),
            "portal_label_te": s.get("portal_label_te"),
        }
        for s in services[:3]
    ]

    disclaimer_en = (
        "⚠️ This is an AI-generated guidance response grounded in official Telangana service data. "
        "Always verify requirements and submit applications at the official portal or your local MeeSeva centre."
    )
    disclaimer_te = (
        "⚠️ ఇది తెలంగాణ అధికారిక సేవా సమాచారం ఆధారంగా రూపొందించిన AI సహాయక సమాధానం. "
        "అవసరాలను ఎల్లప్పుడూ అధికారిక పోర్టల్ లేదా మీ సమీపంలోని మీసేవ కేంద్రంలో ధృవీకరించుకోండి."
    )
    disclaimer_telugish = (
        "⚠️ Idi official Telangana service data aadharanga AI generate chesina guidance mathrame. "
        "Requirements mariyu submission ni official portal leda mee daggarlo unna MeeSeva kendram lo verify chesukondi."
    )

    chosen_disclaimer = disclaimer_te if effective_lang == "te" else (disclaimer_telugish if effective_lang == "telugish" else disclaimer_en)

    if not _ai_ready or not _GEMINI_KEY:
        # ── Fallback: rule-based response from structured data ────────────────
        return _fallback_response(question, services, effective_lang, chosen_disclaimer, source_services)

    try:
        if effective_lang == "te":
            prompt_template = _SYSTEM_PROMPT_TE
            language_label = "Telugu (తెలుగు)"
        elif effective_lang == "telugish":
            prompt_template = _SYSTEM_PROMPT_TELUGISH
            language_label = "Telugish (Romanized Telugu)"
        else:
            prompt_template = _SYSTEM_PROMPT_EN
            language_label = "English"

        prompt = prompt_template.format(
            context=context,
            question=question,
            language=language_label,
        )

        response = _model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,
                "max_output_tokens": 1024,
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            ],
            request_options={"timeout": 10},
        )

        answer = response.text if response.text else ""
        if not answer:
            return _fallback_response(question, services, effective_lang, chosen_disclaimer, source_services)

        return {
            "answer": answer,
            "source_services": source_services,
            "ai_used": True,
            "detected_lang": effective_lang,
            "disclaimer": chosen_disclaimer,
        }

    except Exception as exc:
        print(f"[generate_response] Gemini error: {exc}")
        return _fallback_response(question, services, effective_lang, chosen_disclaimer, source_services)


def _fallback_response(
    question: str,
    services: list[dict],
    lang: str,
    disclaimer: str,
    source_services: list[dict],
) -> dict:
    """Rule-based fallback when AI is unavailable or rate-limited."""
    if not services:
        if lang == "te":
            answer = (
                "క్షమించండి, మీ ప్రశ్నకు సరిపోయే సేవ మా ప్రస్తుత కేటలాగ్‌లో కనుగొనబడలేదు.\n\n"
                "దయచేసి అధికారిక మీసేవ పోర్టల్‌ను సందర్శించండి: https://ts.meeseva.telangana.gov.in/\n\n"
                "మీరు ఇకపై ఏమి చేయవచ్చు:\n"
                "• మీ సమీపంలోని MeeSeva కేంద్రాన్ని సందర్శించండి\n"
                "• Telangana సర్కార్ హెల్ప్‌లైన్: 1800-599-4747 కు కాల్ చేయండి"
            )
        elif lang == "telugish":
            answer = (
                "Kshaminchandi, mee prashnaku saripoye service maa catalogue lo dhorakaledu.\n\n"
                "Dayachesi official MeeSeva portal ni chudandi: https://ts.meeseva.telangana.gov.in/\n\n"
                "Meeru ivi prayathninchavachu:\n"
                "• Mee daggarlo unna MeeSeva kendranni kalavandi\n"
                "• Telangana Government Helpline: 1800-599-4747 ki call cheyyandi"
            )
        else:
            answer = (
                "Sorry, we could not find a matching service for your request in our catalogue.\n\n"
                "Please visit the official MeeSeva portal: https://ts.meeseva.telangana.gov.in/\n\n"
                "You can also:\n"
                "• Visit your nearest MeeSeva centre for in-person assistance\n"
                "• Call Telangana Government Helpline: 1800-599-4747"
            )
    else:
        svc = services[0]
        name = svc.get("name_te" if lang == "te" else "name_en", "")
        desc = svc.get("description_te" if lang == "te" else "description_en", "")
        url = svc.get("official_url", "https://ts.meeseva.telangana.gov.in/")
        portal_label = svc.get("portal_label_te" if lang == "te" else "portal_label_en") or "Open Official Service Portal"
        reqs = svc.get("requirements", [])
        docs = [r for r in reqs if r.get("req_type") == "document"]
        fee = svc.get("fee_te" if lang == "te" else "fee_en", "₹45")
        ptime = svc.get("processing_time_te" if lang == "te" else "processing_time_en", "7-14 days")

        if lang == "te":
            doc_lines = "\n".join(
                f"{'✅ [తప్పనిసరి]' if r.get('is_mandatory') else '📌 [వర్తిస్తే]'}: {r.get('name_te') or r.get('name_en')}"
                for r in docs
            )
            answer = (
                f"**{name}** గురించి వివరాలు:\n\n"
                f"{desc}\n\n"
                f"**అవసరమైన పత్రాలు:**\n{doc_lines or 'అధికారిక పోర్టల్ చూడండి'}\n\n"
                f"**రుసుము (Fee):** {fee}\n"
                f"**కాలపరిమితి (Processing Time):** {ptime}\n\n"
                f"**అధికారిక సర్వీస్ లింక్:** [{portal_label}]({url})\n\n"
                f"మీ సమీప మీసేవ కేంద్రంలో కూడా నేరుగా దరఖాస్తు చేసుకోవచ్చు."
            )
        elif lang == "telugish":
            doc_lines = "\n".join(
                f"{'✅ [MANDATORY / తప్పనిసరి]' if r.get('is_mandatory') else '📌 [IF APPLICABLE / వర్తిస్తే]'}: {r.get('name_en')} ({r.get('name_te') or ''})"
                for r in docs
            )
            answer = (
                f"Meeru **{name}** gurinchi adugutunnaru.\n\n"
                f"{desc}\n\n"
                f"**Kavalasina Documents (అవసరమైన పత్రాలు):**\n{doc_lines or 'Official portal lo chudandi'}\n\n"
                f"**Fee:** {fee}\n"
                f"**Processing Time:** {ptime}\n\n"
                f"**Official Service Portal Link:** [{portal_label}]({url})\n\n"
                f"Meeru mee daggarlo unna MeeSeva kendram lo kuda direct ga apply cheyyavachu."
            )
        else:
            doc_lines = "\n".join(
                f"{'✅ [MANDATORY]' if r.get('is_mandatory') else '📌 [IF APPLICABLE]'}: {r.get('name_en')}"
                for r in docs
            )
            answer = (
                f"You are asking about **{name}**.\n\n"
                f"{desc}\n\n"
                f"**Documents Required:**\n{doc_lines or 'See official portal'}\n\n"
                f"**Statutory Fee:** {fee}\n"
                f"**Processing Time:** {ptime}\n\n"
                f"**Official Application Portal:** [{portal_label}]({url})\n\n"
                f"You can also apply in person at any authorized MeeSeva centre."
            )

    return {
        "answer": answer,
        "source_services": source_services,
        "ai_used": False,
        "detected_lang": lang,
        "disclaimer": disclaimer,
    }

