import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Mail, Save, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { User as UserType } from '@/types';

const UserEditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    photo: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        photo: profile.photo || '',
      });
    } else if (session) {
      api.getUserById(session.id).then(u => {
        if (u) {
          setProfile(u);
          setFormData({
            name: u.name || '',
            phone: u.phone || '',
            email: u.email || '',
            photo: u.photo || '',
          });
        }
      });
    }
  }, [profile, session, setProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
        toast.info(t('common.success'));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    setLoading(true);
    try {
      const updatedUser = { ...profile, ...formData } as UserType;
      await api.updateUser(session.id, updatedUser);
      setProfile(updatedUser);
      toast.success(t('common.success'));
      setTimeout(() => navigate('/user/profile'), 1500);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col safe-top">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/15 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent2/10 rounded-full blur-[120px]" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
        title={t('user.profile.editPhoto')}
        aria-label={t('user.profile.editPhoto')}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center gap-4 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center active:scale-90 transition-transform shadow-lg border border-white/10"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">{t('user.profile.personalInfo')}</h1>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-[32px] p-6 border border-white/10 shadow-2xl flex-1 flex flex-col"
        >
          {/* Avatar Edit */}
          <div className="flex flex-col items-center mb-8 shrink-0">
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-accent to-accent2 p-1 shadow-2xl shadow-accent/20"
              >
                <div className="w-full h-full rounded-[31px] bg-secondary flex items-center justify-center border-2 border-background overflow-hidden relative">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-accent">{formData.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
              </motion.div>
              <button 
                type="button"
                onClick={triggerFileInput}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-xl border-4 border-background active:scale-90 transition-all hover:scale-110"
                aria-label={t('user.profile.editPhoto')}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/50 ml-1 uppercase tracking-widest">{t('user.profile.name')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                    placeholder={t('auth.namePlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/50 ml-1 uppercase tracking-widest">{t('user.profile.phone')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                    placeholder={t('auth.phonePlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/50 ml-1 uppercase tracking-widest">{t('user.profile.email')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                    placeholder={t('auth.email')}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-accent h-14 rounded-2xl flex items-center justify-center gap-3 text-white font-bold shadow-xl shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shrink-0 mt-4"
            >
              <Save className="w-5 h-5" />
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default UserEditProfile;
