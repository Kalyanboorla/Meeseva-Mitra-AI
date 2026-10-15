// MeeSeva Mitra AI — Language context and translations
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Lang } from './types';

// ── Translation dictionary ────────────────────────────────────────────────
export const translations = {
  en: {
    // App
    appName: 'MeeSeva Mitra AI',
    appTagline: 'Your AI guide to Telangana government services',
    appDisclaimer: 'This is an independent service navigator. Not affiliated with or endorsed by the Government of Telangana.',
    // Nav
    navHome: 'Home',
    navServices: 'Services',
    navAssistant: 'AI Assistant',
    navAbout: 'About',
    // Hero
    heroTitle: 'Find Government Services, Simplified',
    heroSubtitle: 'Describe what you need in your own words — in Telugu or English — and we\'ll guide you to the right Telangana government service.',
    heroSearch: 'What service do you need?',
    heroSearchPlaceholder: 'e.g. I need an income certificate for scholarship...',
    heroSearchBtn: 'Search Services',
    heroAsk: 'Or ask our AI assistant',
    // Search
    searchResults: 'Search Results',
    searchNoResults: 'No matching services found.',
    searchNoResultsHint: 'Try different keywords or browse all services below.',
    searchLoading: 'Searching...',
    // Services
    allServices: 'All Available Services',
    allServicesDesc: 'Verified information from official Telangana government sources',
    viewDetails: 'View Details',
    officialSite: 'Official Portal',
    applyNow: 'Apply Now',
    learnMore: 'Learn More',
    // Service detail
    serviceDetail: 'Service Details',
    department: 'Department',
    eligibility: 'Who Can Apply',
    documentsRequired: 'Documents Required',
    procedure: 'How to Apply',
    fee: 'Fee',
    processingTime: 'Processing Time',
    mandatory: 'Mandatory',
    conditional: 'If Applicable',
    verifiedInfo: 'Verified Information',
    sourcesTitle: 'Information Sources',
    lastVerified: 'Last Verified',
    // Journey steps
    step1: 'Understand the Service',
    step2: 'Check Eligibility',
    step3: 'Prepare Documents',
    step4: 'Review Procedure',
    step5: 'Apply on Official Portal',
    // Chat
    chatTitle: 'AI Service Assistant',
    chatSubtitle: 'Ask me about any Telangana government service',
    chatWelcome: 'Namaskaram! 🙏 I\'m MeeSeva Mitra AI.\n\nI can help you find and understand Telangana government services like income certificates, caste certificates, birth certificates, ration cards and more.\n\nHow can I help you today?',
    chatInput: 'Ask about a government service...',
    chatSend: 'Send',
    chatRestart: 'Start over',
    chatExamples: 'Try asking:',
    chatExample1: 'How do I get an income certificate?',
    chatExample2: 'Documents needed for caste certificate',
    chatExample3: 'How to apply for a ration card?',
    chatExample4: 'Birth certificate for my child',
    aiDisclaimer: 'AI-generated response. Always verify at the official MeeSeva portal.',
    sourcesLabel: 'Related Services:',
    typing: 'Typing...',
    // Errors
    errorGeneric: 'Something went wrong. Please try again.',
    errorNetwork: 'Cannot connect to the server. Please check your connection.',
    errorNotFound: 'Service not found.',
    // Feedback
    wasHelpful: 'Was this helpful?',
    yes: 'Yes',
    no: 'No',
    feedbackThanks: 'Thank you for your feedback!',
    // Categories
    catRevenue: 'Revenue',
    catMunicipal: 'Municipal',
    catCivilSupplies: 'Civil Supplies',
    catAll: 'All Services',
    // Status
    dbConnected: 'Services database connected',
    dbOffline: 'Running in offline mode',
    // Copy
    copyChecklist: 'Copy Checklist',
    copied: 'Copied!',
    // Links
    officialPortal: 'MeeSeva Portal',
    grievance: 'Grievance',
    helpline: 'Helpline: 1800-599-4747',
    // Voice Input
    voiceSpeak: 'Speak your question',
    voiceListening: 'Listening... Speak now',
    voiceProcessing: 'Recognizing speech...',
    voiceLanguage: 'Speech Language',
    voiceTelugu: 'Telugu (తెలుగు)',
    voiceEnglish: 'English (India)',
    voiceNotSupported: 'Voice input is not supported in your browser. You can type your question.',
    voicePermissionDenied: 'Microphone access was denied. Please allow microphone permissions in browser settings.',
    voiceNoSpeech: 'No speech detected. Please click the mic and try again.',
    voicePrivacyNotice: 'Speech recognition operates locally in your browser and audio is not stored by MeeSeva Mitra.',
    voiceCancel: 'Cancel Voice',
    voiceApplyText: 'Use Recognized Text',
    // Back
    back: 'Back',
  },
  te: {
    // App
    appName: 'మీసేవ మిత్ర AI',
    appTagline: 'తెలంగాణ ప్రభుత్వ సేవలకు మీ AI మార్గదర్శి',
    appDisclaimer: 'ఇది స్వతంత్ర సేవా నావిగేటర్. తెలంగాణ ప్రభుత్వంతో అనుబంధం లేదు లేదా ఆమోదించబడలేదు.',
    // Nav
    navHome: 'హోమ్',
    navServices: 'సేవలు',
    navAssistant: 'AI సహాయకుడు',
    navAbout: 'గురించి',
    // Hero
    heroTitle: 'ప్రభుత్వ సేవలు, సులభంగా కనుగొనండి',
    heroSubtitle: 'మీకు ఏమి కావాలో మీ స్వంత మాటల్లో చెప్పండి — తెలుగు లేదా ఇంగ్లీష్‌లో — మేము మీకు సరైన తెలంగాణ ప్రభుత్వ సేవకు మార్గదర్శనం చేస్తాము.',
    heroSearch: 'మీకు ఏ సేవ కావాలి?',
    heroSearchPlaceholder: 'ఉదా: స్కాలర్‌షిప్ కోసం ఆదాయ సర్టిఫికెట్ కావాలి...',
    heroSearchBtn: 'సేవలు వెతకండి',
    heroAsk: 'లేదా మా AI సహాయకుడిని అడగండి',
    // Search
    searchResults: 'వెతుకు ఫలితాలు',
    searchNoResults: 'సరిపోయే సేవ కనుగొనబడలేదు.',
    searchNoResultsHint: 'వేరే పదాలు ప్రయత్నించండి లేదా దిగువ అన్ని సేవలు చూడండి.',
    searchLoading: 'వెతుకుతోంది...',
    // Services
    allServices: 'అన్ని అందుబాటులో ఉన్న సేవలు',
    allServicesDesc: 'అధికారిక తెలంగాణ ప్రభుత్వ మూలాల నుండి ధృవీకరించిన సమాచారం',
    viewDetails: 'వివరాలు చూడండి',
    officialSite: 'అధికారిక పోర్టల్',
    applyNow: 'ఇప్పుడే దరఖాస్తు చేయండి',
    learnMore: 'మరింత తెలుసుకోండి',
    // Service detail
    serviceDetail: 'సేవా వివరాలు',
    department: 'శాఖ',
    eligibility: 'ఎవరు దరఖాస్తు చేయవచ్చు',
    documentsRequired: 'అవసరమైన పత్రాలు',
    procedure: 'దరఖాస్తు ఎలా చేయాలి',
    fee: 'రుసుము',
    processingTime: 'ప్రాసెసింగ్ సమయం',
    mandatory: 'తప్పనిసరి',
    conditional: 'వర్తిస్తే',
    verifiedInfo: 'ధృవీకరించిన సమాచారం',
    sourcesTitle: 'సమాచార మూలాలు',
    lastVerified: 'చివరగా ధృవీకరించిన తేదీ',
    // Journey steps
    step1: 'సేవను అర్థం చేసుకోండి',
    step2: 'అర్హతను తనిఖీ చేయండి',
    step3: 'పత్రాలు సిద్ధం చేయండి',
    step4: 'విధానాన్ని సమీక్షించండి',
    step5: 'అధికారిక పోర్టల్‌లో దరఖాస్తు చేయండి',
    // Chat
    chatTitle: 'AI సేవా సహాయకుడు',
    chatSubtitle: 'ఏ తెలంగాణ ప్రభుత్వ సేవ గురించైనా నన్ను అడగండి',
    chatWelcome: 'నమస్కారం! 🙏 నేను మీసేవ మిత్ర AI.\n\nఆదాయ సర్టిఫికెట్లు, కుల సర్టిఫికెట్లు, జన్మ సర్టిఫికెట్లు, రేషన్ కార్డులు మరియు మరిన్ని తెలంగాణ ప్రభుత్వ సేవలను కనుగొనడంలో మరియు అర్థం చేసుకోవడంలో నేను మీకు సహాయపడగలను.\n\nఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
    chatInput: 'ప్రభుత్వ సేవ గురించి అడగండి...',
    chatSend: 'పంపు',
    chatRestart: 'మళ్ళీ ప్రారంభించండి',
    chatExamples: 'ఇలా అడగండి:',
    chatExample1: 'ఆదాయ సర్టిఫికెట్ ఎలా పొందాలి?',
    chatExample2: 'కుల సర్టిఫికెట్ కోసం పత్రాలు',
    chatExample3: 'రేషన్ కార్డు కోసం ఎలా దరఖాస్తు చేయాలి?',
    chatExample4: 'నా బిడ్డకు జన్మ సర్టిఫికెట్',
    aiDisclaimer: 'AI రూపొందించిన సమాధానం. అధికారిక MeeSeva పోర్టల్‌లో ఎల్లప్పుడూ ధృవీకరించండి.',
    sourcesLabel: 'సంబంధిత సేవలు:',
    typing: 'టైప్ చేస్తోంది...',
    // Errors
    errorGeneric: 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    errorNetwork: 'సర్వర్‌కు కనెక్ట్ చేయడం సాధ్యం కాలేదు. మీ కనెక్షన్ తనిఖీ చేయండి.',
    errorNotFound: 'సేవ కనుగొనబడలేదు.',
    // Feedback
    wasHelpful: 'ఇది సహాయకరంగా ఉందా?',
    yes: 'అవును',
    no: 'కాదు',
    feedbackThanks: 'మీ అభిప్రాయానికి ధన్యవాదాలు!',
    // Categories
    catRevenue: 'రెవెన్యూ',
    catMunicipal: 'మున్సిపల్',
    catCivilSupplies: 'పౌర సరఫరాలు',
    catAll: 'అన్ని సేవలు',
    // Status
    dbConnected: 'సేవల డేటాబేస్ కనెక్ట్ అయింది',
    dbOffline: 'ఆఫ్‌లైన్ మోడ్‌లో నడుస్తోంది',
    // Copy
    copyChecklist: 'చెక్‌లిస్ట్ కాపీ చేయండి',
    copied: 'కాపీ చేయబడింది!',
    // Links
    officialPortal: 'మీసేవ పోర్టల్',
    grievance: 'ఫిర్యాదు',
    helpline: 'హెల్ప్‌లైన్: 1800-599-4747',
    // Voice Input
    voiceSpeak: 'మీ ప్రశ్నను మాట్లాడండి',
    voiceListening: 'వింటోంది... ఇప్పుడు మాట్లాడండి',
    voiceProcessing: 'వాయిస్ గుర్తిస్తోంది...',
    voiceLanguage: 'వాయిస్ భాష',
    voiceTelugu: 'తెలుగు (te-IN)',
    voiceEnglish: 'ఇంగ్లీష్ (en-IN)',
    voiceNotSupported: 'మీ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ అందుబాటులో లేదు. టైప్ చేసి అడగవచ్చు.',
    voicePermissionDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో అనుమతించండి.',
    voiceNoSpeech: 'ధ్వని గుర్తించబడలేదు. మళ్ళీ మైక్ నొక్కి మాట్లాడండి.',
    voicePrivacyNotice: 'వాయిస్ రికగ్నిషన్ మీ బ్రౌజర్‌లోనే జరుగుతుంది. ఆడియో రికార్డ్ లేదా నిల్వ చేయబడదు.',
    voiceCancel: 'రద్దు చేయండి',
    voiceApplyText: 'గుర్తించిన టెక్స్ట్ ఉపయోగించండి',
    // Back
    back: 'వెనక్కు',
  },
} as const;

type TranslationKey = keyof typeof translations['en'];

// ── Context ───────────────────────────────────────────────────────────────
interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  isTE: boolean;
}

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key] as string,
  isTE: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('mm_lang');
    return (stored === 'te' ? 'te' : 'en') as Lang;
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('mm_lang', l);
    document.documentElement.lang = l === 'te' ? 'te' : 'en';
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[lang][key] as string,
    [lang],
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, isTE: lang === 'te' }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
