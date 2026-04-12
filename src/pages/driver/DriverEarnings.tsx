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
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground ml-2">{t('driver.earnings.title')}</h1>
      </div>

      <div className="px-6 pt-6">
        {/* Main earnings card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 text-center mb-6"
        >
          <DollarSign className="w-8 h-8 text-accent2 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t('driver.earnings.today')}</p>
          <p className="text-4xl font-bold text-foreground mt-1">${earningsData.today.toLocaleString()}</p>
          <p className="text-xs text-accent2 mt-2">+12% vs. yesterday</p>
        </motion.div>

        {/* Period cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {periods.slice(1).map((period, i) => (
            <motion.div
              key={period.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass rounded-xl p-4 text-center"
            >
              <period.icon className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">${period.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{period.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">{t('driver.earnings.week')}</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {weekDays.map((day, i) => {
              const height = maxVal > 0 ? (weekValues[i] / maxVal) * 100 : 0;
              const isToday = i === 4; // Friday
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">${weekValues[i]}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.4 + i * 0.05, type: 'spring' }}
                    className={`w-full rounded-t-lg ${isToday ? 'gradient-accent' : 'bg-muted'}`}
                    style={{ minHeight: 4 }}
                  />
                  <span className={`text-xs ${isToday ? 'text-accent font-bold' : 'text-muted-foreground'}`}>{day}</span>
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
