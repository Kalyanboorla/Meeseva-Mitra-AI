// MeeSeva Mitra AI — About page (Redesigned Civic-Tech Layout)
import { ExternalLink, Shield, Bot, Database, Code2, AlertCircle, Sparkles } from 'lucide-react';
import { useLang } from '../lang';

export default function AboutPage() {
  const { lang } = useLang();

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-forest-700" />
          AIKAM ESD Innovation Challenge · Telangana
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold text-warm-dark mb-2 tracking-tight ${lang === 'te' ? 'telugu' : ''}`}>
          {lang === 'te' ? 'మీసేవ మిత్ర AI గురించి' : 'About MeeSeva Mitra AI'}
        </h1>
        <p className="text-warm-muted text-sm sm:text-base">
          A bilingual (Telugu &amp; English) citizen-service navigator designed to simplify Telangana digital governance through AI guidance and accessibility.
        </p>
      </div>

      <div className="space-y-6">
        {/* What is this */}
        <div className="card bg-white border border-warm-border shadow-card">
          <h2 className="text-base sm:text-lg font-bold text-warm-dark mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-forest-700" aria-hidden="true" />
            What is MeeSeva Mitra AI?
          </h2>
          <p className="text-warm-charcoal text-sm leading-relaxed mb-3">
            MeeSeva Mitra AI is an independent, source-grounded government service navigator created to help
            Telangana citizens discover the right service, understand official instructions, review mandatory vs. conditional documents,
            and navigate directly to verified departmental portals.
          </p>
          <p className="text-warm-charcoal text-sm leading-relaxed">
            It supports formal Telugu script, English, and Romanized Telugu (Telugish), accompanied by browser-native voice input
            and a source-grounded conversational AI assistant.
          </p>
        </div>

        {/* Scope: Can vs Cannot */}
        <div className="card bg-white border border-warm-border shadow-card">
          <h2 className="text-base sm:text-lg font-bold text-warm-dark mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent-600" aria-hidden="true" />
            System Scope: What this prototype can and cannot do
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 mb-2">✅ What it can do</h3>
              <ul className="text-xs text-warm-charcoal space-y-2">
                <li>• Help you discover the correct government service and issuing authority</li>
                <li>• Separate mandatory from conditional document requirements</li>
                <li>• Provide statutory fee schedules and realistic processing SLA timelines</li>
                <li>• Answer queries in English, Telugu, and Romanized Telugish</li>
                <li>• Direct you to verified, service-specific government portal entry points</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-accent-50/60 border border-accent-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-900 mb-2">❌ What it cannot do</h3>
              <ul className="text-xs text-warm-charcoal space-y-2">
                <li>• Submit applications directly to government databases</li>
                <li>• Issue official certificates or government ID cards</li>
                <li>• Query private applicant records without authorization</li>
                <li>• Act as an official government agency or representative</li>
                <li>• Guarantee real-time departmental application approvals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Verified Data Sources */}
        <div className="card bg-white border border-warm-border shadow-card">
          <h2 className="text-base sm:text-lg font-bold text-warm-dark mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-forest-700" aria-hidden="true" />
            Verified Government Sources
          </h2>
          <p className="text-xs sm:text-sm text-warm-muted mb-4">
            All service requirements, statutory fees, and portal links are grounded in official Telangana government platforms:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm">
            {[
              { name: 'MeeSeva Telangana Revenue Services', url: 'https://ts.meeseva.telangana.gov.in/meeseva/service.htm' },
              { name: 'CDMA Birth & Death Registrations Portal', url: 'https://cdma.telangana.gov.in/en/birth-and-death-registrations' },
              { name: 'EPDS Telangana Ration Card Portal', url: 'https://epds.telangana.gov.in/' },
              { name: 'Telangana State Official Portal', url: 'https://telangana.gov.in/' },
            ].map(({ name, url }) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-forest-800 hover:text-forest-900 font-medium hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-forest-700" aria-hidden="true" />
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Technology Stack */}
        <div className="card bg-white border border-warm-border shadow-card">
          <h2 className="text-base sm:text-lg font-bold text-warm-dark mb-3 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-forest-700" aria-hidden="true" />
            Technology Stack &amp; Architecture
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm text-warm-charcoal">
            <div className="p-3.5 rounded-xl bg-warm-cream border border-warm-border">
              <h3 className="font-bold text-warm-dark mb-2">Frontend Client</h3>
              <ul className="space-y-1 text-warm-muted text-xs">
                <li>• React 19 + TypeScript + Vite 6</li>
                <li>• Tailwind CSS v4 design-token system</li>
                <li>• HTML5 Web Speech API (te-IN &amp; en-IN)</li>
                <li>• Client-side session isolation</li>
                <li>• WCAG 2.1 AA / GIGW 3.0 accessibility targets</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-warm-cream border border-warm-border">
              <h3 className="font-bold text-warm-dark mb-2">Backend &amp; AI Engine</h3>
              <ul className="space-y-1 text-warm-muted text-xs">
                <li>• Python 3.12 + Flask 3.0 REST API</li>
                <li>• Dual Database Engine (SQLite 3 + MySQL 8.0)</li>
                <li>• Google Gemini 3.1 Flash Lite (REST transport)</li>
                <li>• Telugish heuristic &amp; weighted alias scoring</li>
                <li>• Deterministic offline rule-based fallback</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="card bg-white border border-warm-border shadow-card">
          <h2 className="text-base sm:text-lg font-bold text-warm-dark mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-forest-700" aria-hidden="true" />
            Citizen Privacy &amp; Data Ethics
          </h2>
          <ul className="text-xs sm:text-sm text-warm-charcoal space-y-2">
            <li>• We do not collect, store, or log citizen names, Aadhaar numbers, phone numbers, or uploaded documents.</li>
            <li>• Audio speech recognition is processed locally inside the user's browser; zero raw audio is transmitted to our servers.</li>
            <li>• AI chat history is kept purely in temporary browser session memory and cleared upon closing the tab.</li>
            <li>• All SQL operations use 100% parameterized queries to ensure database integrity and safety.</li>
          </ul>
        </div>

        {/* Mandatory Independent Prototype Disclaimer */}
        <div className="bg-accent-50/70 border border-accent-200/90 rounded-2xl p-5 shadow-subtle">
          <h2 className="text-xs font-bold text-accent-900 mb-1.5 flex items-center gap-2 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-accent-700" aria-hidden="true" />
            Important Disclaimer
          </h2>
          <p className="text-xs text-accent-800 leading-relaxed">
            MeeSeva Mitra AI is an independent civic technology prototype developed for the AIKAM ESD Innovation Challenge · Telangana.
            It is <strong>not affiliated with, authorized, or endorsed by</strong> the Government of Telangana, the MeeSeva programme,
            or any state department. All official transactions, payments, and application submissions must be completed on official portals
            such as <a href="https://ts.meeseva.telangana.gov.in/" target="_blank" rel="noopener noreferrer" className="underline font-bold">ts.meeseva.telangana.gov.in</a> or at authorized physical MeeSeva centres.
          </p>
        </div>
      </div>
    </main>
  );
}
