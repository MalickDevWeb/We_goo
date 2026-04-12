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
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground ml-2">{t('driver.wallet.title')}</h1>
      </div>

      <div className="px-6 pt-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 text-center mb-4"
        >
          <Wallet className="w-8 h-8 text-accent2 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t('driver.wallet.balance')}</p>
          <p className="text-4xl font-bold text-foreground mt-1">${driver?.walletBalance?.toLocaleString() || '0'}</p>
        </motion.div>

        {/* Commission & Debt */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 text-center"
          >
            <p className="text-xs text-muted-foreground mb-1">{t('driver.wallet.commission')}</p>
            <p className="text-lg font-bold text-accent">$450</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <p className="text-xs text-muted-foreground">{t('driver.wallet.debt')}</p>
            </div>
            <p className="text-lg font-bold text-destructive">${driver?.debt || 0}</p>
          </motion.div>
        </div>

        {/* Transactions */}
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('user.wallet.transactions')}</h2>
        {transactions.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">{t('user.wallet.noTransactions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverWallet;
