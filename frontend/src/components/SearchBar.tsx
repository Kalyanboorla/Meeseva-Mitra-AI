// MeeSeva Mitra AI — SearchBar component
import { useState, useRef, type FormEvent } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useLang } from '../lang';
import VoiceInput from './VoiceInput';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  autoFocus?: boolean;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  loading = false,
  autoFocus = false,
  initialValue = '',
}: SearchBarProps) {
  const { t, lang } = useLang();
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) onSearch(trimmed);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleVoiceTranscript = (text: string) => {
    setQuery(text);
    if (text.trim().length >= 2) {
      onSearch(text.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label={t('heroSearch')}
      className="w-full"
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          {/* Search icon */}
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-subtle pointer-events-none"
            aria-hidden="true"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-forest-600" />
            ) : (
              <Search className="w-5 h-5 text-warm-muted" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            id="service-search-input"
            type="search"
            className={`search-input pr-10 pl-11 py-3 w-full rounded-xl border border-warm-border bg-white text-warm-charcoal placeholder-warm-subtle shadow-subtle focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 transition-all ${lang === 'te' ? 'telugu' : ''}`}
            placeholder={t('heroSearchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={autoFocus}
            autoComplete="off"
            aria-label={t('heroSearch')}
            aria-busy={loading}
            minLength={2}
            maxLength={300}
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-warm-muted hover:text-warm-dark focus-visible:outline-forest-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Voice Input Microphone Button */}
        <VoiceInput
          idPrefix="search-bar"
          onTranscript={handleVoiceTranscript}
        />

        {/* Submit button */}
        <button
          type="submit"
          className="btn-primary py-3 px-5 text-sm font-semibold rounded-xl shrink-0 shadow-subtle"
          disabled={loading || query.trim().length < 2}
          id="search-submit-btn"
          aria-label={t('heroSearchBtn')}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <span className={lang === 'te' ? 'telugu' : ''}>
              {t('heroSearchBtn')}
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
