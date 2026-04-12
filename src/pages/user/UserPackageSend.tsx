import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UserPackageSend = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    senderName: '',
    receiverName: '',
    receiverPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    description: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSend = async () => {
    if (!form.senderName || !form.receiverName || !form.receiverPhone || !form.pickupAddress || !form.deliveryAddress) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const trackingNumber = `WG-${Date.now().toString().slice(-8)}`;
    setLoading(false);
    toast.success(t('user.package.success', { trackingNumber }));
    navigate('/user/package-tracking');
  };

  const fields = [
    { key: 'senderName', label: t('user.package.senderName'), type: 'text' },
    { key: 'receiverName', label: t('user.package.receiverName'), type: 'text' },
    { key: 'receiverPhone', label: t('user.package.receiverPhone'), type: 'tel' },
    { key: 'pickupAddress', label: t('user.package.pickupAddress'), type: 'text' },
    { key: 'deliveryAddress', label: t('user.package.deliveryAddress'), type: 'text' },
    { key: 'description', label: t('user.package.description'), type: 'text' },
    { key: 'weight', label: t('user.package.weight'), type: 'number' },
  ];

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground ml-2">{t('user.package.title')}</h1>
      </div>

      <div className="px-6 pt-6">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-2xl bg-accent2/10 flex items-center justify-center mx-auto mb-6"
        >
          <Package className="w-10 h-10 text-accent2" />
        </motion.div>

        <div className="space-y-4">
          {fields.map((field, i) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <label className="text-sm text-muted-foreground mb-1 block">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={e => update(field.key, e.target.value)}
                className="w-full py-3.5 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
              />
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleSend}
          disabled={loading || !form.senderName || !form.receiverName || !form.pickupAddress || !form.deliveryAddress}
          className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 mt-6 mb-8 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Send className="w-5 h-5" />
          {loading ? t('common.loading') : t('user.package.send')}
        </button>
      </div>
    </div>
  );
};

export default UserPackageSend;
