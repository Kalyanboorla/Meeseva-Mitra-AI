// MeeSeva Mitra AI — ServiceCard component (Redesigned Civic-Tech Card)
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, ShieldCheck, Building2, Clock, IndianRupee } from 'lucide-react';
import type { Service } from '../types';
import { useLang } from '../lang';

interface ServiceCardProps {
  service: Service;
  highlight?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Revenue: 'badge-forest',
  Municipal: 'badge-teal',
  'Civil Supplies': 'badge-amber',
};

export default function ServiceCard({ service, highlight }: ServiceCardProps) {
  const { t, lang } = useLang();

  const name = lang === 'te' && service.name_te ? service.name_te : service.name_en;
  const secondaryName = lang === 'te' ? service.name_en : service.name_te;
  const description =
    lang === 'te' && service.description_te ? service.description_te : service.description_en;
  const dept =
    lang === 'te' && service.dept_name_te ? service.dept_name_te : service.dept_name_en;
  const category = service.category || 'Revenue';
  const badgeClass = CATEGORY_COLORS[category] || 'badge-slate';

  // Fee and SLA chips
  const feeText = service.fee_en ? service.fee_en.split('(')[0].trim() : '₹35';
  const timeText = service.processing_time_en ? service.processing_time_en.split('(')[0].trim() : '7–15 days';

  const portalLabel = lang === 'te' && service.portal_label_te
    ? service.portal_label_te
    : (service.portal_label_en || (lang === 'te' ? 'అధికారిక పోర్టల్ తెరవండి' : 'Open Official Portal'));

  return (
    <article
      className={`card flex flex-col gap-3.5 transition-all duration-200 hover:shadow-card-hover hover:border-forest-300 hover:-translate-y-0.5 bg-white ${
        highlight ? 'ring-2 ring-forest-400 shadow-card-lg' : ''
      }`}
      aria-label={`${name} — ${dept}`}
    >
      {/* Category & Verification Badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={badgeClass}>{category}</span>
        {service.is_verified === 1 && (
          <span className="badge badge-forest gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
            <span>{lang === 'te' ? 'పరిశీలించబడింది' : 'Verified'}</span>
          </span>
        )}
      </div>

      {/* Title & Subtitle */}
      <div>
        <h3
          className={`font-bold text-warm-dark text-base sm:text-lg leading-snug tracking-tight ${
            lang === 'te' ? 'telugu' : ''
          }`}
        >
          {name}
        </h3>
        {secondaryName && (
          <p className="text-xs text-warm-muted font-medium mt-0.5 truncate">
            {secondaryName}
          </p>
        )}
      </div>

      {/* Description */}
      <p
        className={`text-warm-muted text-xs sm:text-sm leading-relaxed line-clamp-2 ${
          lang === 'te' ? 'telugu' : ''
        }`}
      >
        {description}
      </p>

      {/* Metadata Chips: Department, Statutory Fee, Timeline */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-warm-borderLight text-xs">
        <div className="flex items-center gap-1.5 text-warm-muted font-medium truncate" title={dept}>
          <Building2 className="w-3.5 h-3.5 text-forest-700 shrink-0" aria-hidden="true" />
          <span className={`truncate ${lang === 'te' ? 'telugu' : ''}`}>{dept}</span>
        </div>
        <div className="flex items-center gap-1.5 text-warm-muted font-medium justify-end">
          <IndianRupee className="w-3.5 h-3.5 text-accent-600 shrink-0" aria-hidden="true" />
          <span>{feeText}</span>
        </div>
        <div className="flex items-center gap-1.5 text-warm-muted font-medium col-span-2">
          <Clock className="w-3.5 h-3.5 text-forest-700 shrink-0" aria-hidden="true" />
          <span className="truncate">{timeText}</span>
        </div>
      </div>

      {/* Action Buttons: Internal Detail Guide vs External Official Portal */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-warm-borderLight">
        <Link
          to={`/services/${service.slug}`}
          className="btn-primary flex-1 text-center py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg"
          id={`view-${service.slug}`}
          aria-label={`View step-by-step guidance and documents for ${service.name_en}`}
        >
          <span>{t('viewDetails')}</span>
          <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
        </Link>
        {service.official_url && (
          <a
            href={service.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-3 py-2.5 rounded-lg text-forest-800 hover:text-forest-900"
            title={portalLabel}
            aria-label={`${portalLabel} (opens in new tab)`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
