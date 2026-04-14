import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, LogOut, Globe, Shield, CreditCard, HelpCircle, ChevronRight, Bell, Star, Car, ShieldCheck } from 'lucide-react';
import { changeLanguage } from '@/i18n';
import i18n from '@/i18n';
import type { Driver } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import * as api from '@/services/api';
import driverPhoto from '@/assets/driver-roberto.png';

const DriverProfile = () => {
  const { t } = useTranslation();
  const { session, profile, setProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const driver = profile as Driver | null;

  useEffect(() => {
    if (session && !profile) {
      api.getDriverById(session.id).then(d => d && setProfile(d));
    }
  }, [session, profile, setProfile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && session && profile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const updatedDriver = { ...profile, photo: reader.result as string } as Driver;
          await api.updateDriver(session.id, updatedDriver);
          setProfile(updatedDriver);
          toast.success(t('common.success'));
        } catch (err) {
          toast.error(t('common.error'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'fr' : 'en';
    changeLanguage(next);
  };

  const menuSections = [
    {
      title: "Gestion du Compte",
      items: [
        { icon: User, label: "Informations Chauffeur", color: 'text-accent', onClick: () => navigate('/driver/profile/edit') },
        { icon: Car, label: "Véhicule & Documents", color: 'text-accent2', onClick: () => navigate('/driver/profile/vehicle') },
        { icon: Shield, label: "Sécurité & SOS", color: 'text-red-500', onClick: () => navigate('/driver/emergency') },
      ]
    },
    {
      title: "Paramètres",
      items: [
        { icon: Globe, label: t('user.profile.language'), rightLabel: i18n.language.toUpperCase(), onClick: toggleLang, color: 'text-blue-500' },
        { icon: Bell, label: t('user.profile.notifications'), color: 'text-orange-500', onClick: () => navigate('/driver/notifications') },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Aide & Contact", color: 'text-purple-500', onClick: () => navigate('/driver/emergency') },
      ]
    }
  ];

  return (
    <div className="h-full relative overflow-hidden bg-background flex flex-col pt-8">
      {/* Background Neon Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
        title="Changer de photo"
        aria-label="Changer de photo"
      />

      <div className="relative z-10 px-6 pb-24 h-full overflow-y-auto no-scrollbar">
        {/* Header Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="relative inline-block mb-6">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               className="w-28 h-28 rounded-[40px] bg-gradient-to-tr from-accent to-accent2 p-1.5 shadow-[0_20px_40px_rgba(230,32,87,0.3)]"
             >
                <div className="w-full h-full rounded-[34px] bg-secondary flex items-center justify-center border-4 border-background overflow-hidden relative group">
                  <img src={driverPhoto} alt={driver?.name} className="w-full h-full object-cover" />
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <span className="text-[10px] font-black text-white uppercase tracking-widest text-center px-4">Modifier la photo</span>
                  </div>
                </div>
             </motion.div>
             <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-2xl bg-accent2 flex items-center justify-center border-4 border-background shadow-xl">
                <Star className="w-4 h-4 text-white fill-white" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-accent flex items-center justify-center border-4 border-background shadow-xl">
                <ShieldCheck className="w-4 h-4 text-white" />
             </div>
          </div>
          
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{driver?.name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="bg-accent2/10 px-3 py-1.5 rounded-full text-[10px] font-black text-accent2 uppercase tracking-widest border border-accent2/20">4.95 ★ Rating</span>
            <span className="bg-accent/10 px-3 py-1.5 rounded-full text-[10px] font-black text-accent uppercase tracking-widest border border-accent/20">Wego Premium</span>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-10">
           {[
             { label: 'Courses', val: driver?.todayRides || '124' },
             { label: 'Ans', val: '2' },
             { label: 'Gains', val: '250k' }
           ].map((s, i) => (
             <div key={i} className="glass-strong rounded-3xl p-4 text-center border border-white/5">
                <p className="text-xl font-black text-white leading-none mb-1">{s.val}</p>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{s.label}</p>
             </div>
           ))}
        </div>

        {/* Menu Sections */}
        <div className="space-y-8">
          {menuSections.map((section, sidx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * sidx }}
            >
              <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 px-2">{section.title}</h2>
              <div className="glass-strong rounded-[32px] overflow-hidden border border-white/5 bg-white/[0.02]">
                {section.items.map((item, iidx) => (
                  <button 
                    key={item.label}
                    onClick={item.onClick}
                    className={`w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors ${iidx !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-sm font-black text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.rightLabel && <span className="text-[9px] font-black text-white/20 bg-white/5 px-2 py-1 rounded-lg uppercase">{item.rightLabel}</span>}
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logout */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogout}
          className="mt-12 w-full flex items-center justify-center gap-3 p-5 rounded-[28px] glass border border-accent/10 text-accent font-black text-sm active:scale-95 transition-all shadow-xl shadow-accent/5 hover:bg-accent/5"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion du service
        </motion.button>
      </div>
    </div>
  );
};

export default DriverProfile;
