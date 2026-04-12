import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { servicesCatalog, type ServiceKey } from '@/lib/servicesCatalog';

const ServicesScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<ServiceKey>('rides');

  const visibleServices = useMemo(() => {
    const index = Math.max(0, servicesCatalog.findIndex((s) => s.key === activeKey));
    const nextIndex = (index + 1) % servicesCatalog.length;
    return [servicesCatalog[index], servicesCatalog[nextIndex]];
  }, [activeKey]);
  const heroService = visibleServices[0];

  return (
    <div className="h-[100svh] overflow-hidden bg-background safe-top safe-bottom flex flex-col">
      {/* Cadre image (au-dessus des catégories) */}
      <div className="px-6 pt-4">
        <div className="relative overflow-hidden rounded-3xl h-[131px] glass">
          <img
            src={heroService.imageSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-white font-extrabold text-2xl leading-none truncate">
                {t(`services.${heroService.key}.title`)}
              </div>
              <div className="text-white/70 text-sm mt-2 line-clamp-2">
                {t(`services.${heroService.key}.desc`)}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
          </div>
        </div>
      </div>

      {/* Cadres en haut (catégories) */}
      <div className="px-6 pt-3 pb-3">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {servicesCatalog.map((service) => {
            const Icon = service.icon;
            const selected = service.key === activeKey;
            return (
              <button
                key={service.key}
                type="button"
                onClick={() => setActiveKey(service.key)}
                className="shrink-0 tap-target"
              >
                <div className="flex flex-col items-center gap-2 w-[76px]">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
                      selected ? 'bg-accent/25 border-accent/60 ring-4 ring-accent/10' : 'bg-transparent border-border/40'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${selected ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div
                    className={`text-xs font-medium text-center ${
                      selected ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {t(`services.${service.key}.title`)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 cartes seulement (elles changent selon la catégorie sélectionnée) */}
      <div className="px-6 pb-4 flex-1 min-h-0">
        <div className="grid grid-cols-1 grid-rows-2 gap-3 h-full">
          {visibleServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/services/${service.key}`)}
                className={`glass rounded-3xl overflow-hidden text-left transition-all tap-target ${
                  service.available ? 'active:scale-[0.99]' : 'opacity-60'
                }`}
              >
                <div className="relative h-full">
                  <img src={service.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {!service.available && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-accent2 text-accent2-foreground px-2 py-0.5 rounded-full">
                      {t('services.promo')}
                    </span>
                  )}
                  <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-white/90 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-extrabold text-xl leading-none truncate">
                          {t(`services.${service.key}.title`)}
                        </div>
                        <div className="text-white/70 text-sm mt-1 line-clamp-1">
                          {t(`services.${service.key}.desc`)}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CTA: accès utilisateur + accès admin */}
      <div className="px-6 pb-4">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 rounded-xl gradient-accent text-accent-foreground font-semibold text-base tap-target flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          {t('services.access')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};

export default ServicesScreen;
