import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, KeyRound, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UserSecurity = () => {
  const navigate = useNavigate();
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="h-full bg-background relative overflow-hidden flex flex-col safe-top pb-safe">
      <div className="absolute top-0 right-0 w-full h-40 bg-green-500/10 blur-[120px] pointer-events-none" />
      
      <div className="flex items-center px-6 pt-6 mb-6">
        <button onClick={() => navigate(-1)} aria-label="Retour" className="w-10 h-10 rounded-full glass flex items-center justify-center p-0 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-black text-foreground ml-4">Sécurité du Compte</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-20 no-scrollbar relative z-10">
        
        {/* Password block */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[32px] p-5 shadow-2xl border border-white/5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center border border-foreground/10">
              <KeyRound className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground">Mot de passe</h2>
              <p className="text-[10px] text-muted-foreground font-bold tracking-wide mt-0.5">Dernière modification: il y a 3 mois</p>
            </div>
          </div>
          <button onClick={() => toast.success('Mail de réinitialisation envoyé')} className="w-full py-4 rounded-2xl bg-white/5 text-foreground font-bold text-sm border border-white/10 active:bg-white/10 transition-colors">
            Modifier le mot de passe
          </button>
        </motion.div>

        {/* 2FA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-[32px] p-5 shadow-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-black text-foreground">Authentification 2FA</h2>
              <p className="text-[10px] text-muted-foreground font-bold tracking-wide mt-0.5">Protection par SMS et Email</p>
            </div>
            <div 
              onClick={() => { setTwoFactor(!twoFactor); toast.success(twoFactor ? '2FA Désactivée' : '2FA Activée !'); }}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${twoFactor ? 'bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </motion.div>

        {/* Connected devices */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">Appareils Connectés</h3>
          <div className="glass rounded-[32px] border border-white/5 flex flex-col overflow-hidden">
            <div className="p-5 flex items-center gap-4 border-b border-white/5 relative bg-white/5">
              <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-foreground">iPhone 14 Pro</p>
                <p className="text-[10px] text-green-500 font-bold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Appareil Actuel
                </p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center shrink-0">
                <Laptop className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-muted-foreground">MacBook Air M2</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Dernière activité: hier, 14:02</p>
              </div>
              <button 
                onClick={() => toast.success('Appareil déconnecté')}
                className="text-xs font-bold text-destructive hover:text-white transition-colors"
               >
                Déconnecter
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default UserSecurity;
