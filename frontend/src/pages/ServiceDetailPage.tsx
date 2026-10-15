// MeeSeva Mitra AI — Service detail page with step-by-step journey
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ExternalLink, CheckCircle2, Circle, AlertCircle,
  FileText, User, ClipboardList, BookOpen, Globe, ShieldCheck,
  Copy, Check, ThumbsUp, ThumbsDown, AlertTriangle, PhoneCall,
  Info, CheckSquare, Square, Printer,
} from 'lucide-react';
import { fetchServiceDetail, submitFeedback } from '../api';
import type { Service } from '../types';
import { useLang } from '../lang';
import RejectionGuidanceModal from '../components/RejectionGuidanceModal';

const STEPS = [
  { key: 'step1', icon: BookOpen },
  { key: 'step2', icon: User },
  { key: 'step3', icon: ClipboardList },
  { key: 'step4', icon: FileText },
  { key: 'step5', icon: Globe },
] as const;

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>(() => {
    if (!slug) return {};
    try {
      const saved = localStorage.getItem(`mm_docs_${slug}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleDoc = (docName: string) => {
    setCheckedDocs((prev) => {
      const next = { ...prev, [docName]: !prev[docName] };
      if (slug) {
        try {
          localStorage.setItem(`mm_docs_${slug}`, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchServiceDetail(slug)
      .then(setService)
      .catch(() => setError(t('errorNotFound')))
      .finally(() => setLoading(false));
  }, [slug, t]);

  // Track recently viewed
  useEffect(() => {
    if (!service) return;
    const viewed: string[] = JSON.parse(localStorage.getItem('mm_viewed') || '[]');
    const updated = [service.slug, ...viewed.filter((s) => s !== service.slug)].slice(0, 5);
    localStorage.setItem('mm_viewed', JSON.stringify(updated));
  }, [service]);

  const handleCopyChecklist = useCallback(() => {
    if (!service) return;
    const docs = (service.requirements || []).filter((r) => r.req_type === 'document');
    const text = docs
      .map((d) => `${d.is_mandatory ? '✅' : '📌'} ${d.name_en}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [service]);

  const handleFeedback = async (helpful: boolean) => {
    if (!service || feedbackSent) return;
    try {
      await submitFeedback({
        service_id: service.id,
        helpful,
        lang,
        page: `service/${service.slug}`,
      });
    } finally {
      setFeedbackSent(true);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-48 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-medium mb-4">{error || t('errorNotFound')}</p>
        <button onClick={() => navigate('/services')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </button>
      </main>
    );
  }

  const name = lang === 'te' && service.name_te ? service.name_te : service.name_en;
  const description =
    lang === 'te' && service.description_te ? service.description_te : service.description_en;
  const eligibility =
    lang === 'te' && service.eligibility_te ? service.eligibility_te : service.eligibility_en;
  const procedure =
    lang === 'te' && service.procedure_te ? service.procedure_te : service.procedure_en;
  const fee = lang === 'te' && service.fee_te ? service.fee_te : service.fee_en;
  const dept =
    lang === 'te' && service.dept_name_te ? service.dept_name_te : service.dept_name_en;

  const docRequirements = (service.requirements || []).filter((r) => r.req_type === 'document');
  const eligibilityItems = (service.requirements || []).filter((r) => r.req_type === 'eligibility');
  const notes = (service.requirements || []).filter((r) => r.req_type === 'note');

  const stepContents = [
    // Step 1: Understand
    <div key="s1" className="space-y-4 animate-fade-in">
      <p className={`text-warm-charcoal text-sm sm:text-base leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
        {description}
      </p>
      {service.processing_time_en && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-warm-muted bg-warm-cream px-4 py-3 rounded-xl border border-warm-border">
          <span className="font-semibold text-warm-charcoal">Processing Time:</span>
          <span>{service.processing_time_en}</span>
        </div>
      )}
      {service.is_verified === 1 && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-forest-800 bg-forest-50 px-4 py-3 rounded-xl border border-forest-200">
          <ShieldCheck className="w-4 h-4 shrink-0 text-forest-700" aria-hidden="true" />
          <span>{t('verifiedInfo')} · {service.verification_note}</span>
        </div>
      )}
    </div>,

    // Step 2: Eligibility
    <div key="s2" className="space-y-4 animate-fade-in">
      {eligibility && (
        <p className={`text-warm-charcoal text-sm sm:text-base leading-relaxed whitespace-pre-line ${lang === 'te' ? 'telugu' : ''}`}>
          {eligibility}
        </p>
      )}
      {eligibilityItems.length > 0 && (
        <ul className="space-y-2.5" aria-label="Eligibility criteria">
          {eligibilityItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-forest-50/50 border border-forest-200/80">
              <CheckCircle2 className="w-4 h-4 text-forest-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className={`text-sm font-semibold text-warm-charcoal ${lang === 'te' ? 'telugu' : ''}`}>
                  {lang === 'te' && item.name_te ? item.name_te : item.name_en}
                </p>
                {item.description_en && (
                  <p className={`text-xs text-warm-muted mt-0.5 ${lang === 'te' ? 'telugu' : ''}`}>
                    {lang === 'te' && item.description_te ? item.description_te : item.description_en}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>,

    // Step 3: Documents
    <div key="s3" className="space-y-4 animate-fade-in">
      {notes.map((note, i) => (
        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-accent-800 bg-accent-50/80 border border-accent-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-accent-600" aria-hidden="true" />
          <p className={lang === 'te' ? 'telugu' : ''}>{note.name_en}</p>
        </div>
      ))}

      {/* Interactive Preparation Progress Bar */}
      {(() => {
        const mandatoryList = docRequirements.filter((d) => d.is_mandatory);
        const mandatoryReady = mandatoryList.filter((d) => checkedDocs[d.name_en]).length;
        const mandatoryTotal = mandatoryList.length;
        const pct = mandatoryTotal > 0 ? Math.round((mandatoryReady / mandatoryTotal) * 100) : 100;
        return (
          <div className="p-3.5 bg-forest-50/70 rounded-xl border border-forest-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-forest-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                {lang === 'te'
                  ? `తప్పనిసరి పత్రాల సంసిద్ధత: ${mandatoryReady} / ${mandatoryTotal} సిద్ధం`
                  : `Mandatory Document Readiness: ${mandatoryReady} of ${mandatoryTotal} Ready`}
              </span>
              <span className="text-forest-800 font-bold">{pct}%</span>
            </div>
            <div className="w-full bg-forest-200/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-forest-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-forest-800/80">
              💡 {lang === 'te'
                ? 'మీరు సమకూర్చుకున్న పత్రాలను గుర్తించడానికి కింద ఉన్న చెక్‌బాక్స్‌లపై క్లిక్ చేయండి (మీ బ్రౌజర్‌లో మాత్రమే భద్రపరచబడుతుంది).'
                : 'Click each checkbox below as you gather your physical documents. Selections are saved locally in your browser.'}
            </p>
          </div>
        );
      })()}

      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-forest-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
            {t('mandatory')}
          </span>
          <span className="flex items-center gap-1.5 text-warm-muted font-medium">
            <Circle className="w-3.5 h-3.5 text-warm-subtle" aria-hidden="true" />
            {t('conditional')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-warm-charcoal hover:text-warm-dark px-3 py-1.5 rounded-lg bg-warm-cream hover:bg-warm-borderLight border border-warm-border transition-colors focus-visible:outline-forest-700 shadow-subtle"
            aria-label="Print document checklist"
            title="Print or save as PDF for Xerox / MeeSeva visit"
          >
            <Printer className="w-3.5 h-3.5 text-warm-muted" />
            <span>{lang === 'te' ? 'ప్రింట్ చెక్‌లిస్ట్' : 'Print Checklist'}</span>
          </button>
          <button
            onClick={handleCopyChecklist}
            className="flex items-center gap-1.5 text-xs text-forest-800 hover:text-forest-900 px-3 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 border border-forest-200 transition-colors focus-visible:outline-forest-700 shadow-subtle"
            aria-label={t('copyChecklist')}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-forest-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span className={lang === 'te' ? 'telugu' : ''}>{copied ? t('copied') : t('copyChecklist')}</span>
          </button>
        </div>
      </div>

      <ul className="space-y-2.5" aria-label="Required documents">
        {docRequirements.map((doc, i) => {
          const isChecked = !!checkedDocs[doc.name_en];
          return (
            <li
              key={i}
              onClick={() => toggleDoc(doc.name_en)}
              className={`cursor-pointer transition-all ${
                doc.is_mandatory ? 'doc-item-mandatory' : 'doc-item-optional'
              } ${isChecked ? 'ring-2 ring-forest-600/40 bg-forest-50/50' : ''}`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDoc(doc.name_en);
                }}
                className="mt-0.5 shrink-0 focus-visible:outline-forest-700"
                aria-label={`Toggle preparation status for ${doc.name_en}`}
                aria-pressed={isChecked}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-forest-700" aria-hidden="true" />
                ) : (
                  <Square className="w-5 h-5 text-warm-muted hover:text-forest-700" aria-hidden="true" />
                )}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-semibold flex items-center justify-between ${doc.is_mandatory ? 'text-warm-dark' : 'text-warm-charcoal'} ${lang === 'te' ? 'telugu' : ''}`}>
                  <span>
                    {lang === 'te' && doc.name_te ? doc.name_te : doc.name_en}
                    {!doc.is_mandatory && (
                      <span className="ml-2 badge badge-slate text-[11px]">{t('conditional')}</span>
                    )}
                  </span>
                  {isChecked && (
                    <span className="text-[11px] font-bold text-forest-700 bg-forest-100/80 px-2 py-0.5 rounded-full">
                      ✓ {lang === 'te' ? 'సిద్ధం' : 'Ready'}
                    </span>
                  )}
                </p>
                {doc.description_en && (
                  <p className={`text-xs text-warm-muted mt-0.5 leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
                    {lang === 'te' && doc.description_te ? doc.description_te : doc.description_en}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>,

    // Step 4: Procedure
    <div key="s4" className="space-y-4 animate-fade-in">
      {fee && (
        <div className="flex items-center gap-2 p-3.5 bg-accent-50/70 border border-accent-200 rounded-xl text-xs sm:text-sm">
          <span className="font-bold text-accent-900">{t('fee')}:</span>
          <span className={`text-accent-800 ${lang === 'te' ? 'telugu' : ''}`}>{fee}</span>
        </div>
      )}
      <div className={`text-warm-charcoal text-sm leading-relaxed whitespace-pre-line bg-warm-cream/50 p-4 rounded-xl border border-warm-border ${lang === 'te' ? 'telugu' : ''}`}>
        {procedure || 'Visit the official MeeSeva portal or nearest MeeSeva centre.'}
      </div>
    </div>,

    // Step 5: Apply, Track & Grievances
    <div key="s5" className="space-y-5 animate-fade-in">
      {/* 1. Official Application Destination */}
      <div className="p-4 bg-warm-card rounded-xl border border-warm-border space-y-3">
        <p className="text-warm-charcoal text-xs sm:text-sm leading-relaxed">
          {lang === 'te'
            ? 'మీరు దరఖాస్తు చేసుకోవడానికి సిద్ధంగా ఉన్నారు. సంబంధిత అధికారిక ప్రభుత్వ పోర్టల్‌లో దరఖాస్తును ప్రారంభించడానికి కింద ఉన్న బటన్‌ను క్లిక్ చేయండి:'
            : 'You are ready to apply. Click the verified official portal button below to start your application on the department’s platform:'}
        </p>
        {service.official_url && (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={service.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="official-link-btn text-sm py-3 px-5 w-full sm:w-auto justify-center rounded-xl shadow-card"
              id="apply-official-link"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span className={lang === 'te' ? 'telugu' : ''}>
                {lang === 'te' && service.portal_label_te
                  ? service.portal_label_te
                  : (service.portal_label_en || `${t('applyNow')} — ${t('officialSite')}`)}
              </span>
            </a>
            {service.alternate_url && (
              <a
                href={service.alternate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-3 px-4 inline-flex items-center gap-1.5 rounded-xl shadow-subtle"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span>General MeeSeva Portal</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* 2. Official Application Status Tracking Guidance */}
      <div className="p-4 bg-warm-cream/60 rounded-xl border border-warm-border space-y-2.5">
        <h4 className="text-xs font-bold text-warm-dark uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-forest-700" />
          {lang === 'te' ? 'దరఖాస్తు స్థితి పరిశీలన (Application Status Tracking):' : 'Application Status Verification:'}
        </h4>
        <p className="text-xs text-warm-charcoal leading-relaxed">
          {lang === 'te'
            ? 'మీసేవ మిత్ర AI గోప్యమైన ప్రభుత్వ డేటాబేస్‌ను నిల్వ చేయదు. మీ రసీదులోని దరఖాస్తు సంఖ్యతో అధికారిక పోర్టల్‌లో నేరుగా లైవ్ స్థితిని తెలుసుకోండి.'
            : 'MeeSeva Mitra AI does not store or access confidential state applicant databases. You can verify live application status directly on the official portal using your Application / Acknowledgement Number.'}
        </p>
        {service.official_url && (
          <a
            href={service.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-900 underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {lang === 'te' ? 'అధికారిక ట్రాకింగ్ పోర్టల్‌ను తెరవండి' : 'Check Status on Official Portal'}
          </a>
        )}
      </div>

      {/* 3. Verified Grievance Redressal & Helplines */}
      <div className="p-4 bg-warm-cream/60 rounded-xl border border-warm-border space-y-2.5">
        <h4 className="text-xs font-bold text-warm-dark uppercase tracking-wider flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4 text-accent-700" />
          {lang === 'te' ? 'సమస్యలు & అధికారిక ఫిర్యాదుల మార్గాలు (Grievance Redressal):' : 'Official Helpdesk & Grievance Channels:'}
        </h4>
        <ul className="text-xs text-warm-charcoal space-y-1.5">
          <li>• <strong>Prajavani (ప్రజావాణి):</strong> Public Grievance Portal — <a href="https://prajavani.telangana.gov.in/" target="_blank" rel="noopener noreferrer" className="text-forest-800 underline font-medium">prajavani.telangana.gov.in</a></li>
          <li>• <strong>MeeSeva Helpline:</strong> 1100 / 1800-425-1110 (Toll-Free, 8 AM – 8 PM)</li>
          {service.slug === 'ration-card' && (
            <li>• <strong>Civil Supplies (EPDS):</strong> Toll-Free 1967 / 1800-425-00339</li>
          )}
          {service.slug === 'birth-certificate' && (
            <li>• <strong>GHMC / CDMA Call Center:</strong> 040-21111111</li>
          )}
        </ul>
      </div>

      {/* 4. Application Rejection Assistant Trigger */}
      <div className="p-4 bg-accent-50/70 rounded-xl border border-accent-200/80 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-xs font-bold text-accent-900">
            {lang === 'te' ? 'మీ దరఖాస్తు తిరస్కరించబడిందా?' : 'Was your application rejected or delayed?'}
          </h4>
          <p className="text-xs text-accent-800/80 mt-0.5">
            {lang === 'te'
              ? 'తిరస్కరణ కారణాన్ని విశ్లేషించి, పరిష్కార చర్యలు మరియు తదుపరి అడుగులను పొందండి.'
              : 'Analyze officer remarks and get verified procedural next steps.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRejectionModal(true)}
          className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 bg-accent-700 hover:bg-accent-800 shadow-subtle text-white"
          id="open-rejection-helper-btn"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{lang === 'te' ? 'తిరస్కరణ కారణం పరిశీలించండి' : 'Get Rejection Guidance'}</span>
        </button>
      </div>

      {/* Sources */}
      {service.sources && service.sources.length > 0 && (
        <div className="pt-2 border-t border-warm-borderLight">
          <h3 className="text-xs font-bold text-warm-muted uppercase tracking-wider mb-2">
            {t('sourcesTitle')}
          </h3>
          <ul className="space-y-1.5">
            {service.sources.map((src, i) => (
              <li key={i}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-forest-800 hover:text-forest-900 font-medium hover:underline"
                >
                  <ExternalLink className="w-3 h-3 shrink-0 text-forest-700" aria-hidden="true" />
                  {src.title}
                  {src.verified_at && (
                    <span className="text-warm-muted">· {t('lastVerified')}: {src.verified_at}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>,
  ];

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-warm-muted hover:text-warm-dark mb-5 transition-colors focus-visible:outline-forest-700 rounded-lg py-1 px-1 -ml-1"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span className={lang === 'te' ? 'telugu' : ''}>{t('back')}</span>
      </button>

      {/* Header Card */}
      <div className="card mb-6 bg-white border border-warm-border shadow-card">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge-forest">{service.category}</span>
              {service.is_verified === 1 && (
                <span className="badge badge-forest gap-1">
                  <ShieldCheck className="w-3 h-3 text-forest-700" aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold text-warm-dark mb-1 tracking-tight ${lang === 'te' ? 'telugu' : ''}`}>
              {name}
            </h1>
            {lang === 'en' && service.name_te && (
              <p className="telugu text-warm-muted text-sm font-medium">{service.name_te}</p>
            )}
            <p className={`text-warm-muted text-xs sm:text-sm mt-1.5 font-medium ${lang === 'te' ? 'telugu' : ''}`}>
              {t('department')}: <span className="text-warm-dark font-semibold">{dept}</span>
            </p>
          </div>
          {service.official_url && (
            <a
              href={service.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary shrink-0 hidden sm:flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg shadow-subtle"
              aria-label={service.portal_label_en || "Open official portal"}
              title={service.portal_label_en}
            >
              <ExternalLink className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
              <span>
                {lang === 'te' && service.portal_label_te
                  ? service.portal_label_te
                  : (service.portal_label_en || t('officialSite'))}
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Step-by-step journey card */}
      <div className="card bg-white border border-warm-border shadow-card">
        {/* Step tabs */}
        <nav
          className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2 border-b border-warm-borderLight"
          aria-label="Service journey steps"
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const stepLabels = [t('step1'), t('step2'), t('step3'), t('step4'), t('step5')];
            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-forest-700 ${
                  activeStep === i
                    ? 'bg-forest-800 text-white shadow-subtle'
                    : i < activeStep
                    ? 'bg-forest-50 text-forest-800 border border-forest-200'
                    : 'bg-warm-cream text-warm-muted border border-warm-border hover:bg-warm-borderLight'
                }`}
                aria-current={activeStep === i ? 'step' : undefined}
                id={`step-${i + 1}-btn`}
              >
                <div
                  className={`step-indicator w-5 h-5 text-xs ${
                    activeStep === i
                      ? 'bg-white/20 text-white'
                      : i < activeStep
                      ? 'bg-forest-600 text-white'
                      : 'bg-warm-border text-warm-muted'
                  }`}
                >
                  {i < activeStep ? (
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Icon className="w-3 h-3" aria-hidden="true" />
                  )}
                </div>
                <span className={lang === 'te' ? 'telugu' : ''}>{stepLabels[i]}</span>
              </button>
            );
          })}
        </nav>

        {/* Step heading */}
        <h2 className={`text-base sm:text-lg font-bold text-warm-dark mb-4 ${lang === 'te' ? 'telugu' : ''}`}>
          Step {activeStep + 1}: {[t('step1'), t('step2'), t('step3'), t('step4'), t('step5')][activeStep]}
        </h2>

        {/* Step content */}
        <div>{stepContents[activeStep]}</div>

        {/* Stepper Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-warm-borderLight">
          <button
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            className="btn-ghost disabled:opacity-30 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Previous Step
          </button>
          {activeStep < STEPS.length - 1 ? (
            <button
              onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="btn-primary text-xs sm:text-sm"
              id="step-next-btn"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </button>
          ) : (
            service.official_url && (
              <a
                href={service.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="official-link-btn text-xs sm:text-sm"
                id="final-apply-btn"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                <span>{t('applyNow')}</span>
              </a>
            )
          )}
        </div>
      </div>

      {/* Citizen Helpfulness Feedback */}
      <div className="card mt-6 flex items-center justify-between gap-4 flex-wrap bg-white border border-warm-border shadow-subtle">
        <p className={`text-xs sm:text-sm text-warm-charcoal font-semibold ${lang === 'te' ? 'telugu' : ''}`}>
          {feedbackSent ? t('feedbackThanks') : t('wasHelpful')}
        </p>
        {!feedbackSent && (
          <div className="flex gap-2">
            <button
              onClick={() => handleFeedback(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200 transition-colors shadow-subtle"
              id="feedback-helpful-btn"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
              <span className={lang === 'te' ? 'telugu' : ''}>{t('yes')}</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-accent-800 bg-accent-50 hover:bg-accent-100 border border-accent-200 transition-colors shadow-subtle"
              id="feedback-not-helpful-btn"
            >
              <ThumbsDown className="w-3.5 h-3.5 text-accent-700" aria-hidden="true" />
              <span className={lang === 'te' ? 'telugu' : ''}>{t('no')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Rejection Guidance Modal */}
      <RejectionGuidanceModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        serviceSlug={service.slug}
        serviceName={lang === 'te' && service.name_te ? service.name_te : service.name_en}
      />
    </main>
  );
}
