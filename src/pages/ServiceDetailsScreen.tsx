import { servicesCatalog, getServiceByKey, isServiceKey } from '@/lib/servicesCatalog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const ServiceDetailsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serviceKey } = useParams();

  const service = useMemo(() => getServiceByKey(serviceKey), [serviceKey]);
  const safeKey = isServiceKey(serviceKey ?? '') ? serviceKey : servicesCatalog[0].key;

  if (!service) {
    return (
      <div className="min-h-screen bg-background safe-top safe-bottom px-6 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="tap-target inline-flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
          {t('common.back', { defaultValue: 'Retour' })}
        </button>
        <div className="mt-6 text-foreground font-semibold">
          {t('common.notFound', { defaultValue: 'Service introuvable.' })}
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="h-[100svh] overflow-hidden bg-background safe-top safe-bottom flex flex-col">
      <div className="px-6 pt-4 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap-target inline-flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back', { defaultValue: 'Retour' })}
        </button>
      </div>

      <div className="px-6">
        <div className="relative overflow-hidden rounded-3xl h-[200px] glass">
          <img src={service.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          {!service.available && (
            <span className="absolute top-3 right-3 text-[10px] font-bold bg-accent2 text-accent2-foreground px-2 py-0.5 rounded-full">
              {t('services.promo')}
            </span>
          )}
          <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white/90 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-extrabold text-2xl leading-none truncate">
                  {t(`services.${safeKey}.title`)}
                </div>
                <div className="text-white/70 text-sm mt-2 line-clamp-2">
                  {t(`services.${safeKey}.desc`)}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {servicesCatalog.map((item) => {
            const ItemIcon = item.icon;
            const selected = item.key === safeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(`/services/${item.key}`)}
                className="shrink-0 tap-target"
              >
                <div className="flex flex-col items-center gap-2 w-[76px]">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
                      selected ? 'bg-accent/25 border-accent/60 ring-4 ring-accent/10' : 'bg-transparent border-border/40'
                    }`}
                  >
                    <ItemIcon className={`w-6 h-6 ${selected ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div className={`text-xs font-medium text-center ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {t(`services.${item.key}.title`)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-4 mt-auto">
        <button
          type="button"
          onClick={() => navigate('/login')}
          disabled={!service.available}
          className={`w-full py-3 rounded-xl font-semibold tap-target flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
            service.available ? 'gradient-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          {t('services.access')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ServiceDetailsScreen;

