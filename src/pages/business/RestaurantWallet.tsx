import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Download,
  CreditCard,
  History,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const RestaurantWallet = () => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();

  const transactions = [
    { id: '1', title: 'Versement Wego', amount: 45200, date: 'Aujourd\'hui', type: 'credit' },
    { id: '2', title: 'Retrait Orange Money', amount: -25000, date: 'Hier', type: 'debit' },
    { id: '3', title: 'Versement Wego', amount: 38500, date: '12 Avr 2026', type: 'credit' },
    { id: '4', title: 'Commission Wego (15%)', amount: -15000, date: '11 Avr 2026', type: 'debit' },
  ];

  return (
    <div className="h-full bg-background flex flex-col pt-8 overflow-hidden relative">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0 mb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl glass-strong flex items-center justify-center border border-white/10">
              <WalletIcon className="w-6 h-6 text-amber-500" />
           </div>
           <h1 className="text-2xl font-black text-white tracking-tight">Portefeuille</h1>
        </div>
        <button 
          aria-label="Gérer les cartes"
          className="w-12 h-12 rounded-2xl glass-strong border border-white/10 flex items-center justify-center text-white/60"
        >
           <CreditCard className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 relative z-10">
        
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-[40px] p-8 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent relative overflow-hidden mb-10 shadow-2xl shadow-amber-500/5"
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-x-4 -translate-y-8" />
           <div className="flex items-center gap-2 mb-6 opacity-40">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Solde Business</span>
           </div>
           <h2 className="text-4xl font-black text-white tracking-tight mb-2">
              {(profile?.walletBalance || 452000).toLocaleString()} <span className="text-lg text-white/30 ml-1">CFA</span>
           </h2>
           <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Mis à jour en temps réel</p>

           <div className="flex gap-4 mt-8">
              <button className="flex-1 h-16 rounded-[24px] bg-amber-500 text-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                 <ArrowUpRight className="w-5 h-5" />
                 <span className="text-xs font-black uppercase tracking-widest">Retirer</span>
              </button>
              <button className="w-16 h-16 rounded-[24px] glass-strong flex items-center justify-center text-white/60 active:scale-95 transition-all border border-white/10">
                 <Download className="w-5 h-5" />
              </button>
           </div>
        </motion.div>

        {/* Stats Row */}
        <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
           <div className="shrink-0 p-5 rounded-[28px] glass-strong border border-white/5 min-w-[160px]">
              <div className="flex items-center gap-2 mb-3">
                 <TrendingUp className="w-4 h-4 text-green-500" />
                 <span className="text-[9px] font-black text-white/40 uppercase">Revenus (7j)</span>
              </div>
              <p className="text-lg font-black text-white">+ 245K</p>
           </div>
           <div className="shrink-0 p-5 rounded-[28px] glass-strong border border-white/5 min-w-[160px]">
              <div className="flex items-center gap-2 mb-3">
                 <TrendingDown className="w-4 h-4 text-red-500" />
                 <span className="text-[9px] font-black text-white/40 uppercase">Retraits (7j)</span>
              </div>
              <p className="text-lg font-black text-white">- 120K</p>
           </div>
        </div>

        {/* Transactions */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] opacity-40">Transactions</h3>
              <button className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Voir tout</button>
           </div>
           
           <div className="space-y-4">
              {transactions.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-3xl glass-strong border border-white/5"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/30'}`}>
                         {tx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-white">{tx.title}</h4>
                         <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{tx.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-green-500' : 'text-white'}`}>
                         {tx.type === 'credit' ? '+' : ''}{tx.amount.toLocaleString()} CFA
                      </p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
};

export default RestaurantWallet;
