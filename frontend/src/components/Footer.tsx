// MeeSeva Mitra AI — Footer component (Redesigned Civic-Tech Theme)
import { ExternalLink, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../lang';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { t, lang } = useLang();
  const year = CURRENT_YEAR;

  return (
    <footer
      className="bg-[#181715] text-[#9E978C] border-t border-[#2C2926] mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-emerald-200" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base tracking-tight">MeeSeva Mitra AI</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-900/60 text-accent-300 border border-accent-800/80">
                  Civic Tech
                </span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed text-[#BDB5A8] max-w-md ${lang === 'te' ? 'telugu' : ''}`}>
              {t('appDisclaimer')}
            </p>
            <p className="text-[11px] text-[#8A8378] leading-relaxed">
              Built for the <strong>AIKAM ESD Innovation Challenge · Telangana</strong> to improve citizen service usability, accessibility, and guidance.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors focus-visible:outline-forest-500 rounded py-0.5 block">
                  Home (ప్రధాన పేజీ)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors focus-visible:outline-forest-500 rounded py-0.5 block">
                  Service Catalogue (సేవలు)
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-white transition-colors focus-visible:outline-forest-500 rounded py-0.5 block">
                  AI Assistant (AI సహాయకుడు)
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors focus-visible:outline-forest-500 rounded py-0.5 block">
                  About Project (గురించి)
                </Link>
              </li>
            </ul>
          </div>

          {/* Verified Official Resources */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Official Resources</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://ts.meeseva.telangana.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-forest-500 rounded"
                >
                  <ExternalLink className="w-3 h-3 text-forest-400" aria-hidden="true" />
                  MeeSeva Telangana Portal
                </a>
              </li>
              <li>
                <a
                  href="https://cdma.telangana.gov.in/en/birth-and-death-registrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-forest-500 rounded"
                >
                  <ExternalLink className="w-3 h-3 text-forest-400" aria-hidden="true" />
                  CDMA Birth Registrations
                </a>
              </li>
              <li>
                <a
                  href="https://epds.telangana.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-forest-500 rounded"
                >
                  <ExternalLink className="w-3 h-3 text-forest-400" aria-hidden="true" />
                  EPDS Food Security Portal
                </a>
              </li>
              <li>
                <a
                  href="https://telangana.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-forest-500 rounded"
                >
                  <ExternalLink className="w-3 h-3 text-forest-400" aria-hidden="true" />
                  Telangana State Portal
                </a>
              </li>
              <li className="pt-1">
                <span className="text-[11px] text-[#A49C90]">📞 MeeSeva Helpline: 1800-599-4747</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2C2926] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#827B70]">
          <p>
            © {year} MeeSeva Mitra AI · Independent Civic Innovation Prototype
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/about" className="hover:text-white transition-colors focus-visible:outline-white rounded">
              Privacy &amp; Data Ethics
            </Link>
            <span>·</span>
            <span>Government Sources Verified: Oct 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
