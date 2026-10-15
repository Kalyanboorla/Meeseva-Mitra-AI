// MeeSeva Mitra AI — Chat interface component (Redesigned Civic-Tech Chat)
import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, RefreshCcw, Bot, User, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { sendMessage } from '../api';
import type { ChatMessage } from '../types';
import { useLang } from '../lang';
import { Link } from 'react-router-dom';
import VoiceInput from './VoiceInput';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-forest-100 border border-forest-200 flex items-center justify-center shrink-0 shadow-subtle">
        <Bot className="w-4 h-4 text-forest-800" aria-hidden="true" />
      </div>
      <div className="chat-bubble-bot flex items-center gap-1.5 py-3.5 px-4 bg-white border border-warm-border shadow-card">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function ChatBubble({ msg, lang }: { msg: ChatMessage; lang: string }) {
  const isUser = msg.role === 'user';

  const formatContent = (text: string) => {
    // Escape raw HTML entities to prevent XSS
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-forest-700 underline font-semibold hover:text-forest-900 break-all">$1</a>'
      )
      .replace(/\n/g, '<br/>');
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="flex items-end gap-2 max-w-sm sm:max-w-md">
          <div className={`chat-bubble-user ${lang === 'te' ? 'telugu' : ''}`}>
            {msg.content}
          </div>
          <div className="w-8 h-8 rounded-xl bg-forest-800 flex items-center justify-center shrink-0 text-white shadow-subtle">
            <User className="w-4 h-4 text-emerald-100" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 animate-slide-up">
      <div className="w-8 h-8 rounded-xl bg-forest-100 border border-forest-200 flex items-center justify-center shrink-0 shadow-subtle">
        <Bot className="w-4 h-4 text-forest-800" aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-2 max-w-xl">
        <div
          className={`chat-bubble-bot chat-content ${lang === 'te' ? 'telugu' : ''}`}
          dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
        />

        {/* Source services & verified specific portal links */}
        {msg.source_services && msg.source_services.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-1 pt-1">
            {msg.source_services.map((svc) => (
              <div key={svc.slug} className="flex flex-wrap items-center gap-1.5">
                <Link
                  to={`/services/${svc.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-forest-800 bg-forest-50 border border-forest-200 px-3 py-1 rounded-full hover:bg-forest-100 transition-colors font-medium shadow-subtle"
                >
                  📖 {lang === 'te' && svc.name_te ? svc.name_te : svc.name_en}
                </Link>
                {svc.official_url && (
                  <a
                    href={svc.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-forest-900 bg-white border border-warm-border px-3 py-1 rounded-full hover:bg-forest-50 hover:border-forest-300 transition-colors font-medium shadow-subtle"
                    title={svc.portal_label_en || 'Open Official Service Portal'}
                  >
                    <ExternalLink className="w-3 h-3 text-forest-700" aria-hidden="true" />
                    {lang === 'te' && svc.portal_label_te
                      ? svc.portal_label_te
                      : (svc.portal_label_en || 'Open Official Portal')}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        {msg.disclaimer && (
          <div className="flex items-start gap-2 text-xs text-accent-800 bg-accent-50/70 border border-accent-200/80 rounded-xl px-3.5 py-2.5">
            <AlertCircle className="w-4 h-4 text-accent-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span className={lang === 'te' ? 'telugu' : ''}>{msg.disclaimer}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('mm_session_id');
    if (stored) return stored;
    const id = uuidv4();
    sessionStorage.setItem('mm_session_id', id);
    return id;
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const welcomeMsg: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: t('chatWelcome'),
    timestamp: new Date(),
  };

  useEffect(() => {
    setMessages([welcomeMsg]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const historyForAPI = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-5)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendMessage(content, lang, sessionId, historyForAPI);

      const botMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: res.answer,
        source_services: res.source_services,
        ai_used: res.ai_used,
        disclaimer: res.disclaimer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t('errorGeneric');
      setError(errMsg.includes('Network') ? t('errorNetwork') : t('errorGeneric'));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, lang, sessionId, messages, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    setMessages([welcomeMsg]);
    setError(null);
    setInput('');
    inputRef.current?.focus();
  };

  // Diverse examples across English, Telugu script, and Romanized Telugish
  const examples = [
    { label: 'English: Income Documents', text: 'What documents are required for an income certificate?' },
    { label: 'తెలుగు: కుల ధృవీకరణ', text: 'కుల ధృవీకరణ పత్రం (Caste Certificate) కోసం ఏ పత్రాలు కావాలి?' },
    { label: 'Telugish: Ration Card', text: 'ration card kosam ekkada apply cheyyali?' },
    { label: 'Telugish: Fee Query', text: 'income certificate ki entha fee?' },
    { label: 'Telugish: Birth Certificate', text: 'ma intlo birth certificate ledu, ippudu em cheyyali?' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-warm-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-forest-800 text-white shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-700 border border-forest-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-200" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-base leading-tight ${lang === 'te' ? 'telugu' : ''}`}>
                {t('chatTitle')}
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-forest-700/80 text-emerald-200 border border-forest-600">
                Grounded
              </span>
            </div>
            <p className={`text-emerald-100/70 text-xs mt-0.5 ${lang === 'te' ? 'telugu' : ''}`}>
              {t('chatSubtitle')} · English, తెలుగు &amp; Telugish
            </p>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 text-xs text-emerald-100 hover:text-white px-3 py-1.5 rounded-lg bg-forest-700/60 hover:bg-forest-700 transition-colors focus-visible:outline-white"
          aria-label={t('chatRestart')}
          id="chat-restart-btn"
        >
          <RefreshCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span className={lang === 'te' ? 'telugu' : ''}>{t('chatRestart')}</span>
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0 bg-warm-ivory/50"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} lang={lang} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div
            className="flex items-start gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl p-3.5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Trilingual Example Prompts */}
      {messages.length <= 1 && (
        <div className="px-5 pt-3 pb-2 bg-warm-ivory border-t border-warm-borderLight space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-warm-charcoal">
            <Sparkles className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
            <span className={lang === 'te' ? 'telugu' : ''}>
              {lang === 'te' ? 'ఉదాహరణ ప్రశ్నలు (తెలుగు, ఇంగ్లీష్ లేదా Telugish):' : 'Suggested questions (English, Telugu, or Telugish):'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex.text}
                onClick={() => handleSend(ex.text)}
                className={`text-xs px-3 py-1.5 rounded-lg border border-warm-border bg-white text-warm-charcoal hover:border-forest-300 hover:text-forest-800 hover:bg-forest-50 transition-colors shadow-subtle text-left ${
                  lang === 'te' ? 'telugu' : ''
                }`}
                title={ex.text}
              >
                {ex.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-warm-border p-4 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === 'te' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా మైక్ వాడండి (English, తెలుగు, Telugish)...' : 'Type your question or click mic (English, Telugu, or Telugish)...'}
            rows={1}
            className={`flex-1 resize-none px-4 py-3 rounded-xl border border-warm-border bg-warm-ivory text-sm text-warm-charcoal placeholder-warm-subtle focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 focus:bg-white transition-all shadow-subtle ${
              lang === 'te' ? 'telugu' : ''
            }`}
            aria-label={t('chatInput')}
            aria-multiline="true"
            maxLength={500}
          />
          <VoiceInput
            idPrefix="chat"
            onTranscript={(transcript) => {
              setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
              inputRef.current?.focus();
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || input.trim().length < 2}
            className="btn-primary py-3 px-4 shrink-0 self-end rounded-xl shadow-subtle"
            aria-label={t('chatSend')}
            id="chat-send-btn"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-[11px] text-warm-muted mt-2 text-center">
          {lang === 'te' ? 'పంపడానికి Enter నొక్కండి · కొత్త లైన్ కోసం Shift+Enter' : 'Press Enter to send · Shift+Enter for new line · Supports Romanized Telugu'}
        </p>
      </div>
    </div>
  );
}
