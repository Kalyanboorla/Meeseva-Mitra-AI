# MeeSeva Mitra AI — API Documentation

Base URL: `http://localhost:5000`

---

## 1. Health Check

### `GET /api/health`
Returns application and database connectivity status.

**Response `200 OK`**:
```json
{
  "db": "connected",
  "engine": "sqlite",
  "status": "ok",
  "timestamp": "2026-10-14T13:18:17.485123+00:00",
  "version": "1.0.0"
}
```

---

## 2. Services Catalogue

### `GET /api/services`
List all active Telangana government services.

**Query Parameters**:
- `lang` (optional): `en` (default) or `te` (Telugu).

**Response `200 OK`**:
```json
{
  "count": 5,
  "lang": "en",
  "services": [
    {
      "id": 1,
      "service_code": "REV-IC-001",
      "slug": "income-certificate",
      "name_en": "Income Certificate",
      "name_te": "ఆదాయ ధృవీకరణ పత్రం",
      "category": "Revenue",
      "fee_en": "Service fee approximately ₹35 (verify at MeeSeva centre as fees may vary)",
      "processing_time_en": "7–15 working days (subject to Tahsildar approval)",
      "official_url": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
      "alternate_url": "https://ts.meeseva.telangana.gov.in/",
      "portal_label_en": "Open Official Income Certificate Service (MeeSeva Revenue)",
      "portal_label_te": "అధికారిక ఆదాయ ధృవీకరణ పత్రం సర్వీస్ తెరవండి (మీసేవ రెవెన్యూ)",
      "is_verified": 1,
      "dept_name_en": "Revenue Department",
      "dept_name_te": "రెవెన్యూ శాఖ"
    }
  ]
}
```

---

## 3. Search Services

### `GET /api/services/search`
Hybrid fulltext and keyword search across service names, descriptions, and keywords.

**Query Parameters**:
- `q` (required): Search query string (minimum 2 characters).
- `lang` (optional): `en` or `te`.

**Response `200 OK`**:
```json
{
  "count": 1,
  "lang": "en",
  "query": "income",
  "results": [
    {
      "id": 1,
      "name_en": "Income Certificate",
      "name_te": "ఆదాయ ధృవీకరణ పత్రం",
      "slug": "income-certificate",
      "category": "Revenue",
      "score": 1.0
    }
  ]
}
```

---

## 4. Service Detail

### `GET /api/services/<slug>`
Retrieves full details for a service including required documents, eligibility criteria, and verification sources.

**Response `200 OK`**:
```json
{
  "id": 1,
  "name_en": "Income Certificate",
  "slug": "income-certificate",
  "eligibility_en": "Applicant must be a permanent resident of Telangana...",
  "procedure_en": "1. Visit ts.meeseva.telangana.gov.in...\n2. Select Revenue Department...",
  "requirements": [
    {
      "req_type": "document",
      "is_mandatory": 1,
      "name_en": "Aadhaar Card",
      "name_te": "ఆధార్ కార్డు",
      "description_en": "Mandatory identity and address proof"
    }
  ],
  "sources": [
    {
      "title": "Telangana MeeSeva Portal",
      "url": "https://ts.meeseva.telangana.gov.in/",
      "is_official": 1
    }
  ]
}
```

---

## 5. AI Assistant

### `POST /api/assistant`
Grounded conversational AI assistant for citizen inquiries, supporting English, formal Telugu, Romanized Telugu (Telugish), and code-mixed queries.

**Request Body**:
```json
{
  "message": "income certificate ki em documents kavali?",
  "lang": "auto",
  "session_id": "optional-uuid-string"
}
```

**Parameters**:
- `message` (required, string, 2–500 chars): Citizen query in English, Telugu script, or Romanized Telugu (Telugish).
- `lang` or `language` (optional, string):
  - `"auto"` (default): Automatically detects language (`te` for Telugu script, `telugish` for Romanized Telugu, `en` for English).
  - `"en"`: English.
  - `"te"`: Formal Telugu script.
  - `"telugish"`: Romanized Telugu / English-Telugu transliteration.
- `session_id` (optional, string): Client session UUID for conversation continuity.

**Response `200 OK`**:
```json
{
  "answer": "Meeru Income Certificate (ఆదాయ ధృవీకరణ పత్రం) gurinchi adugutunnaru.\n\nKaavalasina Documents:\n✅ Mandatory: Aadhaar Card (Applicant & Family)\n✅ Mandatory: Filled Application Form with signature\n📌 Conditional: Salary Certificate / Form 16 / Ration Card\n\nOfficial Portal Link:\n👉 Open Official Income Certificate Service (MeeSeva Revenue): https://ts.meeseva.telangana.gov.in/meeseva/service.htm\n\nFee: ₹35 MeeSeva service charge. Time: 7–15 working days.",
  "ai_used": false,
  "disclaimer": "⚠️ This is an AI-generated response based on publicly available information. Always verify requirements at the official MeeSeva portal or nearest MeeSeva centre.",
  "session_id": "c1f7b029-...",
  "source_services": [
    {
      "name_en": "Income Certificate",
      "name_te": "ఆదాయ ధృవీకరణ పత్రం",
      "slug": "income-certificate",
      "official_url": "https://ts.meeseva.telangana.gov.in/meeseva/service.htm"
    }
  ]
}
```

---

## 6. Citizen Feedback

### `POST /api/feedback`
Submits citizen rating and helpfulness feedback.

**Request Body**:
```json
{
  "service_id": 1,
  "rating": 5,
  "helpful": true,
  "comment": "Accurate document list!",
  "lang": "en",
  "page": "/services/income-certificate"
}
```

**Response `201 Created`**:
```json
{
  "message": "Feedback received. Thank you!",
  "status": 201
}
```
