// MeeSeva Mitra AI — Navbar component (Redesigned Civic-Tech Navigation)
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Compass } from 'lucide-react';
import { useLang } from '../lang';

export default function Navbar() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('navHome') },
    { to: '/services', label: t('navServices') },
    { to: '/assistant', label: t('navAssistant') },
    { to: '/about', label: t('navAbout') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="bg-warm-ivory/95 backdrop-blur-md border-b border-warm-border sticky top-0 z-40 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand mark */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-forest-700 rounded-lg py-1 px-1 -ml-1 transition-transform active:scale-[0.99]"
            aria-label="MeeSeva Mitra AI — Home"
          >
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-subtle group-hover:bg-forest-700 transition-colors shrink-0">
              <Compass className="w-5 h-5 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-warm-dark text-base tracking-tight leading-tight">
                  MeeSeva Mitra
                </span>
                <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-accent-100 text-accent-700 border border-accent-200">
                  AI
                </span>
              </div>
              <span
                className={`text-[11px] text-warm-muted leading-tight font-medium ${lang === 'te' ? 'telugu' : ''}`}
              >
                {lang === 'te' ? 'తెలంగాణ పౌర సేవా మార్గదర్శి' : 'Telangana Citizen Navigator'}
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-forest-700 ${
                    active
                      ? 'bg-forest-50 text-forest-800 font-semibold shadow-subtle'
                      : 'text-warm-charcoal/80 hover:text-warm-dark hover:bg-warm-cream'
                  } ${lang === 'te' ? 'telugu' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right: Language switch + AI Chip + mobile menu */}
          <div className="flex items-center gap-2.5">
            {/* Quick Assistant CTA Pill (Desktop only) */}
            <Link
              to="/assistant"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200 hover:bg-forest-100 transition-colors shadow-subtle"
            >
              <Sparkles className="w-3.5 h-3.5 text-forest-600" aria-hidden="true" />
              <span>{lang === 'te' ? 'AI అడగండి' : 'Ask AI'}</span>
            </Link>

            {/* Language Switcher Capsule */}
            <div
              className="flex items-center p-0.5 rounded-lg bg-warm-cream border border-warm-border shadow-subtle"
              role="group"
              aria-label="Language selector"
            >
              <button
                className={lang === 'en' ? 'lang-btn-active' : 'lang-btn-inactive'}
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                id="lang-en-btn"
                title="Switch to English"
              >
                EN
              </button>
              <button
                className={`${lang === 'te' ? 'lang-btn-active' : 'lang-btn-inactive'} telugu`}
                onClick={() => setLang('te')}
                aria-pressed={lang === 'te'}
                id="lang-te-btn"
                title="తెలుగు భాషకు మార్చండి"
              >
                తెలుగు
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden btn-ghost p-2 text-warm-charcoal"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {open && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-warm-border py-3 space-y-1 bg-warm-ivory animate-fade-in"
          >
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-forest-700 ${
                  isActive(to)
                    ? 'bg-forest-50 text-forest-800 font-semibold'
                    : 'text-warm-charcoal hover:bg-warm-cream'
                } ${lang === 'te' ? 'telugu' : ''}`}
                aria-current={isActive(to) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
