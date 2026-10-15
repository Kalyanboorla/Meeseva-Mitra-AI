// MeeSeva Mitra AI — Home page (Redesigned Civic-Tech Interface)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Baby, ShoppingBag,
  Bot, ArrowRight, ShieldCheck, Globe, Sparkles, Mic,
} from 'lucide-react';
import { searchServices, fetchAllServices } from '../api';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import type { Service } from '../types';
import { useLang } from '../lang';

export default function HomePage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [searchResults, setSearchResults] = useState<Service[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searching, setSearching] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    fetchAllServices(lang)
      .then(setAllServices)
      .finally(() => setLoadingServices(false));
  }, [lang]);

  const handleSearch = async (q: string) => {
    setSearching(true);
    try {
      const res = await searchServices(q, lang);
      setSearchResults(res.results);
      setSelectedCategory('All');
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Filter services by category if selected
  const baseServices = searchResults ?? allServices;
  const displayedServices = selectedCategory === 'All'
    ? baseServices
    : baseServices.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  const categories = [
    { key: 'All', label: lang === 'te' ? 'అన్ని సేవలు' : 'All Services', icon: null },
    { key: 'Revenue', label: lang === 'te' ? 'రెవెన్యూ' : 'Revenue', icon: <FileText className="w-4 h-4" /> },
    { key: 'Municipal', label: lang === 'te' ? 'మున్సిపల్' : 'Municipal', icon: <Baby className="w-4 h-4" /> },
    { key: 'Civil Supplies', label: lang === 'te' ? 'పౌర సరఫరాలు' : 'Civil Supplies', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-warm-ivory">
      {/* ── Hero Section (Warm Civic-Tech Aesthetic) ─────────────────────────── */}
      <section
        className="relative bg-warm-ivory border-b border-warm-border pt-12 pb-14 sm:pt-16 sm:pb-20 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Subtle, restrained ambient shapes */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-forest-100/40 via-accent-50/20 to-transparent rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          {/* Initiative Badge */}
          <div className="inline-flex items-center gap-2 bg-warm-cream border border-warm-border text-warm-charcoal px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" aria-hidden="true" />
            <Sparkles className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
            <span>AIKAM ESD Innovation Challenge · Telangana</span>
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className={`text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-warm-dark tracking-tight leading-[1.2] text-balance ${
              lang === 'te' ? 'telugu' : ''
            }`}
          >
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p
            className={`text-warm-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
              lang === 'te' ? 'telugu' : ''
            }`}
          >
            {t('heroSubtitle')}
          </p>

          {/* Prominent Search Bar Container */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="bg-white p-2 rounded-2xl border border-warm-border shadow-card-hover">
              <SearchBar onSearch={handleSearch} loading={searching} autoFocus />
            </div>

            {/* Quick search suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-warm-muted">
              <span className="font-medium text-warm-charcoal">
                {lang === 'te' ? 'త్వరిత శోధన:' : 'Popular:'}
              </span>
              {[
                { label: lang === 'te' ? 'ఆదాయ ధృవీకరణ' : 'Income Certificate', query: 'income' },
                { label: lang === 'te' ? 'కుల సర్టిఫికేట్' : 'Caste Certificate', query: 'caste' },
                { label: lang === 'te' ? 'జన్మ ధృవీకరణ' : 'Birth Certificate', query: 'birth' },
                { label: lang === 'te' ? 'రేషన్ కార్డు' : 'Ration Card', query: 'ration card' },
              ].map((item) => (
                <button
                  key={item.query}
                  onClick={() => handleSearch(item.query)}
                  className="px-2.5 py-1 rounded-md bg-warm-cream border border-warm-border text-warm-charcoal hover:bg-forest-50 hover:text-forest-800 hover:border-forest-200 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Navigator Callout Banner */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/assistant')}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-sm font-medium hover:bg-forest-100 hover:border-forest-300 transition-all shadow-subtle group"
              id="open-ai-assistant-btn"
            >
              <Bot className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span className={lang === 'te' ? 'telugu' : ''}>
                {lang === 'te'
                  ? 'ప్రశ్నలు ఉన్నాయా? AI సహాయకుడిని తెలుగు, ఇంగ్లీష్ లేదా Telugish లో అడగండి'
                  : 'Have questions? Ask our AI assistant in English, Telugu, or Telugish'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-forest-700 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust Indicators Bar ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-warm-border" aria-label="Trust indicators">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-xs text-warm-muted">
            <div className="flex items-center gap-1.5 font-medium text-forest-800">
              <ShieldCheck className="w-4 h-4 text-forest-600" aria-hidden="true" />
              <span>Official Departmental Portals Linked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-forest-600" aria-hidden="true" />
              <span>English · తెలుగు · Telugish</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-accent-600" aria-hidden="true" />
              <span>Voice Input (te-IN &amp; en-IN)</span>
            </div>
            <div className="flex items-center gap-1.5 text-accent-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
              <span>Civic Innovation Prototype · Non-Government</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compact Category Navigation Bar ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4" aria-label="Service categories">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-warm-border pb-4">
          <div>
            <h2 className={`text-lg sm:text-xl font-bold text-warm-dark ${lang === 'te' ? 'telugu' : ''}`}>
              {searchResults !== null ? t('searchResults') : (lang === 'te' ? 'అందుబాటులో ఉన్న సేవలు' : 'Available Citizen Services')}
            </h2>
            <p className="text-xs text-warm-muted mt-0.5">
              {searchResults !== null
                ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`
                : (lang === 'te' ? 'అధికారిక మీసేవ మరియు శాఖాపరమైన సేవలు' : 'Official MeeSeva & departmental services')}
            </p>
          </div>

          {/* Compact Category Pill Switcher */}
          <div className="flex items-center gap-1.5 bg-warm-cream p-1 rounded-xl border border-warm-border" role="tablist">
            {categories.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-forest-800 text-white shadow-subtle'
                      : 'text-warm-muted hover:text-warm-charcoal hover:bg-warm-borderLight'
                  } ${lang === 'te' ? 'telugu' : ''}`}
                  id={`cat-${cat.key.toLowerCase().replace(' ', '-')}-tab`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Services Grid ───────────────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-2"
        aria-label={searchResults !== null ? t('searchResults') : t('allServices')}
      >
        {loadingServices ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse space-y-4">
                <div className="h-4 bg-warm-border rounded w-3/4" />
                <div className="h-3 bg-warm-cream rounded w-1/2" />
                <div className="h-16 bg-warm-cream rounded" />
                <div className="h-9 bg-warm-border rounded-lg" />
              </div>
            ))}
          </div>
        ) : displayedServices.length === 0 ? (
          <div className="card text-center py-16 space-y-3 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-warm-cream border border-warm-border flex items-center justify-center mx-auto text-warm-subtle">
              <FileText className="w-7 h-7" aria-hidden="true" />
            </div>
            <p className={`text-warm-charcoal font-semibold ${lang === 'te' ? 'telugu' : ''}`}>
              {t('searchNoResults')}
            </p>
            <p className={`text-warm-muted text-sm max-w-md mx-auto ${lang === 'te' ? 'telugu' : ''}`}>
              {t('searchNoResultsHint')}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchResults(null);
                  setSelectedCategory('All');
                }}
                className="btn-secondary"
              >
                {lang === 'te' ? 'అన్ని సేవలు చూపించు' : 'Show All Services'}
              </button>
              <button
                onClick={() => navigate('/assistant')}
                className="btn-primary"
              >
                <Bot className="w-4 h-4" aria-hidden="true" />
                <span>{lang === 'te' ? 'AI ని అడగండి' : 'Ask AI Assistant'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedServices.map((svc) => (
              <ServiceCard key={svc.slug} service={svc} />
            ))}
          </div>
        )}
      </section>

      {/* ── AI Assistant Call to Action (Warm Civic Container) ───────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16" aria-label="AI assistant call to action">
        <div className="rounded-2xl bg-gradient-to-br from-forest-50 via-warm-cream to-accent-50/40 border border-forest-200/80 p-8 sm:p-10 shadow-card">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-forest-800 text-white flex items-center justify-center mx-auto shadow-subtle">
              <Bot className="w-6 h-6 text-emerald-200" aria-hidden="true" />
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold text-warm-dark ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te' ? 'సేవల గురించి ఏదైనా సందేహం ఉందా?' : 'Unsure which service or documents you need?'}
            </h2>
            <p className={`text-warm-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te'
                ? 'మా AI సహాయకుడిని తెలుగు, ఇంగ్లీష్ లేదా Telugish లో అడగండి. నిబంధనలు, అవసరమైన పత్రాలు మరియు అధికారిక పోర్టల్ లింకులు పొందండి.'
                : 'Ask questions in English, Telugu script, or Romanized Telugish. Get verified document checklists, statutory fees, and direct departmental portal links.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/assistant')}
                className="btn-primary text-base px-6 py-3 rounded-xl shadow-card"
                id="cta-open-assistant-btn"
              >
                <Bot className="w-5 h-5" aria-hidden="true" />
                <span className={lang === 'te' ? 'telugu' : ''}>
                  {lang === 'te' ? 'AI సహాయకుడితో మాట్లాడండి' : 'Start Guidance with AI Assistant'}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
