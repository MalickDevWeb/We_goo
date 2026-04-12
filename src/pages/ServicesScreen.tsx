import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Package, CarFront, ShoppingBag, UtensilsCrossed, Hotel, ArrowRight, Sparkles } from 'lucide-react';

const servicesList = [
  { key: 'rides', icon: Car, available: true },
  { key: 'packages', icon: Package, available: true },
  { key: 'rental', icon: CarFront, available: false, flag: 'version2_vehicle_rental' },
  { key: 'commerce', icon: ShoppingBag, available: false, flag: 'version2_commerce' },
  { key: 'restaurants', icon: UtensilsCrossed, available: false, flag: 'version2_restaurants' },
  { key: 'hotels', icon: Hotel, available: false, flag: 'version2_hotels' },
];

const ServicesScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <span className="text-lg font-bold text-background" style={{ fontFamily: 'Georgia, serif' }}>We</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            <span style={{ fontFamily: 'Georgia, serif' }}>We</span>go
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mt-6">{t('services.title')}</h1>
      </div>

      {/* Services Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {servicesList.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => service.available ? navigate('/login') : undefined}
                disabled={!service.available}
                className={`relative glass rounded-2xl p-5 text-left transition-all tap-target ${
                  service.available ? 'hover:border-accent/40 active:scale-[0.97]' : 'opacity-50'
                }`}
              >
                {!service.available && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-accent2 text-accent2-foreground px-2 py-0.5 rounded-full">
                    {t('services.promo')}
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{t(`services.${service.key}.title`)}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t(`services.${service.key}.desc`)}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold text-lg tap-target flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          {t('services.access')}
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/admin-login')}
          className="w-full mt-3 py-3 rounded-xl border border-border text-muted-foreground text-sm tap-target transition-all hover:border-muted-foreground/40"
        >
          {t('auth.adminLogin')}
        </button>
      </div>
    </div>
  );
};

export default ServicesScreen;
