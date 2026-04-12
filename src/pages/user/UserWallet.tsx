import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import * as api from '@/services/api';
import type { Transaction, User } from '@/types';

const UserWallet = () => {
  const { t } = useTranslation();
  const { session, profile, setProfile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRecharge, setShowRecharge] = useState(false);

  const user = profile as User | null;

  useEffect(() => {
    if (session) api.getTransactionsByUser(session.id).then(setTransactions);
  }, [session]);

  const handleRecharge = async () => {
    const amount = parseInt(rechargeAmount);
    if (!amount || amount <= 0 || !session || !user) return;
    const newBalance = user.walletBalance + amount;
    await api.updateUser(session.id, { walletBalance: newBalance });
    await api.createTransaction({
      userId: session.id,
      type: 'credit',
      title: t('user.wallet.recharge'),
      amount,
      date: new Date().toISOString().split('T')[0],
      balance: newBalance,
    });
    setProfile({ ...user, walletBalance: newBalance });
    const txs = await api.getTransactionsByUser(session.id);
    setTransactions(txs);
    setRechargeAmount('');
    setShowRecharge(false);
    toast.success(t('user.wallet.rechargeSuccess', { amount: amount.toString() }));
  };

  return (
    <div className="safe-top px-6 pb-6">
      <h1 className="text-xl font-bold text-foreground pt-6 mb-6">{t('user.wallet.title')}</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6 text-center">
        <Wallet className="w-8 h-8 text-accent mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{t('user.wallet.balance')}</p>
        <p className="text-4xl font-bold text-foreground mt-1">${user?.walletBalance?.toLocaleString() || '0'}</p>
        <button
          onClick={() => setShowRecharge(!showRecharge)}
          className="mt-4 gradient-accent text-accent-foreground px-6 py-3 rounded-xl text-sm font-medium tap-target inline-flex items-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />{t('user.wallet.recharge')}
        </button>
      </motion.div>

      {showRecharge && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-2xl p-5 mb-6">
          <input
            type="number"
            value={rechargeAmount}
            onChange={e => setRechargeAmount(e.target.value)}
            placeholder={t('user.wallet.amountPlaceholder')}
            className="w-full py-4 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target mb-4"
          />
          <div className="flex gap-3 mb-4">
            {[500, 1000, 2000, 5000].map(a => (
              <button key={a} onClick={() => setRechargeAmount(String(a))} className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm tap-target">${a}</button>
            ))}
          </div>
          <button
            onClick={handleRecharge}
            disabled={!rechargeAmount || parseInt(rechargeAmount) <= 0}
            className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 transition-transform active:scale-[0.98]"
          >
            {t('common.confirm')}
          </button>
        </motion.div>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-4">{t('user.wallet.transactions')}</h2>
      {transactions.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm">{t('user.wallet.noTransactions')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {tx.type === 'credit' ? (
                  <ArrowUpCircle className="w-5 h-5 text-accent2" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5 text-accent" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.title}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-accent2' : 'text-accent'}`}>
                {tx.type === 'credit' ? '+' : '-'}${tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserWallet;
