// MeeSeva Mitra AI — AI Assistant page (Redesigned Civic-Tech Layout)
import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import RejectionGuidanceModal from '../components/RejectionGuidanceModal';
import { useLang } from '../lang';
import { AlertCircle, Bot, Shield, Sparkles, AlertTriangle } from 'lucide-react';

export default function AssistantPage() {
  const { t, lang } = useLang();
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-800 text-white flex items-center justify-center shrink-0 shadow-subtle">
            <Bot className="w-6 h-6 text-emerald-200" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl sm:text-3xl font-extrabold text-warm-dark tracking-tight ${lang === 'te' ? 'telugu' : ''}`}>
                {t('chatTitle')}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200">
                <Sparkles className="w-3 h-3 text-forest-600" />
                Bilingual RAG
              </span>
            </div>
            <p className={`text-warm-muted text-sm mt-1 ${lang === 'te' ? 'telugu' : ''}`}>
              {t('chatSubtitle')}
            </p>
          </div>
        </div>

        {/* Quick Action: Application Rejection Helper */}
        <button
          type="button"
          onClick={() => setShowRejectionModal(true)}
          className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 rounded-xl border border-accent-300 text-accent-900 bg-accent-50/80 hover:bg-accent-100 shadow-subtle"
          id="assistant-rejection-btn"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-accent-700" />
          <span>{lang === 'te' ? 'దరఖాస్తు తిరస్కరణ సహాయకుడు' : 'Application Rejection Helper'}</span>
        </button>
      </div>

      {/* Grounding & Non-Government Disclaimer Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-50/70 border border-accent-200/80 mb-6 shadow-subtle">
        <AlertCircle className="w-4 h-4 text-accent-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs">
          <p className="font-bold text-accent-900 mb-0.5">Civic Prototype Guidance Disclaimer</p>
          <p className={`text-accent-800/90 leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
            {lang === 'te'
              ? 'ఇది పౌరులకు మార్గదర్శనం చేసే AI ప్రోటోటైప్. ఇది ప్రభుత్వం కాదు మరియు దరఖాస్తులను నేరుగా స్వీకరించదు. అన్ని వివరాలను అధికారిక శాఖాపరమైన పోర్టల్‌లో ధృవీకరించండి.'
              : 'This is an independent citizen-guidance prototype. It cannot directly submit government applications or issue certificates. Always verify requirements on official department portals.'}
          </p>
        </div>
      </div>

      {/* Chat interface container */}
      <div className="h-[620px] sm:h-[680px]">
        <ChatInterface />
      </div>

      {/* Privacy note */}
      <div className="flex items-center gap-2 mt-4 text-xs text-warm-subtle justify-center">
        <Shield className="w-3.5 h-3.5" aria-hidden="true" />
        <span>
          {lang === 'te'
            ? 'సెషన్ డేటా బ్రౌజర్‌లో మాత్రమే ఉంటుంది. ఆధార్ నంబర్ వంటి సున్నితమైన వ్యక్తిగత వివరాలను నమోదు చేయవద్దు.'
            : 'Conversations are stored locally in browser session memory. Do not submit sensitive identity numbers or OTPs.'}
        </span>
      </div>

      {/* Rejection Guidance Modal */}
      <RejectionGuidanceModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
      />
    </main>
  );
}
