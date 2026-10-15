// MeeSeva Mitra AI — Application Error & Rejection Guidance Modal
import { useState } from 'react';
import {
  AlertTriangle, ShieldCheck, CheckCircle2, ExternalLink,
  X, ArrowRight, RefreshCw, Lock
} from 'lucide-react';
import { fetchRejectionGuidance } from '../api';
import type { RejectionGuidanceResponse } from '../types';
import { useLang } from '../lang';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serviceSlug?: string;
  serviceName?: string;
}

export default function RejectionGuidanceModal({
  isOpen,
  onClose,
  serviceSlug,
  serviceName,
}: Props) {
  const { lang } = useLang();
  const [errorInput, setErrorInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RejectionGuidanceResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || errorInput).trim();
    if (!text || text.length < 3) return;

    setLoading(true);
    setApiError(null);
    try {
      const data = await fetchRejectionGuidance(text, serviceSlug, lang);
      setResult(data);
    } catch (err: any) {
      console.error('[RejectionGuidanceModal] error:', err);
      setApiError(
        lang === 'te'
          ? 'క్షమించండి, సర్వర్ అందుబాటులో లేదు. దయచేసి కాసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.'
          : 'Could not connect to guidance service. Please try again or visit Prajavani.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (presetText: string) => {
    setErrorInput(presetText);
    handleAnalyze(presetText);
  };

  const resetAnalysis = () => {
    setErrorInput('');
    setResult(null);
    setApiError(null);
  };

  const presets = lang === 'te' ? [
    { label: 'ఆధార్ పేరు సరిపోలడం లేదు', query: 'ఆధార్ పేరు స్కూల్ రికార్డులతో సరిపోలడం లేదు' },
    { label: 'ఆదాయ పరిమితి / ఫారం 16 లోపం', query: 'ఆదాయ ధృవీకరణ దరఖాస్తు తహసీల్దార్ ద్వారా తిరస్కరించబడింది, పే స్లిప్ లేదు' },
    { label: 'తండ్రి కుల రికార్డులు లేవు', query: 'కుల ధృవీకరణ పత్రం తిరస్కరణ, తండ్రి లేదా తోబుట్టువుల రికార్డులు లేవు' },
    { label: 'జనన రికార్డు మున్సిపాలిటీలో లేదు', query: 'జనన రికార్డు పోర్టల్‌లో కనుగొనబడలేదు, ఆలస్య నమోదు' },
    { label: 'సభ్యుడు ఇప్పటికే వేరే రేషన్ కార్డులో ఉన్నారు', query: 'సభ్యుని ఆధార్ ఇప్పటికే వేరే రేషన్ కార్డులో నమోదై ఉంది' }
  ] : [
    { label: 'Aadhaar Demographic Mismatch', query: 'Application rejected due to Aadhaar name or DOB mismatch' },
    { label: 'Income Limit / Missing Payslip', query: 'Income certificate rejected, salary slip or ITR was missing' },
    { label: 'Caste Lineage Proof Missing', query: 'Caste certificate rejected due to lack of father caste proof' },
    { label: 'Birth Record Not Found / Late', query: 'Birth record not found in municipality, birth was over 1 year ago' },
    { label: 'Ration Card Duplicate Member', query: 'Aadhaar already mapped to another active Food Security Card' }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rejection-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-warm-border p-6 sm:p-7 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-warm-borderLight pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="rejection-modal-title" className="text-lg font-bold text-warm-dark font-display">
                {lang === 'te' ? 'దరఖాస్తు తిరస్కరణ & సమస్య పరిష్కార సహాయకుడు' : 'Application Error & Rejection Guidance'}
              </h2>
              <p className="text-xs text-warm-muted">
                {serviceName
                  ? `${lang === 'te' ? 'సేవ' : 'Service'}: ${serviceName}`
                  : (lang === 'te' ? 'తెలంగాణ ప్రభుత్వ సేవల తిరస్కరణ కారణాల వివరణ' : 'Procedural explanations & next steps for Telangana citizen services')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-muted hover:text-warm-dark hover:bg-warm-cream transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Shield Banner */}
        <div className="flex items-center gap-2.5 p-3 bg-forest-50/80 rounded-xl border border-forest-200 text-forest-900 text-xs">
          <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="font-semibold">{lang === 'te' ? 'గోప్యతా రక్షణ:' : 'Privacy Protection:'}</strong>{' '}
            {lang === 'te'
              ? 'ఆధార్ నంబర్లు లేదా OTPల వంటి రహస్య వివరాలు ఆటోమేటిక్‌గా తొలగించబడతాయి. సున్నితమైన సమాచారం సర్వర్‌లో భద్రపరచబడదు.'
              : 'Sensitive numbers like 12-digit Aadhaar or OTPs are automatically redacted before analysis.'}
          </p>
        </div>

        {!result ? (
          <div className="space-y-4">
            {/* Input Form */}
            <div className="space-y-2">
              <label htmlFor="error-input" className="block text-xs font-bold text-warm-dark uppercase tracking-wider">
                {lang === 'te'
                  ? 'మీ దరఖాస్తు రసీదులోని తిరస్కరణ కారణం లేదా సమస్యను వివరించండి:'
                  : 'Describe your application error or paste officer remarks:'}
              </label>
              <textarea
                id="error-input"
                rows={3}
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
                placeholder={
                  lang === 'te'
                    ? 'ఉదా: ఆధార్ పేరు మరియు సర్టిఫికెట్లలో పేరు సరిపోలడం లేదు అని తిరస్కరించారు...'
                    : 'e.g. Application rejected: Aadhaar demographic mismatch with secondary school record...'
                }
                className="w-full p-3.5 bg-warm-cream/40 border border-warm-border rounded-xl text-warm-dark text-sm placeholder:text-warm-muted/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-forest-700/30 focus:border-forest-700 transition-all"
              />
            </div>

            {/* Common issue presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-warm-muted">
                {lang === 'te' ? 'సాధారణ సమస్యలు (ఎంచుకోవడానికి క్లిక్ చేయండి):' : 'Or select a common issue:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePreset(p.query)}
                    className="text-xs py-1.5 px-3 rounded-lg bg-warm-cream hover:bg-forest-50 text-warm-charcoal hover:text-forest-900 border border-warm-border transition-colors text-left"
                  >
                    • {p.label}
                  </button>
                ))}
              </div>
            </div>

            {apiError && (
              <p className="text-xs text-rose-700 font-medium p-2 bg-rose-50 rounded-lg border border-rose-200">
                {apiError}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost py-2.5 px-4 text-xs font-medium"
              >
                {lang === 'te' ? 'రద్దు' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={loading || errorInput.trim().length < 3}
                className="btn-primary py-2.5 px-5 text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'te' ? 'విశ్లేషిస్తోంది...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'te' ? 'సమస్యను విశ్లేషించండి' : 'Analyze Rejection'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results view */
          <div className="space-y-4 animate-fade-in">
            {/* Title & Privacy badge */}
            <div className="p-4 bg-warm-cream/60 rounded-xl border border-warm-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge badge-accent text-[11px] font-bold">
                  {result.rule_id}
                </span>
                {result.had_privacy_redaction && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-forest-700 bg-forest-100/70 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    {lang === 'te' ? 'గోప్యతా నంబర్లు తొలగించబడ్డాయి' : 'Sensitive numbers redacted'}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-warm-dark font-display">
                {result.title}
              </h3>
              <p className="text-xs text-warm-charcoal leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {/* Actionable Next Steps */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-warm-dark uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                {lang === 'te' ? 'అధికారిక పరిష్కార మార్గాలు (పరిష్కార చర్యలు):' : 'Recommended Next Steps:'}
              </h4>
              <ul className="space-y-2">
                {result.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-forest-50/50 border border-forest-200/60 text-xs sm:text-sm text-warm-charcoal"
                  >
                    <span className="w-5 h-5 rounded-full bg-forest-200 text-forest-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Escalation & Portal Link */}
            <div className="p-4 bg-warm-card rounded-xl border border-warm-border space-y-3">
              <div className="text-xs">
                <span className="font-bold text-warm-muted uppercase tracking-wider">
                  {lang === 'te' ? 'అధికారిక ఫిర్యాదు & సంప్రదింపు కేంద్రం:' : 'Official Helpdesk / Grievance Route:'}
                </span>
                <p className="font-semibold text-warm-dark mt-0.5">{result.escalation_channel}</p>
              </div>

              {result.official_url && (
                <a
                  href={result.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="official-link-btn text-xs py-2.5 px-4 w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'te' ? 'అధికారిక పోర్టల్ లేదా ఫిర్యాదు ఛానల్ తెరవండి' : 'Open Official Portal / Help Channel'}
                  </span>
                </a>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-warm-muted italic leading-relaxed border-t border-warm-borderLight pt-3">
              {result.disclaimer}
            </p>

            {/* Reset / Done */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetAnalysis}
                className="text-xs text-forest-800 hover:text-forest-900 hover:underline font-medium inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {lang === 'te' ? 'మరొక సమస్యను విశ్లేషించండి' : 'Check another error reason'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary py-2 px-5 text-xs font-semibold"
              >
                {lang === 'te' ? 'ముగించు' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
