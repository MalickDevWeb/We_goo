import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Wallet, Plus, ArrowUpCircle, ArrowDownCircle, Car, TrendingUp, 
  ChevronRight, Eye, EyeOff, Smartphone, CreditCard, Landmark 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { Transaction, User } from '@/types';

const UserWallet = () => {
  const { t } = useTranslation();
  const { session, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRecharge, setShowRecharge] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'orange' | 'card' | 'wu'>('card');

  const user = profile as User | null;

  const paymentMethods = [
    { id: 'wave', label: 'Wave', icon: Smartphone, color: 'bg-blue-500' },
    { id: 'orange', label: 'Orange Money', icon: Smartphone, color: 'bg-orange-500' },
    { id: 'card', label: 'Carte Bancaire', icon: CreditCard, color: 'bg-emerald-500' },
    { id: 'wu', label: 'Western Union', icon: Landmark, color: 'bg-yellow-500' },
  ];

  useEffect(() => {
    if (session) {
      api.getTransactionsByUser(session.id).then(setTransactions);
      if (!profile) {
        api.getUserById(session.id).then(u => {
          if (u) setProfile(u);
        });
      }
    }
  }, [session, profile]);

  const handleRecharge = async () => {
    const amount = parseInt(rechargeAmount);
    if (!amount || amount <= 0 || !session || !user) {
      toast.error(t('common.error'));
      return;
    }
    
    setLoading(true);
    try {
      // Simulation d'un délai de paiement mobile/banque
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBalance = (user?.walletBalance || 0) + amount;
      await api.updateUser(session.id, { walletBalance: newBalance });
      
      const methodLabel = paymentMethods.find(m => m.id === selectedMethod)?.label || 'Card';
      
      await api.createTransaction({
        userId: session.id,
        type: 'credit',
        title: `${t('user.wallet.recharge')} (${methodLabel})`,
        amount,
        date: new Date().toISOString().split('T')[0],
        balance: newBalance,
      });
      
      if (user) setProfile({ ...user, walletBalance: newBalance });
      const txs = await api.getTransactionsByUser(session.id);
      setTransactions(txs);
      
      setRechargeAmount('');
      setShowRecharge(false);
      toast.success(t('user.wallet.rechargeSuccess', { amount: amount.toString() }));
    } catch (error) {
      console.error('Recharge Error:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-[#0A0A0B] relative overflow-hidden flex flex-col safe-top">
      {/* Background Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px]" />


      <main className="relative z-10 flex-1 px-6 pt-[15px] pb-4 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden pr-1 -mr-1">
          {/* Virtual 3D Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative aspect-[1.8/1] w-full mb-8 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/80 to-secondary rounded-[28px] shadow-2xl shadow-accent/20" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 rounded-[28px]" />
            
            <div className="absolute inset-[1px] bg-white/5 backdrop-blur-sm rounded-[27px] border border-white/20 p-5 flex flex-col justify-between overflow-hidden text-white">
               <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-12 transition-transform duration-1000 group-hover:translate-x-[20%] group-hover:translate-y-[20%]" />
               
               <div className="flex justify-between items-start relative z-10">
                  <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-yellow-400/80 to-yellow-600/80 border border-white/20 flex items-center justify-center overflow-hidden">
                     <div className="w-full h-[1px] bg-black/10 absolute top-1/4" />
                     <div className="w-full h-[1px] bg-black/10 absolute top-1/2" />
                     <div className="w-full h-[1px] bg-black/10 absolute top-3/4" />
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-[9px] font-black text-white/60 uppercase tracking-widest italic leading-none">Wego Premium</p>
                      <div className="flex gap-1 mt-0.5 justify-end">
                        <div className="w-3 h-3 rounded-full bg-accent2/80" />
                        <div className="w-3 h-3 rounded-full bg-accent/80 -ml-1.5" />
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center active:scale-90 transition-all border border-white/10"
                    >
                      {showBalance ? <EyeOff className="w-4 h-4 text-white/70" /> : <Eye className="w-4 h-4 text-white/70" />}
                    </button>
                  </div>
               </div>
  
               <div className="relative z-10">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">{t('user.wallet.balance')}</p>
                  <motion.p 
                    key={showBalance ? user?.walletBalance : 'hidden'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-black text-white tracking-tighter"
                  >
                    {showBalance ? `$${user?.walletBalance?.toLocaleString() || '0'}` : '•••••'}
                  </motion.p>
               </div>
  
               <div className="flex justify-between items-end relative z-10">
                  <div className="flex-1" />
                  <div className="text-right">
                     <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Expires</p>
                     <p className="text-[10px] font-black text-white uppercase tracking-wider">∞ / ∞</p>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="glass rounded-[24px] p-4 border border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                   <Car className="w-4 h-4 text-accent" />
                </div>
                <div>
                   <p className="text-lg font-black text-white leading-tight">{user?.totalRides || 0}</p>
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">{t('user.dashboard.rides')}</p>
                </div>
             </div>
             <div className="glass rounded-[24px] p-4 border border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent2/10 flex items-center justify-center">
                   <TrendingUp className="w-4 h-4 text-accent2" />
                </div>
                <div>
                   <p className="text-lg font-black text-white leading-tight">${user?.totalSpent || 0}</p>
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">{t('user.dashboard.spent')}</p>
                </div>
             </div>
          </div>

          {/* Recharge Section */}
          <div className="mb-8">
             <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('user.wallet.recharge')}</h2>
                <button 
                  onClick={() => setShowRecharge(!showRecharge)}
                  className="text-[10px] font-black text-accent uppercase tracking-widest"
                >
                  {showRecharge ? t('common.cancel') : t('common.expand')}
                </button>
             </div>

             <div className="glass rounded-[28px] p-2 border border-white/5">
                {!showRecharge ? (
                  <button 
                    onClick={() => setShowRecharge(true)}
                    className="w-full h-16 flex items-center justify-between px-6 bg-accent rounded-[20px] shadow-lg shadow-accent/20 active:scale-[0.98] transition-all tap-target"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                           <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-black text-white">{t('user.wallet.rechargeNow')}</span>
                     </div>
                     <ChevronRight className="w-5 h-5 text-white/40" />
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6">
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-muted-foreground">$</span>
                        <input
                          type="number"
                          value={rechargeAmount}
                          onChange={e => setRechargeAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full py-5 pl-10 pr-6 rounded-[20px] bg-secondary/50 text-xl font-black text-white placeholder:text-muted-foreground outline-none border-2 border-transparent focus:border-accent transition-all text-center"
                        />
                     </div>
                     
                     <div className="grid grid-cols-4 gap-2">
                        {[500, 1000, 2000, 5000].map(a => (
                          <button 
                            key={a} 
                            onClick={() => setRechargeAmount(String(a))} 
                            className={`py-2.5 rounded-[14px] font-black text-[10px] transition-all ${rechargeAmount === String(a) ? 'bg-accent text-white' : 'bg-white/5 text-white active:scale-95'}`}
                          >
                            ${a}
                          </button>
                        ))}
                     </div>

                     <div className="space-y-3">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">{t('user.wallet.paymentMethod')}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {paymentMethods.map(m => (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMethod(m.id as any)}
                              className={`p-3 rounded-[18px] flex items-center gap-2.5 border transition-all ${selectedMethod === m.id ? 'bg-accent/10 border-accent' : 'bg-white/5 border-white/5 active:scale-95'}`}
                            >
                              <div className={`w-7 h-7 rounded-lg ${m.color} flex items-center justify-center shadow-lg`}>
                                <m.icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-[10px] font-black text-white leading-tight">{m.label}</span>
                            </button>
                          ))}
                        </div>
                     </div>

                     {/* Specific Payment Fields */}
                     <motion.div 
                       key={selectedMethod}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="space-y-4 pt-4 border-t border-white/5"
                     >
                        {(selectedMethod === 'wave' || selectedMethod === 'orange') && (
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">
                              Numéro {selectedMethod === 'wave' ? 'Wave' : 'Orange Money'}
                            </p>
                            <input
                              type="tel"
                              placeholder="00 00 00 00"
                              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent"
                            />
                            <p className="text-[8px] text-white/40 px-1">Un message de confirmation sera envoyé sur ce numéro.</p>
                          </div>
                        )}

                        {selectedMethod === 'card' && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">Numéro de carte</p>
                              <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">Expire</p>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent"
                                />
                              </div>
                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">CVV</p>
                                <input
                                  type="text"
                                  placeholder="000"
                                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-accent"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedMethod === 'wu' && (
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <p className="text-[10px] text-white/60">Veuillez vous rendre dans une agence Western Union munis de votre ID utilisateur : <span className="text-accent font-black">#WEGO-{session?.id}</span></p>
                          </div>
                        )}
                     </motion.div>

                     <button
                       onClick={handleRecharge}
                       disabled={loading || !rechargeAmount || parseInt(rechargeAmount) <= 0}
                       className="w-full py-4 rounded-[20px] gradient-accent text-white font-black text-sm shadow-xl shadow-accent/20 tap-target disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                       {loading ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                           {t('common.loading')}
                         </>
                       ) : (
                         selectedMethod === 'wu' ? "J'ai effectué le transfert" : t('common.confirm')
                       )}
                     </button>
                  </motion.div>
                )}
             </div>
          </div>

          {/* Recent Transactions */}
          <div>
             <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">{t('user.wallet.transactions')}</h2>
             <div className="glass rounded-[28px] overflow-hidden border border-white/5">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center opacity-40">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('user.wallet.noTransactions')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                     {transactions.slice(0, 3).map((tx, idx) => (
                        <div 
                          key={tx.id}
                          className="p-4 flex items-center justify-between"
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-white/5 ${tx.type === 'credit' ? 'bg-green-500/10' : 'bg-accent/10'}`}>
                                 {tx.type === 'credit' ? (
                                   <ArrowUpCircle className="w-4 h-4 text-green-500" />
                                 ) : (
                                   <ArrowDownCircle className="w-4 h-4 text-accent" />
                                 )}
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-white leading-tight">{tx.title}</p>
                                 <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{tx.date}</p>
                              </div>
                           </div>
                           <div className="text-right">
                             <span className={`text-xs font-black tracking-tighter ${tx.type === 'credit' ? 'text-green-500' : 'text-white'}`}>
                               {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                             </span>
                             {tx.balance !== undefined && (
                               <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-tight opacity-40">Bal: ${tx.balance}</p>
                             )}
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserWallet;
