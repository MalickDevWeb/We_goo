import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UserLostItem = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rideId, setRideId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rideId || !description) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const reportNumber = `LI-${Date.now().toString().slice(-6)}`;
    setLoading(false);
    toast.success(t('user.lostItem.success', { reportNumber }));
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground ml-2">{t('user.lostItem.title')}</h1>
      </div>

      <div className="px-6 pt-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
        >
          <Search className="w-10 h-10 text-accent" />
        </motion.div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t('user.lostItem.rideId')}</label>
            <input
              type="text"
              value={rideId}
              onChange={e => setRideId(e.target.value)}
              placeholder="ID-12345"
              className="w-full py-3.5 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{t('user.lostItem.description')}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full py-3.5 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target resize-none"
            />
          </div>
        </div>

        <div className="glass rounded-xl p-4 mt-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('user.lostItem.title')}: Una vez enviado, nuestro equipo buscará el objeto y te contactará.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !rideId || !description}
          className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 mt-6 transition-transform active:scale-[0.98]"
        >
          {loading ? t('common.loading') : t('user.lostItem.submit')}
        </button>
      </div>
    </div>
  );
};

export default UserLostItem;
