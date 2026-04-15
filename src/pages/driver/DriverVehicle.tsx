import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Car, FileText, CheckCircle2, ShieldCheck, UploadCloud, AlertCircle, ScanLine, BadgeCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Driver } from '@/types';
import { toast } from 'sonner';

const DriverVehicle = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, profile, setProfile } = useAuthStore();
  const driver = profile as Driver | null;

  const [formData, setFormData] = useState({
    vehicleBrand: driver?.vehicleBrand || '',
    vehicleModel: driver?.vehicleModel || '',
    vehiclePlate: driver?.vehiclePlate || '',
    licenseNumber: driver?.licenseNumber || '',
  });

  const [loading, setLoading] = useState(false);
  
  // Scanning state
  const [scanningDoc, setScanningDoc] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<'uploading' | 'scanning' | 'certified'>('uploading');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);
    try {
      const updated = await api.updateDriver(session.id, formData);
      setProfile(updated);
      toast.success('Informations mises à jour avec succès');
      setTimeout(() => navigate(-1), 1000);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const startScan = (type: string) => {
     setScanningDoc(type);
     setScanStep('uploading');
     
     // Simulate file picking / uploading
     setTimeout(() => {
        setScanStep('scanning');
        // Simulate scanning process
        setTimeout(() => {
           setScanStep('certified');
           toast.success(`${type} certifié avec succès !`);
           // Auto close after showing certification
           setTimeout(() => {
             setScanningDoc(null);
           }, 2500);
        }, 3000);
     }, 1000);
  };

  return (
    <div className="h-[100svh] bg-[#020617] relative flex flex-col safe-top overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full glass-strong border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg bg-black/40"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-white font-black uppercase tracking-widest text-xs">Véhicule & Docs</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
           <Car className="w-5 h-5 text-blue-500" />
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-24 h-full">
         <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start mb-8">
            <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
            <p className="text-xs text-white/70 leading-relaxed font-bold">
               Les informations concernant votre véhicule et vos documents d'identité sont strictement confidentielles et requises par la loi pour exercer sur Wego.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Documents section */}
            <div>
               <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  Documents & Certifications
               </h2>

               <div className="space-y-3">
                  <button type="button" onClick={() => startScan("Carte d'Identité (CNI)")} className="w-full bg-[#020617]/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all relative overflow-hidden">
                     <div className="flex flex-col text-left relative z-10">
                        <span className="text-white font-black text-sm mb-0.5">Carte d'Identité Nationale</span>
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-1">
                           <UploadCloud className="w-3 h-3" /> À fournir
                        </span>
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 relative z-10">
                        <ScanLine className="w-5 h-5 text-accent transition-colors" />
                     </div>
                  </button>

                  <button type="button" onClick={() => startScan("Permis de Conduire")} className="w-full bg-[#020617]/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
                     <div className="flex flex-col text-left">
                        <span className="text-white font-black text-sm mb-0.5">Permis de conduire</span>
                        <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest flex items-center gap-1">
                           <CheckCircle2 className="w-3 h-3" /> Certifié
                        </span>
                     </div>
                     <UploadCloud className="w-5 h-5 text-white/30 group-hover:text-accent transition-colors" />
                  </button>

                  <button type="button" onClick={() => startScan("Assurance")} className="w-full bg-[#020617]/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
                     <div className="flex flex-col text-left">
                        <span className="text-white font-black text-sm mb-0.5">Assurance Véhicule</span>
                        <span className="text-[10px] text-orange-500 uppercase font-black tracking-widest flex items-center gap-1">
                           <AlertCircle className="w-3 h-3" /> Expire bientôt
                        </span>
                     </div>
                     <UploadCloud className="w-5 h-5 text-white/30 group-hover:text-accent transition-colors" />
                  </button>
               </div>
            </div>

            {/* Vehicle Details */}
            <div>
               <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 mt-8 flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-accent2" />
                  Détails du Véhicule
               </h2>

               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-1 mb-2 block">Marque (ex: Toyota)</label>
                   <input
                     type="text"
                     value={formData.vehicleBrand}
                     onChange={(e) => setFormData(prev => ({ ...prev, vehicleBrand: e.target.value }))}
                     className="w-full bg-[#020617]/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                     placeholder="Marque du véhicule"
                   />
                 </div>
                 
                 <div>
                   <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-1 mb-2 block">Modèle (ex: Corolla)</label>
                   <input
                     type="text"
                     value={formData.vehicleModel}
                     onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                     className="w-full bg-[#020617]/50 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                     placeholder="Modèle du véhicule"
                   />
                 </div>

                 <div>
                   <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-1 mb-2 block">Plaque d'immatriculation</label>
                   <input
                     type="text"
                     value={formData.vehiclePlate}
                     onChange={(e) => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                     className="w-full bg-[#020617]/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono uppercase placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                     placeholder="XX-123-YY"
                   />
                 </div>
               </div>
            </div>

            <motion.button
               whileTap={{ scale: 0.95 }}
               type="submit"
               disabled={loading}
               className="w-full py-4 mt-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
             >
               {loading ? 'Sauvegarde...' : 'Appliquer les modifications'}
            </motion.button>
         </form>
      </div>

      {/* --- Fullscreen Scanning Overlay --- */}
      <AnimatePresence>
         {scanningDoc && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-[500] bg-[#020617]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
            >
               <button 
                  onClick={() => setScanningDoc(null)} 
                  aria-label="Fermer"
                  className="absolute top-16 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
               >
                  <X className="w-5 h-5 text-white" />
               </button>

               <div className="w-full max-w-sm">
                  <h3 className="text-xl font-black text-white text-center mb-8">{scanningDoc}</h3>

                  <div className="relative w-full aspect-[1.58] rounded-3xl border-2 border-white/20 bg-white/5 overflow-hidden shadow-2xl flex items-center justify-center mb-8">
                     {scanStep === 'uploading' && (
                        <div className="text-center animate-pulse">
                           <UploadCloud className="w-12 h-12 text-white/40 mx-auto mb-3" />
                           <p className="text-xs uppercase tracking-widest text-white/50 font-black">Sélectionnez le fichier</p>
                        </div>
                     )}

                     {scanStep === 'scanning' && (
                        <div className="absolute inset-0">
                           {/* Document Mockup Placeholder inside the scanner line */}
                           <div className="absolute inset-4 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-end p-4">
                              <div className="w-2/3 h-2 bg-white/10 rounded-full mb-2" />
                              <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                           </div>
                           
                           {/* Laser Line */}
                           <motion.div
                              initial={{ top: 0 }}
                              animate={{ top: '100%' }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                              className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_20px_rgba(230,32,87,1)]"
                           />
                           {/* Scanner Glow */}
                           <motion.div
                              initial={{ top: -50 }}
                              animate={{ top: '100%' }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                              className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent to-accent/20"
                           />
                        </div>
                     )}

                     {scanStep === 'certified' && (
                        <motion.div 
                           initial={{ scale: 0.5, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-emerald-500/50 rounded-3xl"
                        >
                           <BadgeCheck className="w-16 h-16 text-emerald-500 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                           <p className="text-sm uppercase tracking-widest text-white font-black">Certifié Wego</p>
                        </motion.div>
                     )}
                  </div>

                  <div className="text-center">
                     {scanStep === 'uploading' && <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">En attente du fichier...</p>}
                     {scanStep === 'scanning' && (
                        <div className="flex items-center justify-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                           <p className="text-[10px] text-accent font-black uppercase tracking-widest">Analyse OCR par IA en cours...</p>
                        </div>
                     )}
                     {scanStep === 'certified' && <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Document validé et enregistré.</p>}
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default DriverVehicle;
