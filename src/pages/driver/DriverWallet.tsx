import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Driver, Transaction } from '@/types';

const DriverWallet = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, profile } = useAuthStore();
  const driver = profile as Driver | null;
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (session) api.getTransactionsByUser(session.id).then(setTransactions);
  }, [session]);

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden flex flex-col safe-top">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full glass-strong border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex flex-col items-center">
          <img src="/wego-logo.svg" alt="Wego" className="h-10 w-auto drop-shadow-lg" />
        </div>
        <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
           <Wallet className="w-5 h-5 text-accent" />
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-24">
        <h1 className="text-3xl font-black text-white tracking-tight mb-8">Votre Portefeuille</h1>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-[40px] p-8 text-center mb-6 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent2/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30 mb-3">{t('driver.wallet.balance')}</p>
          <p className="text-5xl font-black text-white tracking-tighter mb-4">
            {driver?.walletBalance?.toLocaleString() || '0'} <span className="text-xl text-white/30 ml-1">CFA</span>
          </p>
          <button className="px-6 py-2.5 rounded-full bg-accent2 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent2/30 active:scale-95 transition-transform">
             Retirer les fonds
          </button>
        </motion.div>

        {/* Commission & Debt */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong rounded-[28px] p-5 border border-white/5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
              <ArrowUpCircle className="w-5 h-5 text-accent2" />
            </div>
            <p className="text-xl font-black text-white tracking-tight">450 <span className="text-[10px] text-white/30 ml-0.5">CFA</span></p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{t('driver.wallet.commission')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-strong rounded-[28px] p-5 border border-white/5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-xl font-black text-destructive tracking-tight">{driver?.debt || 0} <span className="text-[10px] text-destructive/40 ml-0.5">CFA</span></p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{t('driver.wallet.debt')}</p>
          </motion.div>
        </div>

        {/* Transactions */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">{t('user.wallet.transactions')}</h2>
          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Tout voir</span>
        </div>

        {transactions.length === 0 ? (
          <div className="glass-strong rounded-[32px] p-10 text-center border border-white/5 opacity-40 bg-white/[0.02]">
            <p className="text-xs font-black text-white uppercase tracking-widest">{t('user.wallet.noTransactions')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-strong rounded-[24px] p-5 flex items-center justify-between border border-white/5 group hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
                    tx.type === 'credit' ? 'bg-accent2/10 border-accent2/20 text-accent2' : 'bg-accent/10 border-accent/20 text-accent'
                  }`}>
                    {tx.type === 'credit' ? (
                      <ArrowUpCircle className="w-6 h-6" />
                    ) : (
                      <ArrowDownCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white mb-0.5 leading-tight">{tx.title}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-lg font-black tracking-tight ${tx.type === 'credit' ? 'text-accent2' : 'text-white'}`}>
                     {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                   </p>
                   <p className="text-[9px] font-bold text-white/20 uppercase">CFA</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverWallet;
