import { motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert, Phone, MessageSquare, AlertTriangle, ShieldCheck, Heart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const DriverEmergency = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const emergencyContacts = [
    { name: 'Police Secours', phone: '17', icon: ShieldAlert, color: 'bg-red-500' },
    { name: 'Ambulance', phone: '18', icon: Heart, color: 'bg-accent2' },
    { name: 'Assistance Wego', phone: '+221770000000', icon: MessageSquare, color: 'bg-accent' },
  ];

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
    toast.info("Lancement de l'appel d'urgence...");
  };

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col pt-8">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center gap-4 shrink-0 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center active:scale-90 transition-transform shadow-lg border border-white/10"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight">Sécurité & Aide</h1>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-24 overflow-y-auto no-scrollbar">
        {/* SOS Button */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="mb-12 text-center"
        >
           <button 
             onClick={() => handleCall('17')}
             className="w-48 h-48 rounded-full bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center mx-auto mb-6 relative group active:scale-95 transition-transform"
           >
              <div className="absolute inset-4 rounded-full bg-red-600 animate-ping opacity-20 pointer-events-none" />
              <div className="w-32 h-32 rounded-full bg-red-600 shadow-[0_0_60px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center">
                 <ShieldAlert className="w-12 h-12 text-white mb-2" />
                 <span className="text-lg font-black text-white uppercase tracking-widest">SOS</span>
              </div>
           </button>
           <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 px-10">Appuyez ici en cas d'urgence immédiate</h2>
        </motion.div>

        {/* Emergency Contacts */}
        <div className="space-y-4 mb-10">
           <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2 mb-4">Contacts d'urgence</h3>
           {emergencyContacts.map((contact, idx) => (
             <motion.button
               key={contact.name}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               onClick={() => handleCall(contact.phone)}
               className="w-full glass-strong rounded-[28px] p-5 flex items-center justify-between border border-white/5 active:bg-white/5 transition-colors"
             >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl ${contact.color} flex items-center justify-center shadow-lg`}>
                      <contact.icon className="w-6 h-6 text-white" />
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-white leading-none mb-1">{contact.name}</p>
                      <p className="text-xs text-white/30 font-bold">{contact.phone}</p>
                   </div>
                </div>
                <Phone className="w-5 h-5 text-white/20" />
             </motion.button>
           ))}
        </div>

        {/* Safety Tips */}
        <div className="glass-strong rounded-[32px] p-8 border border-white/5 bg-white/[0.02] mb-10">
           <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-accent2" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Conseils de Sécurité</h3>
           </div>
           <ul className="space-y-4">
              {[
                "Vérifiez toujours l'identité du passager",
                "Suivez uniquement l'itinéraire de l'application",
                "Signalez tout comportement suspect immédiatement"
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                   <AlertTriangle className="w-4 h-4 text-accent/40 mt-0.5 shrink-0" />
                   <p className="text-xs text-white/50 leading-relaxed">{tip}</p>
                </li>
              ))}
           </ul>
        </div>
      </main>
    </div>
  );
};

export default DriverEmergency;
