# MeeSeva Mitra AI — Architecture & System Design

## 1. System Overview

MeeSeva Mitra AI is built to reduce friction for citizens accessing Telangana government services. The architecture separates citizen-facing presentation, retrieval-augmented AI response generation, and verifiable service records.

```
+-------------------------------------------------------+
|                   Citizen Client                      |
|       React 19 + TypeScript + Vite + Tailwind CSS      |
+-------------------------------------------------------+
                           │  HTTP / JSON
                           ▼
+-------------------------------------------------------+
|                    Flask REST API                     |
|  - CORS & Rate Limiting                               |
|  - Input sanitization & validation                    |
|  - Language routing (en / te)                         |
+---------------------------┬---------------------------+
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
+──────────────────────────+    +───────────────────────+
|     AI Assistant / RAG   |    |    Service Data Layer |
| - Grounded Prompt Engine |    | - Hybrid search:      |
| - Gemini 1.5 Flash       |    |   FULLTEXT / REGEXP   |
| - Offline rule fallback  |    | - Requirements & docs |
+──────────────────────────+    +───────────┬───────────+
                                            │
                                            ▼
                                +───────────────────────+
                                | Dual Database Engine  |
                                | - MySQL 8.0 (Prod)    |
                                | - SQLite3 (Dev/Local) |
                                +───────────────────────+
```

---

## 2. RAG (Retrieval-Augmented Generation) Pipeline

When a citizen asks a query:
1. **Query Sanitization**: Strips dangerous characters and bounds length.
2. **Context Retrieval**: Runs hybrid search against the service catalogue (matching `name_en`, `name_te`, `description`, `keywords`).
3. **Grounding**: Retrieved services, requirements (mandatory vs optional), fees, and official links are formatted into a structured context block.
4. **Constrained Generation**:
   - System prompts in English and Telugu strictly forbid inventing facts.
   - Requires citing official URLs.
   - Forbids claiming government agency or submission status.
5. **Fallback Safety**: If Gemini API is offline or unconfigured, the system seamlessly returns a structured rule-based response extracted directly from the verified database.

---

## 3. Database Schema

The database consists of 5 normalized relational tables:
1. `departments`: Government departments (Revenue, CDMA, Civil Supplies).
2. `services`: Detailed service catalogue (slug, descriptions, eligibility, fees, timeline).
3. `requirements`: Structured document requirements and eligibility conditions with mandatory flags.
4. `sources`: Official government reference links for verification evidence.
5. `feedback`: User ratings, helpfulness votes, and feedback comments.

---

## 4. Dual Database Engine Design

To eliminate local environment setup roadblocks:
- `backend/db.py` contains a lightweight socket probe for MySQL on startup.
- If MySQL is not detected or fails, the application automatically boots from `database/meeseva_mitra.db` (SQLite 3), initializing and seeding all official records automatically.
- Both MySQL and SQLite provide identical data structures and API responses.

---

## 5. Voice Input Architecture (Web Speech API)

To support citizens with low literacy or regional typing barriers, the client incorporates a browser-native voice recognition layer (`frontend/src/components/VoiceInput.tsx`):

```
+-------------------------------------------------------+
|                   Citizen Voice Input                 |
|               (Mic Button Click Event)                |
+-------------------------------------------------------+
                           │
                           ▼
+-------------------------------------------------------+
|            Browser SpeechRecognition Engine           |
|    - Dual Locale Support:                             |
|        • te-IN (Telugu - India)                       |
|        • en-IN (English - India)                      |
|    - Real-time Interim Transcript Preview             |
|    - Permission request strictly on user intent       |
+-------------------------------------------------------+
                           │
                           ▼
+-------------------------------------------------------+
|             Citizen Inspection & Edit State           |
|    - Citizen can review, modify text, or cancel       |
|    - Audio never transmitted or stored on server      |
+-------------------------------------------------------+
                           │ Confirm / Submit
                           ▼
+-------------------------------------------------------+
|       Unified Search / AI Assistant Pipeline          |
|      (/api/services/search or /api/assistant)         |
+-------------------------------------------------------+
```

**Graceful Degradation:**
- If the browser does not support Web Speech API, a gentle notice is displayed informing the user to use Google Chrome/Edge, and standard typed input remains 100% operational.
- Permission denials or speech timeouts are handled cleanly without application reload or unhandled exceptions.

---

## 6. Telugish & Natural Language Understanding (NLU) Pipeline

Citizens often communicate in Romanized Telugu ("Telugish") or mix Telugu and English words (*"caste certificate ela apply cheyali?"*).

```
Citizen Query ("caste certificate ela apply cheyali?")
                     │
                     ▼
+-------------------------------------------------------+
|            Language Detection Heuristic               |
|  - Check for Telugu Unicode range (\u0C00-\u0C7F)     |
|  - Match Romanized markers: 'kavali', 'ela', 'cheyali'|
|  - Result: 'telugish' / 'te' / 'en'                   |
+-------------------------------------------------------+
                     │
                     ▼
+-------------------------------------------------------+
|         Weighted Deterministic Relevance Matcher       |
|  - Distinctive service markers get +50 weight         |
|    (e.g., 'caste'->50, 'kulam'->50, 'income'->50)     |
|  - Common generic words ('certificate') get low score |
|  - Accurately breaks ties: caste-certificate = 50.0   |
+-------------------------------------------------------+
                     │
                     ▼
+-------------------------------------------------------+
|          Grounding Context & Prompt Injection         |
|  - Injects verified documents, fees, and links        |
|  - Instructs Gemini to answer in Romanized Telugu     |
|    or formal Telugu matching citizen preference       |
+-------------------------------------------------------+
                     │
                     ▼
+-------------------------------------------------------+
|             Constrained Response Delivery             |
|  - Active: Gemini 3.1 Flash Lite (REST)               |
|  - Fallback: Deterministic Telugish template from DB  |
+-------------------------------------------------------+
```

---

## 7. Service-Specific Official URLs & Dual-Link Architecture

Each service record maintains both a verified service-specific portal URL and a labeled portal title:
- **Income Certificate**: `https://ts.meeseva.telangana.gov.in/meeseva/service.htm` ("Open Official Income Certificate Service (MeeSeva Revenue)")
- **Caste Certificate**: `https://ts.meeseva.telangana.gov.in/meeseva/service.htm` ("Open Official Caste Certificate Service (MeeSeva Community)")
- **Birth Certificate**: `https://cdma.telangana.gov.in/en/birth-and-death-registrations` ("Open Official Birth Registration & Certificate Portal (CDMA)")
- **Residence Certificate**: `https://ts.meeseva.telangana.gov.in/meeseva/service.htm` ("Open Official Residence Certificate Service (MeeSeva Revenue)")
- **Food Security Card**: `https://epds.telangana.gov.in/` ("Open Official EPDS Telangana Ration Card Portal")

When a service-specific direct destination is available, it is prioritized; an alternate verified root link (`ts.meeseva.telangana.gov.in`) is preserved as a fallback starting point.
