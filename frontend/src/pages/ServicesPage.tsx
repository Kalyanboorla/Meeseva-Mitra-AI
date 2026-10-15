// MeeSeva Mitra AI — Services listing page
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAllServices, searchServices } from '../api';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import type { Service } from '../types';
import { useLang } from '../lang';
import { Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Revenue', 'Municipal', 'Civil Supplies'] as const;

export default function ServicesPage() {
  const { t, lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const initCategory = searchParams.get('category') || 'All';
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filtered, setFiltered] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState(initCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const applyFilter = useCallback((services: Service[], category: string) => {
    let result = services;
    if (category && category !== 'All') {
      result = result.filter((s) => s.category === category);
    }
    setFiltered(result);
  }, []);

  useEffect(() => {
    fetchAllServices(lang)
      .then((svcs) => {
        setAllServices(svcs);
        applyFilter(svcs, activeCategory);
      })
      .finally(() => setLoading(false));
  }, [lang, activeCategory, applyFilter]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setSearchParams(cat !== 'All' ? { category: cat } : {});
    applyFilter(allServices, cat);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    setSearching(true);
    try {
      const res = await searchServices(q, lang);
      setFiltered(res.results);
      setActiveCategory('All');
    } catch {
      setFiltered([]);
    } finally {
      setSearching(false);
    }
  };

  const catLabels: Record<string, string> = {
    All: lang === 'te' ? 'అన్నీ' : 'All',
    Revenue: lang === 'te' ? 'రెవెన్యూ' : 'Revenue',
    Municipal: lang === 'te' ? 'మున్సిపల్' : 'Municipal',
    'Civil Supplies': lang === 'te' ? 'పౌర సరఫరాలు' : 'Civil Supplies',
  };

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Page title */}
      <div className="mb-6">
        <h1 className={`text-2xl sm:text-3xl font-extrabold text-warm-dark mb-1 tracking-tight ${lang === 'te' ? 'telugu' : ''}`}>
          {t('allServices')}
        </h1>
        <p className={`text-warm-muted text-sm ${lang === 'te' ? 'telugu' : ''}`}>
          {t('allServicesDesc')}
        </p>
      </div>

      {/* Search Container */}
      <div className="mb-6 bg-white p-2 rounded-2xl border border-warm-border shadow-subtle">
        <SearchBar
          onSearch={handleSearch}
          loading={searching}
          initialValue={searchQuery}
        />
      </div>

      {/* Category filter */}
      <div
        className="flex items-center gap-2 mb-6 flex-wrap"
        role="group"
        aria-label="Filter by category"
      >
        <span className="text-xs font-semibold text-warm-muted flex items-center gap-1.5 mr-1">
          <Filter className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
          <span>{lang === 'te' ? 'వర్గం:' : 'Category:'}</span>
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-forest-700 ${
              activeCategory === cat
                ? 'bg-forest-800 text-white shadow-subtle'
                : 'bg-white text-warm-charcoal border border-warm-border hover:border-forest-300 hover:bg-forest-50'
            } ${lang === 'te' ? 'telugu' : ''}`}
            aria-pressed={activeCategory === cat}
            id={`filter-${cat.toLowerCase().replace(' ', '-')}-btn`}
          >
            {catLabels[cat]}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs font-medium text-warm-muted mb-4" aria-live="polite" role="status">
          {filtered.length} service{filtered.length !== 1 ? 's' : ''} available
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card animate-pulse space-y-4">
              <div className="h-4 bg-warm-border rounded w-3/4" />
              <div className="h-3 bg-warm-cream rounded w-1/2" />
              <div className="h-16 bg-warm-cream rounded" />
              <div className="h-9 bg-warm-border rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 space-y-3 bg-white">
          <p className={`text-warm-charcoal font-semibold ${lang === 'te' ? 'telugu' : ''}`}>
            {t('searchNoResults')}
          </p>
          <p className={`text-warm-muted text-sm max-w-md mx-auto ${lang === 'te' ? 'telugu' : ''}`}>
            {t('searchNoResultsHint')}
          </p>
          <button
            className="btn-secondary mt-4"
            onClick={() => { handleCategoryChange('All'); }}
          >
            {lang === 'te' ? 'ఫిల్టర్లను తొలగించు' : 'Clear filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((svc) => (
            <ServiceCard key={svc.slug} service={svc} />
          ))}
        </div>
      )}
    </main>
  );
}
