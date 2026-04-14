import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, LogOut, Globe, Shield, CreditCard, HelpCircle, ChevronRight, Bell } from 'lucide-react';
import { changeLanguage } from '@/i18n';
import i18n from '@/i18n';
import type { User as UserType } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import * as api from '@/services/api';

const UserProfile = () => {
  const { t } = useTranslation();
  const { session, profile, setProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const user = profile as UserType | null;

  useEffect(() => {
    if (session && !profile) {
      api.getUserById(session.id).then(u => u && setProfile(u));
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
          const updatedUser = { ...profile, photo: reader.result as string } as UserType;
          await api.updateUser(session.id, updatedUser);
          setProfile(updatedUser);
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
    const next = i18n.language === 'es' ? 'fr' : 'es';
    changeLanguage(next);
  };

  const menuSections = [
    {
      title: t('user.profile.account'),
      items: [
        { icon: User, label: t('user.profile.personalInfo'), color: 'text-accent', onClick: () => navigate('/user/profile/edit') },
        { icon: Shield, label: t('user.profile.security'), color: 'text-green-500', onClick: () => navigate('/user/security') },
      ]
    },
    {
      title: t('user.profile.preferences'),
      items: [
        { icon: Globe, label: t('user.profile.language'), rightLabel: i18n.language.toUpperCase(), onClick: toggleLang, color: 'text-blue-500' },
        { icon: Bell, label: t('user.profile.notifications'), color: 'text-orange-500', onClick: () => navigate('/user/notifications') },
      ]
    },
    {
      title: t('user.profile.support'),
      items: [
        { icon: HelpCircle, label: t('user.profile.helpCenter'), color: 'text-purple-500', onClick: () => navigate('/user/emergency') },
      ]
    }
  ];

  return (
    <div className="h-full relative overflow-hidden bg-background flex flex-col">
      {/* Mesh Background Effect */}
      <div className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none opacity-40">
        <div className="absolute -top-[100px] -left-[50px] w-[300px] h-[300px] bg-accent/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[50px] -right-[50px] w-[250px] h-[250px] bg-accent2/20 rounded-full blur-[80px]" />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
        title={t('user.profile.editPhoto')}
        aria-label={t('user.profile.editPhoto')}
      />

      <div className="relative z-10 safe-top px-6 pb-24 h-full overflow-y-auto no-scrollbar">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 mb-8 text-center"
        >
          <div className="relative inline-block mb-4">
             <motion.div 
               whileHover={{ scale: 1.05 }}
               className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-accent to-accent2 p-1.5 shadow-2xl shadow-accent/20"
             >
                <div className="w-full h-full rounded-[26px] bg-secondary flex items-center justify-center border-2 border-background overflow-hidden relative group">
                  {user?.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-accent">{user?.name?.charAt(0) || 'U'}</span>
                  )}
                  <div 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t('user.profile.editPhoto')}</span>
                  </div>
                </div>
             </motion.div>
             <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-accent2 flex items-center justify-center border-4 border-background shadow-lg">
                <Shield className="w-3.5 h-3.5 text-white" />
             </div>
          </div>
          
          <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">{user?.name}</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="bg-accent/10 px-3 py-1 rounded-full text-[10px] font-black text-accent uppercase tracking-tighter border border-accent/10">Membre Gold</span>
            <span className="text-xs text-muted-foreground font-bold">{user?.phone}</span>
          </div>
        </motion.div>

        {/* Menu Sections */}
        <div className="space-y-8">
          {menuSections.map((section, sidx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * sidx }}
            >
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">{section.title}</h2>
              <div className="glass rounded-[32px] overflow-hidden border border-white/5">
                {section.items.map((item, iidx) => (
                  <button 
                    key={item.label}
                    onClick={item.onClick}
                    className={`w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors ${iidx !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.rightLabel && <span className="text-[10px] font-black text-muted-foreground bg-white/5 px-2 py-1 rounded-lg uppercase">{item.rightLabel}</span>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
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
          className="mt-12 w-full flex items-center justify-center gap-3 p-5 rounded-[28px] glass border border-destructive/10 text-destructive font-black text-sm active:scale-95 transition-all shadow-xl shadow-destructive/5 hover:bg-destructive/5"
        >
          <LogOut className="w-5 h-5" />
          {t('common.logout')}
        </motion.button>
      </div>
    </div>
  );
};

export default UserProfile;
