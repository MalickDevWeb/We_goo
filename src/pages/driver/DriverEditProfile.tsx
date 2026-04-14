import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Mail, Save, Camera, Car, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { Driver } from '@/types';

const DriverEditProfile = () => {
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
    vehicleModel: '',
    vehiclePlate: '',
  });

  useEffect(() => {
    if (profile) {
      const driver = profile as Driver;
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        photo: driver.photo || '',
        vehicleModel: driver.vehicleModel || '',
        vehiclePlate: driver.vehiclePlate || '',
      });
    }
  }, [profile]);

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
      const updatedDriver = { ...profile, ...formData } as Driver;
      await api.updateDriver(session.id, updatedDriver);
      setProfile(updatedDriver);
      toast.success(t('common.success'));
      setTimeout(() => navigate('/driver/profile'), 1500);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col safe-top z-[100]">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
        title="Modifier la photo"
        aria-label="Modifier la photo"
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center gap-4 shrink-0">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center active:scale-90 transition-transform shadow-lg border border-white/10"
            aria-label="Retour"
          >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">Profil Chauffeur</h1>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-6 overflow-y-auto no-scrollbar flex flex-col">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-[32px] p-8 border border-white/10 shadow-2xl flex-1 flex flex-col"
        >
          {/* Avatar Edit */}
          <div className="flex flex-col items-center mb-10 shrink-0">
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 rounded-[44px] bg-gradient-to-tr from-accent to-accent2 p-1.5 shadow-2xl shadow-accent/20"
              >
                <div className="w-full h-full rounded-[39px] bg-secondary flex items-center justify-center border-4 border-background overflow-hidden relative">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-accent">{formData.name?.charAt(0) || 'D'}</span>
                  )}
                </div>
              </motion.div>
              <button 
                type="button"
                onClick={triggerFileInput}
                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-xl border-4 border-background active:scale-90 transition-all hover:scale-110"
                aria-label="Modifier la photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/30 ml-1 uppercase tracking-widest">Identité</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all"
                    placeholder="Nom complet"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/30 ml-1 uppercase tracking-widest">Véhicule</label>
                <div className="grid grid-cols-2 gap-3">
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent2 transition-colors">
                        <Car className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent2/40 focus:bg-white/[0.08] transition-all"
                        placeholder="Modèle"
                      />
                   </div>
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent2 transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent2/40 focus:bg-white/[0.08] transition-all"
                        placeholder="Plaque"
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/30 ml-1 uppercase tracking-widest">Contact</label>
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all"
                      placeholder="Téléphone"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-accent h-16 rounded-[24px] flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest shadow-2xl shadow-accent/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 mt-8"
            >
              <Save className="w-5 h-5" />
              {loading ? "Enregistrement..." : "Sauvegarder"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default DriverEditProfile;
