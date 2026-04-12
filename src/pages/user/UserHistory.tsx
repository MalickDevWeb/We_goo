import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Ride } from '@/types';
import { Car } from 'lucide-react';

const UserHistory = () => {
  const { t } = useTranslation();
  const { session } = useAuthStore();
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (session) api.getRidesByUser(session.id).then(setRides);
  }, [session]);

  const statusColor: Record<string, string> = {
    completed: 'text-accent2',
    'in-progress': 'text-accent',
    cancelled: 'text-destructive',
    accepted: 'text-foreground',
    arriving: 'text-foreground',
    available: 'text-muted-foreground',
  };

  return (
    <div className="safe-top px-6 pb-6">
      <h1 className="text-xl font-bold text-foreground pt-6 mb-6">{t('user.history.title')}</h1>
      {rides.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{t('user.history.noRides')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map(ride => (
            <div key={ride.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${statusColor[ride.status] || 'text-foreground'}`}>{ride.status}</span>
                <span className="text-xs text-muted-foreground">{ride.date}</span>
              </div>
              <p className="text-sm text-foreground">{ride.from} → {ride.to}</p>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">{ride.distance}</span>
                <span className="text-sm font-semibold text-foreground">${ride.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserHistory;
