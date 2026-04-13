import { motion } from 'framer-motion';
import { ShieldAlert, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';

const BlockedScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center mb-8 border border-destructive/20"
      >
        <ShieldAlert className="w-12 h-12 text-destructive" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-4xl font-black text-foreground mb-4 tracking-tight"
      >
        {t('blocked.title')}
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-lg mb-12 max-w-md leading-relaxed"
      >
        {t('blocked.desc')}
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 w-full max-w-sm gap-4 mb-12"
      >
        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="bg-accent/10 p-3 rounded-xl">
            <Phone className="w-6 h-6 text-accent" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t('blocked.supportPhone')}</p>
            <p className="text-sm font-bold text-foreground">+54 11 5555-0000</p>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl flex items-center gap-4 border border-white/5">
          <div className="bg-accent2/10 p-3 rounded-xl">
            <Mail className="w-6 h-6 text-accent2" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t('blocked.supportEmail')}</p>
            <p className="text-sm font-bold text-foreground">soporte@wego.app</p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={handleLogout}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-widest text-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('blocked.backToLogin')}
      </motion.button>

      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};

export default BlockedScreen;
