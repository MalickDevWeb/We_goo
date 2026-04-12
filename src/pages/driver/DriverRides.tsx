import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Ride } from '@/types';

const DriverRides = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (session) api.getRidesByDriver(session.id).then(setRides);
  }, [session]);

  const statusColors: Record<string, string> = {
    completed: 'bg-accent2/20 text-accent2',
    'in-progress': 'bg-accent/20 text-accent',
    accepted: 'bg-primary/20 text-foreground',
    cancelled: 'bg-destructive/20 text-destructive',
    arriving: 'bg-accent/20 text-accent',
    available: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground ml-2">{t('driver.rides.title')}</h1>
      </div>

      <div className="px-6 pt-6">
        {rides.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{t('driver.rides.noRides')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride, i) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[ride.status] || ''}`}>
                    {ride.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{ride.date}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{ride.from} → {ride.to}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{ride.distance}</span>
                  <span className="text-lg font-bold text-accent">${ride.amount}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRides;
