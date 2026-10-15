"""
MeeSeva Mitra AI — SQLite Database Initializer & Seeder
Creates and seeds database/meeseva_mitra.db for development or fallback when MySQL is not available.
"""

from __future__ import annotations
import os
import sqlite3
from pathlib import Path

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "meeseva_mitra.db")


def init_sqlite_db(db_path: str = DB_PATH, force_recreate: bool = False) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    if force_recreate:
        cur.executescript("""
        DROP TABLE IF EXISTS feedback;
        DROP TABLE IF EXISTS sources;
        DROP TABLE IF EXISTS requirements;
        DROP TABLE IF EXISTS services;
        DROP TABLE IF EXISTS departments;
        """)

    cur.executescript("""
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        name_en TEXT NOT NULL,
        name_te TEXT,
        description_en TEXT,
        description_te TEXT,
        official_url TEXT,
        contact_info TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_code TEXT NOT NULL UNIQUE,
        department_id INTEGER NOT NULL,
        name_en TEXT NOT NULL,
        name_te TEXT,
        slug TEXT NOT NULL UNIQUE,
        description_en TEXT NOT NULL,
        description_te TEXT,
        eligibility_en TEXT,
        eligibility_te TEXT,
        procedure_en TEXT,
        procedure_te TEXT,
        fee_en TEXT,
        fee_te TEXT,
        processing_time_en TEXT,
        processing_time_te TEXT,
        official_url TEXT,
        alternate_url TEXT,
        portal_label_en TEXT,
        portal_label_te TEXT,
        keywords_en TEXT,
        keywords_te TEXT,
        category TEXT,
        is_online_available INTEGER DEFAULT 1,
        is_offline_available INTEGER DEFAULT 1,
        is_verified INTEGER DEFAULT 0,
        verification_note TEXT,
        is_active INTEGER DEFAULT 1,
        display_order INTEGER DEFAULT 100,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        req_type TEXT NOT NULL,
        is_mandatory INTEGER NOT NULL DEFAULT 1,
        condition_note_en TEXT,
        condition_note_te TEXT,
        name_en TEXT NOT NULL,
        name_te TEXT,
        description_en TEXT,
        description_te TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        domain TEXT,
        verified_at DATE,
        is_official INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER,
        session_id TEXT,
        rating INTEGER,
        helpful INTEGER,
        comment_text TEXT,
        language_used TEXT DEFAULT 'en',
        page_context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    );
    """)

    # Seed departments if empty
    cur.execute("SELECT COUNT(*) FROM departments")
    if cur.fetchone()[0] == 0:
        cur.executemany("""
            INSERT INTO departments (code, name_en, name_te, description_en, official_url)
            VALUES (?, ?, ?, ?, ?)
        """, [
            ('REV', 'Revenue Department', 'రెవెన్యూ శాఖ',
             'Issues certificates for income, caste, residence, nativity and related revenue records.',
             'https://revenue.telangana.gov.in/'),
            ('CDMA', 'Commissioner & Director of Municipal Administration', 'పురపాలక శాఖ',
             'Manages birth, death, marriage registrations and municipal services for urban areas.',
             'https://cdma.telangana.gov.in/'),
            ('CIVIL_SUPPLIES', 'Civil Supplies Department', 'పౌర సరఫరాల శాఖ',
             'Manages food security cards (ration cards) and public distribution system.',
             'https://civilsupplies.telangana.gov.in/')
        ])

        dept_map = {row[1]: row[0] for row in cur.execute("SELECT id, code FROM departments").fetchall()}

        # Seed services
        services_data = [
            (
                'REV-IC-001', dept_map['REV'], 'Income Certificate', 'ఆదాయ ధృవీకరణ పత్రం', 'income-certificate',
                "An official document issued by the Revenue Department certifying an individual's or family's annual income from all sources. Required for scholarship applications, welfare scheme benefits, and fee reimbursements.",
                "రెవెన్యూ శాఖ జారీ చేసే అధికారిక పత్రం, ఇది ఒక వ్యక్తి లేదా కుటుంబం యొక్క మొత్తం వార్షిక ఆదాయాన్ని ధృవీకరిస్తుంది. స్కాలర్‌షిప్‌లు, సంక్షేమ పథకాలు మరియు ఫీజు రీయింబర్స్‌మెంట్ కోసం అవసరం.",
                "Applicant must be a permanent resident of Telangana. Certificate is issued in the name of the parent/guardian for student scholarship purposes. No strict lower income limit to apply; the income threshold depends on the specific scheme or scholarship being applied for.",
                "దరఖాస్తుదారు తెలంగాణలో శాశ్వత నివాసి అయి ఉండాలి. విద్యార్థి స్కాలర్‌షిప్ ప్రయోజనాల కోసం తల్లిదండ్రుల/సంరక్షకుని పేరులో జారీ చేయబడుతుంది.",
                "1. Visit the official MeeSeva Revenue portal (ts.meeseva.telangana.gov.in/meeseva/service.htm) or nearest MeeSeva centre.\n2. Select Revenue Department > Income Certificate.\n3. Fill the application form with family and income details.\n4. Upload required documents (Aadhaar, Photo, Salary/ITR/Affidavit).\n5. Pay the processing fee (approx ₹35).\n6. Receive acknowledgement number.\n7. Once approved by Tahsildar/MRO, download the digitally signed certificate.",
                "1. అధికారిక మీసేవ రెవెన్యూ పోర్టల్ లేదా సమీపంలోని మీసేవ కేంద్రాన్ని సందర్శించండి.\n2. రెవెన్యూ శాఖ > ఆదాయ ధృవీకరణ పత్రం ఎంచుకోండి.\n3. కుటుంబ మరియు ఆదాయ వివరాలతో దరఖాస్తు ఫారంను పూర్తి చేయండి.\n4. అవసరమైన పత్రాలను అప్‌లోడ్ చేయండి.\n5. రుసుము చెల్లించండి (సుమారు ₹35).\n6. అనుమతి నంబర్ పొందండి.\n7. తహసీల్దార్/MRO ఆమోదించిన తర్వాత, డిజిటల్‌గా సంతకం చేయబడిన సర్టిఫికెట్ డౌన్‌లోడ్ చేయండి.",
                "Service fee approximately ₹35 (verify at MeeSeva centre as fees may vary)",
                "సేవా రుసుము సుమారు ₹35 (MeeSeva కేంద్రంలో ధృవీకరించండి)",
                "7–15 working days (subject to Tahsildar approval)",
                "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
                "https://revenue.telangana.gov.in/",
                "Open Official Income Certificate Service (MeeSeva Revenue)",
                "అధికారిక ఆదాయ ధృవీకరణ పత్రం పోర్టల్ (మీసేవ రెవెన్యూ)",
                "income certificate, aadhayam, aadayam, aadhayamu, salary certificate, income proof for scholarship, family income certificate, earning certificate, sampadana, fee, fees, dabbu, scholarship, income certificate ki em kavali, income certificate ela apply cheyali, income proof",
                "ఆదాయ ధృవీకరణ పత్రం, ఆదాయ సర్టిఫికెట్, స్కాలర్‌షిప్ ఆదాయ పత్రం, ఆదాయం",
                "Revenue", 1, "Verified against ts.meeseva.telangana.gov.in and revenue.telangana.gov.in on 2026-10-14", 10
            ),
            (
                'REV-CC-001', dept_map['REV'], 'Caste Certificate (SC/ST/BC)', 'కుల ధృవీకరణ పత్రం (SC/ST/BC)', 'caste-certificate',
                "An official certificate issued by the Revenue Department confirming an individual's caste as Scheduled Caste (SC), Scheduled Tribe (ST), or Backward Class (BC). Required for educational reservations, government job reservations, and welfare scheme applications.",
                "రెవెన్యూ శాఖ జారీ చేసే అధికారిక పత్రం, ఇది ఒక వ్యక్తి యొక్క కులాన్ని SC, ST లేదా BC గా ధృవీకరిస్తుంది. విద్యా రిజర్వేషన్లు, ప్రభుత్వ ఉద్యోగ రిజర్వేషన్లు మరియు సంక్షేమ పథకాల కోసం అవసరం.",
                "Applicant must be a permanent resident/native of Telangana. Must belong to officially notified SC, ST, or BC category as per Government of Telangana lists.",
                "దరఖాస్తుదారు తెలంగాణలో శాశ్వత నివాసి/స్థానికుడు అయి ఉండాలి. తెలంగాణ ప్రభుత్వం అధికారికంగా నోటిఫై చేసిన SC, ST లేదా BC వర్గానికి చెందినవారు అయి ఉండాలి.",
                "1. Visit the official MeeSeva Community Services portal (ts.meeseva.telangana.gov.in/meeseva/service.htm) or nearest MeeSeva centre.\n2. Select Revenue Department > Community/Caste Certificate.\n3. Select the appropriate category (SC/ST/BC-A/BC-B/BC-C/BC-D/BC-E).\n4. Fill the application with personal, family, and community details.\n5. Upload scanned documents (Aadhaar, Study certificates 1st to 10th, Parent caste proof).\n6. Pay processing fee (approx ₹35).\n7. Application is verified by Tahsildar/MRO.\n8. Download the digitally signed certificate once approved.",
                "1. అధికారిక మీసేవ కమ్యూనిటీ పోర్టల్ లేదా సమీపంలోని మీసేవ కేంద్రాన్ని సందర్శించండి.\n2. రెవెన్యూ శాఖ > కమ్యూనిటీ/కుల సర్టిఫికెట్ ఎంచుకోండి.\n3. సరైన వర్గం ఎంచుకోండి (SC/ST/BC).\n4. వ్యక్తిగత, కుటుంబ మరియు కమ్యూనిటీ వివరాలతో దరఖాస్తు పూర్తి చేయండి.\n5. స్కాన్ చేసిన పత్రాలను అప్‌లోడ్ చేయండి.\n6. రుసుము చెల్లించండి.\n7. తహసీల్దార్/MRO ద్వారా దరఖాస్తు ధృవీకరించబడుతుంది.\n8. ఆమోదించిన తర్వాత డిజిటల్ సర్టిఫికెట్ డౌన్‌లోడ్ చేయండి.",
                "Service fee approximately ₹35 (verify at MeeSeva centre)",
                "సేవా రుసుము సుమారు ₹35 (MeeSeva కేంద్రంలో ధృవీకరించండి)",
                "7–15 working days for renewals; up to 30 days for fresh field verification",
                "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
                "https://telangana.gov.in/departments/scheduled-castes-development/",
                "Open Official Caste Certificate Service (MeeSeva Community)",
                "అధికారిక కుల ధృవీకరణ పత్రం పోర్టల్ (మీసేవ కమ్యూనిటీ)",
                "caste certificate, community certificate, SC certificate, ST certificate, BC certificate, scheduled caste, scheduled tribe, backward class, OBC certificate, kulam, kula, cast, caste certificate ela apply cheyali, samajika vargam, reservation certificate",
                "కుల ధృవీకరణ పత్రం, కమ్యూనిటీ సర్టిఫికెట్, SC పత్రం, ST పత్రం, BC పత్రం, కులం",
                "Revenue", 1, "Verified against telangana.gov.in and ts.meeseva.telangana.gov.in on 2026-10-14", 20
            ),
            (
                'CDMA-BC-001', dept_map['CDMA'], 'Birth Certificate', 'జన్మ ధృవీకరణ పత్రం', 'birth-certificate',
                "An official certificate issued by GHMC/CDMA Municipality confirming the date and place of birth. Required for school admissions, passport applications, driving licence and other official purposes.",
                "GHMC/మున్సిపాలిటీ జారీ చేసే అధికారిక పత్రం, ఇది పుట్టిన తేదీ మరియు స్థలాన్ని ధృవీకరిస్తుంది. పాఠశాల ప్రవేశాలు, పాస్‌పోర్ట్ దరఖాస్తులు, డ్రైవింగ్ లైసెన్స్ మరియు ఇతర అధికారిక ప్రయోజనాల కోసం అవసరం.",
                "The birth must have occurred within the GHMC/Municipality jurisdiction. Under the Registration of Births and Deaths (RBD) Act 1969, births must be reported within 21 days free of fee. Late registrations (>1 year) require magistrate order.",
                "జననం GHMC/మున్సిపాలిటీ పరిధిలో జరిగి ఉండాలి. రిజిస్ట్రేషన్ ఆఫ్ బర్త్స్ & డెత్స్ చట్టం 1969 ప్రకారం, 21 రోజులలోపు నమోదు ఉచితం. 1 సంవత్సరం దాటిన ఆలస్య నమోదులకు మేజిస్ట్రేట్ ఉత్తర్వులు అవసరం.",
                "1. Visit the official CDMA Telangana Birth Portal (cdma.telangana.gov.in/en/birth-and-death-registrations) or nearest MeeSeva centre.\n2. Select CDMA / GHMC Department > Birth Certificate.\n3. Search for the record using Date of Birth, Father's Name, and Hospital/Registration Number.\n4. If record is found, pay the certificate fee (approx ₹35) to download.\n5. For name inclusion (if child's name was not added at registration): submit name inclusion form.\n6. For late registration (>1 year): submit non-availability certificate, affidavit, and magistrate order.",
                "1. అధికారిక CDMA తెలంగాణ బర్త్ పోర్టల్ లేదా సమీపంలోని మీసేవ కేంద్రాన్ని సందర్శించండి.\n2. CDMA / GHMC శాఖ > జన్మ ధృవీకరణ పత్రం ఎంచుకోండి.\n3. పుట్టిన తేదీ, తండ్రి పేరు, ఆసుపత్రి/రిజిస్ట్రేషన్ నంబర్ ఉపయోగించి రికార్డ్ వెతకండి.\n4. రికార్డ్ కనుగొనబడితే, డౌన్‌లోడ్ చేయడానికి సర్టిఫికెట్ ఫీజు చెల్లించండి.",
                "Service fee approximately ₹35–₹50 (verify at MeeSeva centre)",
                "సేవా రుసుము సుమారు ₹35–₹50 (MeeSeva కేంద్రంలో ధృవీకరించండి)",
                "1–3 working days for registered births; 30+ days for late registration",
                "https://cdma.telangana.gov.in/en/birth-and-death-registrations",
                "https://ghmc.gov.in/",
                "Open Official Birth Registration & Certificate Portal (CDMA)",
                "అధికారిక జనన నమోదు & సర్టిఫికేట్ పోర్టల్ (CDMA)",
                "birth certificate, date of birth proof, DOB certificate, hospital birth certificate, child birth certificate, name inclusion birth certificate, janma dhrveekarana, janana, puttina, puttuka, pillalu, bidda, naaku birth certificate kavali",
                "జన్మ ధృవీకరణ పత్రం, పుట్టిన తేదీ పత్రం, పిల్లల జన్మ సర్టిఫికెట్, జనన",
                "Municipal", 1, "Verified against cdma.telangana.gov.in and telangana.gov.in on 2026-10-14", 30
            ),
            (
                'REV-RD-001', dept_map['REV'], 'Residence / Domicile Certificate', 'నివాస ధృవీకరణ పత్రం', 'residence-certificate',
                "An official certificate issued by the Revenue Department (Tahsildar) confirming that an individual is a resident of Telangana. Required for local candidate quotas in educational institutions, TSPSC/TGPSC exams, and certain government schemes.",
                "రెవెన్యూ శాఖ (తహసీల్దార్) జారీ చేసే అధికారిక పత్రం, ఇది వ్యక్తి తెలంగాణలో నివాసి అని ధృవీకరిస్తుంది. విద్యా సంస్థల్లో స్థానిక అభ్యర్థి కోటాలు, TSPSC/TGPSC పరీక్షలు మరియు కొన్ని ప్రభుత్వ పథకాల కోసం అవసరం.",
                "Applicant must be a permanent resident of Telangana. For local student quota, continuous study in Telangana for 4+ consecutive academic years is required under Presidential Order. Women married to permanent Telangana residents are also eligible.",
                "దరఖాస్తుదారు తెలంగాణలో శాశ్వత నివాసి అయి ఉండాలి. స్థానిక కోటా కోసం రాష్ట్రపతి ఉత్తర్వుల ప్రకారం 4+ సంవత్సరాల నిరంతర అధ్యయనం అవసరం. తెలంగాణ నివాసికి వివాహమైన మహిళలు కూడా అర్హులు.",
                "1. Visit the official MeeSeva Revenue portal (ts.meeseva.telangana.gov.in/meeseva/service.htm) or nearest MeeSeva centre.\n2. Select Revenue Department > Residence Certificate.\n3. Fill in personal details and residential history.\n4. Upload identity proof (Aadhaar), address proof (Electricity bill/Ration card), and study certificates.\n5. Pay the processing fee (approx ₹35).\n6. Tahsildar verifies and approves.\n7. Download the digitally signed certificate.",
                "1. అధికారిక మీసేవ రెవెన్యూ పోర్టల్ లేదా సమీపంలోని మీసేవ కేంద్రాన్ని సందర్శించండి.\n2. రెవెన్యూ శాఖ > నివాస ధృవీకరణ పత్రం ఎంచుకోండి.\n3. వ్యక్తిగత వివరాలు మరియు నివాస చరిత్ర నమోదు చేయండి.\n4. గుర్తింపు రుజువు, చిరునామా రుజువు అప్‌లోడ్ చేయండి.\n5. రుసుము చెల్లించండి.\n6. తహసీల్దార్ ధృవీకరిస్తారు మరియు ఆమోదిస్తారు.\n7. డిజిటల్ సర్టిఫికెట్ డౌన్‌లోడ్ చేయండి.",
                "Service fee approximately ₹35–₹50 (verify at MeeSeva centre)",
                "సేవా రుసుము సుమారు ₹35–₹50 (MeeSeva కేంద్రంలో ధృవీకరించండి)",
                "7–15 working days",
                "https://ts.meeseva.telangana.gov.in/meeseva/service.htm",
                "https://revenue.telangana.gov.in/",
                "Open Official Residence Certificate Service (MeeSeva Revenue)",
                "అధికారిక నివాస ధృవీకరణ పత్రం పోర్టల్ (మీసేవ రెవెన్యూ)",
                "residence certificate, domicile certificate, local candidate certificate, nativity certificate, Telangana residence proof, address certificate, nivasa, nivasam, sthanika, untunna, illu, local candidate",
                "నివాస ధృవీకరణ పత్రం, డొమిసైల్ సర్టిఫికెట్, స్థానిక అభ్యర్థి సర్టిఫికెట్, నివాసం",
                "Revenue", 1, "Verified against telangana.gov.in and ts.meeseva.telangana.gov.in on 2026-10-14", 40
            ),
            (
                'CS-RC-001', dept_map['CIVIL_SUPPLIES'], 'Food Security Card (Ration Card)', 'ఆహార భద్రతా కార్డు (రేషన్ కార్డు)', 'ration-card',
                "A Food Security Card (commonly called Ration Card) issued by the Civil Supplies Department entitles eligible families to subsidised food grains under the Public Distribution System (PDS). It also serves as an address and identity document.",
                "పౌర సరఫరాల శాఖ జారీ చేసే ఆహార భద్రతా కార్డు (రేషన్ కార్డు) అర్హులైన కుటుంబాలకు ప్రజా పంపిణీ వ్యవస్థ (PDS) కింద సబ్సిడీ ఆహార ధాన్యాలను అందిస్తుంది. ఇది చిరునామా మరియు గుర్తింపు పత్రంగా కూడా పనిచేస్తుంది.",
                "Permanent resident of Telangana. Household must not already possess an active Food Security Card in Telangana or any other state. Must belong to economically weaker section/BPL category. Annual household income generally up to ₹1.5 lakh (rural) / ₹2.0 lakh (urban). Must not be an income tax payer.",
                "తెలంగాణలో శాశ్వత నివాసి. కుటుంబానికి తెలంగాణ లేదా మరే రాష్ట్రంలోనూ ఇప్పటికే సక్రియ ఆహార భద్రతా కార్డు ఉండకూడదు. ఆర్థికంగా వెనుకబడిన వర్గం/BPL వర్గానికి చెందినవారై ఉండాలి.",
                "1. Check eligibility and track active cards on the official EPDS Telangana portal (epds.telangana.gov.in).\n2. Download the FSC application form or collect it at the nearest MeeSeva centre.\n3. Fill in details: Head of Household, all family members (with Aadhaar numbers), address, and LPG connection details.\n4. Submit the completed form with required documents at the nearest MeeSeva centre.\n5. Pay the prescribed service fee (approximately ₹30–₹35).\n6. Collect acknowledgement slip with application/reference number.\n7. Track status on epds.telangana.gov.in.",
                "1. అర్హతను పరిశీలించి అధికారిక EPDS పోర్టల్ (epds.telangana.gov.in) లో దరఖాస్తును ట్రాక్ చేయండి.\n2. FSC దరఖాస్తు ఫారంను సమీపంలోని మీసేవ కేంద్రంలో పొందండి.\n3. కుటుంబ పెద్ద, కుటుంబ సభ్యుల వివరాలు (ఆధార్ నంబర్లతో), చిరునామా నమోదు చేయండి.\n4. పూర్తి చేసిన ఫారం మరియు అవసరమైన పత్రాలతో సమీపంలోని మీసేవ కేంద్రంలో సమర్పించండి.\n5. నిర్ధారిత సేవా రుసుము చెల్లించండి (సుమారు ₹30–₹35).\n6. దరఖాస్తు/రిఫరెన్స్ నంబర్‌తో అనుమతి రసీదు పొందండి.\n7. epds.telangana.gov.in లో స్థితిని ట్రాక్ చేయండి.",
                "Service fee approximately ₹30–₹35 (verify at MeeSeva centre)",
                "సేవా రుసుము సుమారు ₹30–₹35 (MeeSeva కేంద్రంలో ధృవీకరించండి)",
                "Variable — subject to Civil Supplies Department verification",
                "https://epds.telangana.gov.in/",
                "https://civilsupplies.telangana.gov.in/",
                "Open Official EPDS Telangana Ration Card Portal",
                "అధికారిక EPDS తెలంగాణ రేషన్ కార్డు పోర్టల్",
                "ration card, food security card, PDS card, BPL card, ration card application, new ration card, FSC Telangana, ration, resan, chitti, biyyam, food card, ration card kosam ekkada apply cheyyali, EPDS Telangana, subsidy rice",
                "రేషన్ కార్డు, ఆహార భద్రతా కార్డు, FSC దరఖాస్తు, BPL కార్డు, రేషన్, బియ్యం కార్డు",
                "Civil Supplies", 1, "Verified against epds.telangana.gov.in and civilsupplies.telangana.gov.in on 2026-10-14", 50
            ),
        ]

        cur.executemany("""
            INSERT INTO services (
                service_code, department_id, name_en, name_te, slug,
                description_en, description_te, eligibility_en, eligibility_te,
                procedure_en, procedure_te, fee_en, fee_te, processing_time_en,
                official_url, alternate_url, portal_label_en, portal_label_te,
                keywords_en, keywords_te, category, is_verified,
                verification_note, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, services_data)

        svc_map = {row[1]: row[0] for row in cur.execute("SELECT id, service_code FROM services").fetchall()}

        # Seed requirements
        reqs = [
            # Income
            (svc_map['REV-IC-001'], 'document', 1, 'Aadhaar Card', 'ఆధార్ కార్డు', 'Mandatory identity and address proof', 10),
            (svc_map['REV-IC-001'], 'document', 1, 'Filled & Signed Application Form', 'పూర్తి చేసిన దరఖాస్తు ఫారం', 'Duly filled and signed income certificate application form', 20),
            (svc_map['REV-IC-001'], 'document', 1, 'Passport-size Photograph', 'పాస్‌పోర్ట్ సైజు ఫోటో', 'Recent passport-size photograph of the applicant', 30),
            (svc_map['REV-IC-001'], 'document', 0, 'Salary Slips / Form 16', 'జీతం స్లిప్‌లు / ఫారం 16', 'For salaried employees: pay slips or Form 16 from employer', 40),
            (svc_map['REV-IC-001'], 'document', 0, 'Income Tax Returns (ITR)', 'ఆదాయపు పన్ను రిటర్న్‌లు', 'For income tax payers: copy of ITR', 50),
            (svc_map['REV-IC-001'], 'document', 0, 'Income Affidavit / Self-Declaration', 'ఆదాయ అఫిడవిట్ / స్వీయ ప్రకటన', 'For self-employed/daily wage earners: income affidavit on stamp paper', 60),
            (svc_map['REV-IC-001'], 'document', 0, 'Ration Card', 'రేషన్ కార్డు', 'As additional address proof if needed', 70),
            (svc_map['REV-IC-001'], 'eligibility', 1, 'Permanent Telangana Resident', 'తెలంగాణలో శాశ్వత నివాసి', 'Must be a permanent resident/citizen of Telangana', 10),
            # Caste
            (svc_map['REV-CC-001'], 'document', 1, 'Aadhaar Card', 'ఆధార్ కార్డు', 'Mandatory identity and address proof', 10),
            (svc_map['REV-CC-001'], 'document', 1, 'Filled & Signed Application Form', 'పూర్తి చేసిన దరఖాస్తు ఫారం', 'Signed application form for community/caste certificate', 20),
            (svc_map['REV-CC-001'], 'document', 1, 'Proof of Date of Birth', 'పుట్టిన తేదీ రుజువు', 'SSC Marks Memo, Transfer Certificate (TC), or DOB extract', 30),
            (svc_map['REV-CC-001'], 'document', 1, 'Study Certificates (1st to 10th)', 'అధ్యయన సర్టిఫికెట్లు (1 నుండి 10వ వరకు)', 'School study certificates or school leaving certificate', 40),
            (svc_map['REV-CC-001'], 'document', 0, 'Family Caste Certificate', 'కుటుంబ కుల ధృవీకరణ పత్రం', 'Caste certificate of father, brother, sister, or blood relative from paternal side — speeds up verification', 50),
            (svc_map['REV-CC-001'], 'document', 0, 'Ration Card or Voter ID', 'రేషన్ కార్డు లేదా ఓటరు ID', 'Additional address/identity proof', 60),
            (svc_map['REV-CC-001'], 'eligibility', 1, 'Permanent Telangana Resident/Native', 'తెలంగాణ స్థానికుడు', 'Must be permanent resident/native of Telangana', 10),
            (svc_map['REV-CC-001'], 'eligibility', 1, 'Notified SC/ST/BC Category', 'అధికారిక SC/ST/BC వర్గం', 'Must belong to officially notified Scheduled Caste, Scheduled Tribe, or Backward Class of Telangana', 20),
            # Birth
            (svc_map['CDMA-BC-001'], 'document', 1, 'Hospital Acknowledgement / Registration Number', 'ఆసుపత్రి అనుమతి / నమోదు నంబర్', 'Reference number provided by hospital at the time of birth registration', 10),
            (svc_map['CDMA-BC-001'], 'document', 1, "Parents' Aadhaar Cards", 'తల్లిదండ్రుల ఆధార్ కార్డులు', 'Aadhaar cards of both parents for verification', 20),
            (svc_map['CDMA-BC-001'], 'document', 0, 'Hospital Discharge Card / Birth Slip', 'ఆసుపత్రి డిశ్చార్జ్ కార్డు / జన్మ రసీదు', 'Required for name inclusion if not added at initial registration', 30),
            (svc_map['CDMA-BC-001'], 'document', 0, 'Affidavit for Late Registration', 'ఆలస్య నమోదు కోసం అఫిడవిట్', 'Required only if birth was not registered within 1 year — notarized/magistrate attested', 40),
            (svc_map['CDMA-BC-001'], 'note', 1, 'Hospital Birth Registration', 'ఆసుపత్రి జన్మ నమోదు', 'For births in registered hospitals, the hospital typically submits the record to GHMC/Municipality within 7 days. No heavy documentation is usually needed if the record is already in the GHMC database.', 5),
            # Residence
            (svc_map['REV-RD-001'], 'document', 1, 'Aadhaar Card', 'ఆధార్ కార్డు', 'Identity and address proof', 10),
            (svc_map['REV-RD-001'], 'document', 1, 'Filled & Signed Application Form', 'పూర్తి చేసిన దరఖాస్తు ఫారం', 'Signed application form for residence/domicile certificate', 20),
            (svc_map['REV-RD-001'], 'document', 1, 'Address / Residence Proof', 'చిరునామా / నివాస రుజువు', 'Ration Card, Electricity/Water Bill, Registered Rent Agreement, or Voter ID', 30),
            (svc_map['REV-RD-001'], 'document', 1, 'Passport-size Photograph', 'పాస్‌పోర్ట్ సైజు ఫోటో', 'Recent photograph of the applicant', 40),
            (svc_map['REV-RD-001'], 'document', 0, 'Study Certificates', 'అధ్యయన సర్టిఫికెట్లు', 'Study certificates from Telangana schools — required for local candidate quota purposes', 50),
            (svc_map['REV-RD-001'], 'document', 0, 'Birth Certificate / School Leaving Certificate', 'జన్మ ధృవీకరణ పత్రం / పాఠశాల విడుపు సర్టిఫికెట్', 'For age/DOB verification if needed', 60),
            (svc_map['REV-RD-001'], 'eligibility', 1, 'Permanent Telangana Resident', 'తెలంగాణలో శాశ్వత నివాసి', 'Must be permanent resident of Telangana', 10),
            (svc_map['REV-RD-001'], 'eligibility', 0, 'Married to Telangana Resident', 'తెలంగాణ నివాసికి వివాహమైన మహిళ', 'Women married to permanent Telangana residents are also eligible', 20),
            # Ration Card
            (svc_map['CS-RC-001'], 'document', 1, 'Aadhaar Cards (All Family Members)', 'ఆధార్ కార్డులు (అన్ని కుటుంబ సభ్యుల)', 'Aadhaar cards mandatory for Head of Family and all members to be included', 10),
            (svc_map['CS-RC-001'], 'document', 1, 'Filled Application Form', 'పూర్తి చేసిన దరఖాస్తు ఫారం', 'FSC application form available from MeeSeva centre or downloadable from meeseva.telangana.gov.in', 20),
            (svc_map['CS-RC-001'], 'document', 1, 'Address Proof', 'చిరునామా రుజువు', 'Electricity Bill, Water Bill, Registered Rent Agreement, or Voter ID', 30),
            (svc_map['CS-RC-001'], 'document', 1, 'Income Certificate', 'ఆదాయ ధృవీకరణ పత్రం', 'To verify annual household income below prescribed threshold', 40),
            (svc_map['CS-RC-001'], 'document', 1, 'Passport-size Photograph (Head of Family)', 'పాస్‌పోర్ట్ సైజు ఫోటో (కుటుంబ పెద్ద)', 'Recent photograph of the head of the family', 50),
            (svc_map['CS-RC-001'], 'document', 0, 'LPG Gas Connection Details', 'LPG గ్యాస్ కనెక్షన్ వివరాలు', 'Consumer number, agency name, and provider details if applicable', 60),
            (svc_map['CS-RC-001'], 'document', 0, 'Marriage Certificate', 'వివాహ ధృవీకరణ పత్రం', 'Required if a newly married couple is applying for a separate card', 70),
            (svc_map['CS-RC-001'], 'eligibility', 1, 'Permanent Telangana Resident', 'తెలంగాణలో శాశ్వత నివాసి', 'Must be permanent resident of Telangana', 10),
            (svc_map['CS-RC-001'], 'eligibility', 1, 'No Existing Active Ration Card', 'ఇప్పటికే సక్రియ రేషన్ కార్డు లేకపోవడం', 'Household must not already possess an active Food Security Card in any state', 20),
            (svc_map['CS-RC-001'], 'eligibility', 1, 'BPL/EWS Income Category', 'BPL/EWS ఆదాయ వర్గం', 'Annual household income generally up to ₹1.5 lakh (rural) or ₹2 lakh (urban)', 30),
        ]

        cur.executemany("""
            INSERT INTO requirements (service_id, req_type, is_mandatory, name_en, name_te, description_en, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, reqs)

        # Seed sources
        sources = [
            (svc_map['REV-IC-001'], 'Telangana MeeSeva Revenue Services', 'https://ts.meeseva.telangana.gov.in/meeseva/service.htm', 'ts.meeseva.telangana.gov.in', '2026-10-14', 1, 'Official MeeSeva Revenue Department application service portal'),
            (svc_map['REV-IC-001'], 'Telangana Revenue Department', 'https://revenue.telangana.gov.in/', 'revenue.telangana.gov.in', '2026-10-14', 1, 'Official Revenue Department portal for income certificate citizen charter'),
            (svc_map['REV-CC-001'], 'Telangana MeeSeva Community Services', 'https://ts.meeseva.telangana.gov.in/meeseva/service.htm', 'ts.meeseva.telangana.gov.in', '2026-10-14', 1, 'Official Community / Caste certificate MeeSeva service application portal'),
            (svc_map['REV-CC-001'], 'Telangana Social Welfare Department', 'https://telangana.gov.in/departments/scheduled-castes-development/', 'telangana.gov.in', '2026-10-14', 1, 'SC/ST/BC caste verification rules and reservation policy'),
            (svc_map['CDMA-BC-001'], 'CDMA Telangana Birth & Death Registrations Portal', 'https://cdma.telangana.gov.in/en/birth-and-death-registrations', 'cdma.telangana.gov.in', '2026-10-14', 1, 'Official CDMA portal for municipal birth certificate registration and search'),
            (svc_map['CDMA-BC-001'], 'GHMC Citizen Services (Births)', 'https://ghmc.gov.in/', 'ghmc.gov.in', '2026-10-14', 1, 'GHMC online citizen services portal for Hyderabad urban birth records'),
            (svc_map['REV-RD-001'], 'Telangana MeeSeva Residence Service', 'https://ts.meeseva.telangana.gov.in/meeseva/service.htm', 'ts.meeseva.telangana.gov.in', '2026-10-14', 1, 'Direct MeeSeva Residence Certificate application entry'),
            (svc_map['REV-RD-001'], 'Telangana Revenue Department', 'https://revenue.telangana.gov.in/', 'revenue.telangana.gov.in', '2026-10-14', 1, 'Telangana residence & local candidate eligibility requirements'),
            (svc_map['CS-RC-001'], 'EPDS Telangana (Food Security Card Portal)', 'https://epds.telangana.gov.in/', 'epds.telangana.gov.in', '2026-10-14', 1, 'Official Food Security Card (Ration Card) search, application tracking and allocation portal'),
            (svc_map['CS-RC-001'], 'Telangana Civil Supplies Department', 'https://civilsupplies.telangana.gov.in/', 'civilsupplies.telangana.gov.in', '2026-10-14', 1, 'Official Civil Supplies Department portal with FSC guidelines')
        ]

        cur.executemany("""
            INSERT INTO sources (service_id, title, url, domain, verified_at, is_official, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, sources)

    conn.commit()
    return conn


if __name__ == "__main__":
    c = init_sqlite_db(force_recreate=True)
    print("SQLite seeded successfully with updated schema and specific portal URLs.")
    cur = c.cursor()
    cur.execute("SELECT count(*) FROM services")
    print(f"Total services in SQLite: {cur.fetchone()[0]}")
    cur.execute("SELECT service_code, portal_label_en, official_url FROM services")
    for row in cur.fetchall():
        print(f"  [{row[0]}] {row[1]} -> {row[2]}")
    c.close()
