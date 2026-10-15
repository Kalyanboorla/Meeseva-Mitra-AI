// MeeSeva Mitra AI — App root
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider, useLang } from './lang';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AssistantPage from './pages/AssistantPage';
import AboutPage from './pages/AboutPage';
import { WifiOff, CheckCircle } from 'lucide-react';

function OfflineBanner() {
  const { lang } = useLang();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-amber-800 text-amber-50 px-4 py-2 text-xs text-center flex items-center justify-center gap-2 shadow-xs transition-all"
      >
        <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="font-medium">
          {lang === 'te'
            ? 'ఆఫ్‌లైన్ మోడ్: మీరు క్యాష్ చేసిన సేవా మార్గదర్శకాలను చూస్తున్నారు. లైవ్ AI సమాధానాల కోసం ఇంటర్నెట్ అవసరం.'
            : 'Offline Mode: Browsing locally cached service guides. Live AI assistant requires internet connectivity.'}
        </span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-forest-800 text-emerald-100 px-4 py-2 text-xs text-center flex items-center justify-center gap-2 shadow-xs animate-fade-in"
      >
        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
        <span className="font-medium">
          {lang === 'te' ? 'ఇంటర్నెట్ తిరిగి కనెక్ట్ అయింది.' : 'Internet connection restored.'}
        </span>
      </div>
    );
  }

  return null;
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        {/* Skip to content link for keyboard/screen reader users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <OfflineBanner />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <h1 className="text-4xl font-bold text-slate-200 mb-4">404</h1>
                    <p className="text-slate-500 mb-6">Page not found.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </LangProvider>
  );
}
