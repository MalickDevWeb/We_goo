import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Driver } from '@/types';

const DriverEarnings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const driver = profile as Driver | null;

  // Mock earnings data
  const earningsData = {
    today: driver?.todayEarnings || 0,
    week: (driver?.todayEarnings || 0) * 5,
    month: (driver?.todayEarnings || 0) * 22,
    total: (driver?.todayEarnings || 0) * 120,
  };

  const periods = [
    { key: 'today', label: t('driver.earnings.today'), value: earningsData.today, icon: Calendar },
    { key: 'week', label: t('driver.earnings.week'), value: earningsData.week, icon: BarChart3 },
    { key: 'month', label: t('driver.earnings.month'), value: earningsData.month, icon: TrendingUp },
    { key: 'total', label: t('driver.earnings.total'), value: earningsData.total, icon: DollarSign },
  ];

  // Mock daily chart bars
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const weekValues = [800, 1200, 950, 1400, driver?.todayEarnings || 0, 600, 300];
  const maxVal = Math.max(...weekValues);

  return (
    <div className="h-[100svh] bg-background relative overflow-hidden flex flex-col safe-top">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent2/10 rounded-full blur-[100px] pointer-events-none" />

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
           <TrendingUp className="w-5 h-5 text-accent" />
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-12">
        <h1 className="text-3xl font-black text-white tracking-tight mb-8">Vos Revenus</h1>

        {/* Main earnings card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-[32px] p-8 text-center mb-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-accent2/10 flex items-center justify-center mx-auto mb-4 border border-accent2/20">
            <DollarSign className="w-8 h-8 text-accent2" />
          </div>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 mb-2">{t('driver.earnings.today')}</p>
          <p className="text-4xl font-black text-white tracking-tighter">
            {earningsData.today.toLocaleString()} <span className="text-lg text-white/30 ml-1">CFA</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent2/10 border border-accent2/20">
             <div className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse" />
             <span className="text-[10px] font-black text-accent2 uppercase tracking-wider">+12% vs. Hier</span>
          </div>
        </motion.div>

        {/* Period cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {periods.slice(1).map((period, i) => (
            <motion.div
              key={period.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-strong rounded-[28px] p-5 border border-white/5 relative overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <period.icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xl font-black text-white tracking-tight">
                {period.value.toLocaleString()} <span className="text-[10px] text-white/30 ml-0.5">CFA</span>
              </p>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{period.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-[32px] p-8 border border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
               <BarChart3 className="w-3.5 h-3.5 text-accent" />
               Performance Semaine
            </h3>
            <span className="text-[9px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-1 rounded-lg">Mise à jour Live</span>
          </div>

          <div className="flex items-end justify-between gap-3 h-40">
            {weekDays.map((day, i) => {
              const height = maxVal > 0 ? (weekValues[i] / maxVal) * 100 : 0;
              const isToday = i === 4; // Friday
              return (
                <div key={day} className="flex-1 flex flex-col items-center group">
                  <div className="h-32 w-full flex flex-col justify-end mb-3">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.4 + i * 0.05, type: 'spring', damping: 15 }}
                      className={`w-full rounded-2xl relative group-hover:opacity-80 transition-opacity ${
                        isToday ? 'gradient-accent shadow-[0_0_20px_rgba(230,32,87,0.3)]' : 'bg-white/10'
                      }`}
                      style={{ minHeight: 8 }}
                    >
                      {/* Tooltip on hover/active */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[9px] text-background font-black px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {weekValues[i]}
                      </div>
                    </motion.div>
                  </div>
                  <span className={`text-[10px] font-black tracking-widest ${isToday ? 'text-accent' : 'text-white/20'}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverEarnings;
