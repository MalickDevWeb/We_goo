import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BellRing, Smartphone, Mail, TicketPercent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UserNotifications = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    push: true,
    sms: false,
    email: true,
    promo: true
  });

  const toggle = (key: keyof typeof preferences) => {
    setPreferences(p => ({ ...p, [key]: !p[key] }));
    toast.success('Préférences mises à jour');
  };

  const ToggleSwitch = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${active ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-white/10'}`}>
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col safe-top pb-safe">
      <div className="absolute top-0 left-0 w-full h-40 bg-orange-500/10 blur-[100px] pointer-events-none" />
      
      <div className="flex items-center px-6 pt-6 mb-6">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="w-10 h-10 rounded-full glass flex items-center justify-center p-0 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-black text-foreground ml-4">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-20 no-scrollbar relative z-10">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">Canaux de réception</h3>
          <div className="glass rounded-[32px] border border-white/5 flex flex-col overflow-hidden">
            
            <div className="p-5 flex items-center gap-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                <BellRing className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-foreground">Notifications Push</p>
                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Alertes sur le téléphone</p>
              </div>
              <ToggleSwitch active={preferences.push} onClick={() => toggle('push')} />
            </div>

            <div className="p-5 flex items-center gap-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center border border-white/10 shrink-0">
                <Smartphone className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-foreground">SMS & Textos</p>
                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Mises à jour du chauffeur</p>
              </div>
              <ToggleSwitch active={preferences.sms} onClick={() => toggle('sms')} />
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                <Mail className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-foreground">Emails</p>
                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Reçus, factures et news</p>
              </div>
              <ToggleSwitch active={preferences.email} onClick={() => toggle('email')} />
            </div>

          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">Publicité & Offres</h3>
          <div className="glass rounded-[32px] border border-white/5 p-5 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-accent2/10 flex items-center justify-center border border-accent2/20 shrink-0">
                <TicketPercent className="w-6 h-6 text-accent2" />
             </div>
             <div className="flex-1">
                <p className="text-sm font-black text-foreground">Promotions exclusives</p>
                <p className="text-[10px] text-muted-foreground font-bold mt-0.5 leading-tight pr-2">Codes promos, fidélité et évènements Wego.</p>
             </div>
             <ToggleSwitch active={preferences.promo} onClick={() => toggle('promo')} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default UserNotifications;
