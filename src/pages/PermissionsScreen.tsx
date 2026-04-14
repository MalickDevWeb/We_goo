import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Bell, Camera, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const PermissionsScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    setLoading(true);

    try {
      // 1. Notifications
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      // 2. Camera (Not strictly required to force right away, but we can ask gently or just wait until they need it. We will request it if we are explicit about it, but accessing user media without a video element is tricky. Sometimes we just skip the camera here to avoid errors and request it on-demand for QR code).
      // We will skip camera prompt here as best practice is on-demand, but we explain it.

      // 3. Geolocation
      if ('geolocation' in navigator) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, resolve, { timeout: 10000 });
        });
      }

      toast.success('Autorisations configurées avec succès');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      navigate('/services', { replace: true });
    }
  };

  const handleSkip = () => {
    navigate('/services', { replace: true });
  };

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden flex flex-col safe-top safe-bottom">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex-1 px-6 pt-12 pb-6 flex flex-col">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-[28px] bg-accent/10 border border-accent/20 flex flex-col items-center justify-center p-4">
            <ShieldCheck className="w-10 h-10 text-accent mb-1" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Paramétrer votre app</h1>
        <p className="text-center text-white/50 text-sm mb-10 leading-relaxed px-4">
          Pour vous offrir la meilleure expérience, WeGo a besoin de certains accès sur votre téléphone.
        </p>

        <div className="space-y-4 flex-1">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-5 border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Localisation</h3>
              <p className="text-xs text-white/40 mt-1">Pour suivre vos courses et trouver les chauffeurs proches de vous.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-5 border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Notifications</h3>
              <p className="text-xs text-white/40 mt-1">Pour vous avertir de l'arrivée de votre chauffeur ou de votre colis.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-5 border border-white/5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Appareil photo</h3>
              <p className="text-xs text-white/40 mt-1">Pour scanner vos QR Codes de validation lors des réceptions de colis.</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-auto space-y-3 pt-6 shrink-0">
          <button
            onClick={requestPermissions}
            disabled={loading}
            className="w-full py-4 rounded-[20px] bg-accent text-white font-black text-lg shadow-[0_0_40px_rgba(230,32,87,0.3)] active:scale-95 transition-transform"
          >
            {loading ? 'Attribution...' : 'Autoriser les accès'}
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full py-4 rounded-[20px] text-white/40 font-bold text-sm active:scale-95 transition-transform"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsScreen;
