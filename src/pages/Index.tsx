import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Premium Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-32 h-32 rounded-[40px] glass flex items-center justify-center mb-8 shadow-2xl border border-white/10">
          <img 
            src="/images/logo/wego_logo.svg" 
            alt="Wego" 
            className="w-20 h-20 drop-shadow-lg"
          />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Wego</h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Chargement de votre univers</span>
          </div>
        </div>
      </motion.div>
      
      <div className="fixed bottom-12 text-[10px] font-bold text-white/10 uppercase tracking-[0.5em]">
        Wego Ecosystem v2.0
      </div>
    </div>
  );
};

export default Index;
