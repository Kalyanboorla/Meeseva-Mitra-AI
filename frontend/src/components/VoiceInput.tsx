// MeeSeva Mitra AI — Accessible Voice Input (Speech-to-Text) Component
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AlertCircle, Check, Globe, Radio } from 'lucide-react';
import { useLang } from '../lang';

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  idPrefix?: string;
}

export default function VoiceInput({
  onTranscript,
  idPrefix = 'voice',
}: VoiceInputProps) {
  const { t, lang: appLang } = useLang();

  // Speech language preference: te-IN for Telugu, en-IN for Indian English
  const [speechLang, setSpeechLang] = useState<'te-IN' | 'en-IN'>(() => {
    return appLang === 'te' ? 'te-IN' : 'en-IN';
  });

  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Sync speech language when app language changes if user hasn't explicitly set it
  useEffect(() => {
    setSpeechLang(appLang === 'te' ? 'te-IN' : 'en-IN');
  }, [appLang]);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore already stopped
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    setInterimText('');

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMessage(t('voiceNotSupported'));
      setShowModal(true);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setShowModal(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        setInterimText(currentText);

        if (final.trim()) {
          onTranscript(final.trim());
          setIsListening(false);
          // Keep modal open briefly to show success, then close
          setTimeout(() => {
            setShowModal(false);
            setInterimText('');
          }, 800);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[VoiceInput] Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage(t('voicePermissionDenied'));
        } else if (event.error === 'no-speech') {
          setErrorMessage(t('voiceNoSpeech'));
        } else if (event.error === 'network') {
          setErrorMessage(t('errorNetwork'));
        } else {
          setErrorMessage(`Speech recognition error (${event.error}). Please try again or type.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[VoiceInput] Failed to start recognition:', err);
      setIsListening(false);
      setErrorMessage(t('voiceNotSupported'));
      setShowModal(true);
    }
  }, [speechLang, onTranscript, t]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleApplyCurrent = () => {
    if (interimText.trim()) {
      onTranscript(interimText.trim());
    }
    stopListening();
    setShowModal(false);
    setInterimText('');
  };

  const handleCancel = () => {
    stopListening();
    setShowModal(false);
    setInterimText('');
    setErrorMessage(null);
  };

  const toggleLanguage = () => {
    const nextLang = speechLang === 'te-IN' ? 'en-IN' : 'te-IN';
    setSpeechLang(nextLang);
    if (isListening) {
      stopListening();
      // Restart with new language after tiny pause
      setTimeout(() => {
        startListening();
      }, 200);
    }
  };

  return (
    <>
      {/* Microphone Trigger Button */}
      <button
        type="button"
        id={`${idPrefix}-mic-btn`}
        onClick={handleToggle}
        className={`relative inline-flex items-center justify-center rounded-xl p-2.5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isListening
            ? 'bg-rose-600 text-white shadow-md shadow-rose-200 animate-pulse focus-visible:outline-rose-600'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 focus-visible:outline-primary-600'
        }`}
        title={isListening ? t('voiceListening') : t('voiceSpeak')}
        aria-label={isListening ? t('voiceListening') : t('voiceSpeak')}
        aria-pressed={isListening}
      >
        {isListening ? (
          <>
            <Radio className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
            <span className="sr-only">{t('voiceListening')}</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">{t('voiceSpeak')}</span>
          </>
        )}
      </button>

      {/* Voice Status & Modal Overlay */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${idPrefix}-voice-title`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-in">
            {/* Header with Title and Language Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-primary-100 text-primary-700'
                  }`}
                >
                  <Mic className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id={`${idPrefix}-voice-title`} className="text-base font-semibold text-slate-900">
                    {t('voiceSpeak')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isListening ? t('voiceListening') : isSupported ? 'Ready' : 'Not Supported'}
                  </p>
                </div>
              </div>

              {/* Language Switcher Badge */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors focus-visible:outline-primary-600"
                title={`${t('voiceLanguage')}: ${speechLang === 'te-IN' ? 'Telugu' : 'English'}`}
                aria-label={`Switch speech language. Currently ${speechLang === 'te-IN' ? 'Telugu' : 'English'}`}
              >
                <Globe className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                <span>{speechLang === 'te-IN' ? 'తెలుగు (te-IN)' : 'English (en-IN)'}</span>
              </button>
            </div>

            {/* Error State */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-xs">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Listening Soundwave / Live Transcription Area */}
            {isListening && (
              <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                {/* Animated wave bars */}
                <div className="flex items-center gap-1.5 h-8">
                  <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:0s]" />
                  <span className="w-1.5 h-7 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.4s]" />
                </div>
                <p className="text-xs text-slate-500 font-medium animate-pulse">
                  {speechLang === 'te-IN'
                    ? 'స్పష్టంగా మాట్లాడండి (e.g. ఆదాయ సర్టిఫికెట్ కోసం ఏ పత్రాలు కావాలి)...'
                    : 'Speak clearly (e.g. which documents are needed for caste certificate)...'}
                </p>
              </div>
            )}

            {/* Live recognized transcript preview */}
            {interimText && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {t('voiceProcessing')}:
                </label>
                <div className="p-3 bg-slate-100 rounded-xl text-slate-800 text-sm font-medium border border-slate-200 max-h-28 overflow-y-auto">
                  {interimText}
                </div>
              </div>
            )}

            {/* Privacy notice */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              🔒 {t('voicePrivacyNotice')}
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('voiceCancel')}
              </button>

              {interimText && (
                <button
                  type="button"
                  onClick={handleApplyCurrent}
                  className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  {t('voiceApplyText')}
                </button>
              )}

              {isListening && (
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
