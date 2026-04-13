import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, KeyRound, UserPlus, Car, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { Driver, User, UserType } from '@/types';

type Step = 'phone' | 'otp' | 'choose-profile' | 'register';
type AuthProfileByType = { user: User; driver: Driver };

const LoginScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, setSession, setProfile } = useAuthStore();

  useEffect(() => {
    if (session) {
      const redirectMap: Record<UserType, string> = {
        user: '/user/dashboard',
        driver: '/driver/dashboard',
        'admin-stand': '/admin-stand/dashboard',
        'super-admin': '/super-admin/dashboard',
      };
      navigate(redirectMap[session.userType] || '/services', { replace: true });
    }
  }, [session, navigate]);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [registerAs, setRegisterAs] = useState<'user' | 'driver'>('user');
  const [foundUser, setFoundUser] = useState<Awaited<ReturnType<typeof api.getUserByPhone>> | null>(null);
  const [foundDriver, setFoundDriver] = useState<Awaited<ReturnType<typeof api.getDriverByPhone>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    toast.success(t('auth.otpSent'));
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (otp !== '1234') {
      setErrorMsg(t('auth.otpError'));
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setLoading(true);
    const user = await api.getUserByPhone(phone);
    const driver = await api.getDriverByPhone(phone);
    setFoundUser(user || null);
    setFoundDriver(driver || null);
    setLoading(false);

    if (user && driver) {
      setStep('choose-profile');
    } else if (user) {
      loginAs(user, 'user');
    } else if (driver) {
      loginAs(driver, 'driver');
    } else {
      setStep('register');
    }
  };

  const loginAs = <T extends keyof AuthProfileByType>(profile: AuthProfileByType[T], type: T) => {
    if (profile.blocked) {
      toast.error(t('common.blocked'));
      return;
    }
    setSession({ userType: type, id: profile.id, phone: profile.phone });
    setProfile(profile);
    if (type === 'user') navigate('/user/dashboard');
    else navigate('/driver/dashboard');
  };

  const handleRegister = async () => {
    if (!name.trim()) return;
    setLoading(true);
    if (registerAs === 'user') {
      const user = await api.createUser({ name, phone });
      setSession({ userType: 'user', id: user.id, phone: user.phone });
      setProfile(user);
      navigate('/user/dashboard');
    } else {
      if (!licenseNumber.trim()) { setLoading(false); return; }
      const driver = await api.createDriver({ name, phone, licenseNumber });
      setSession({ userType: 'driver', id: driver.id, phone: driver.phone });
      setProfile(driver);
      navigate('/driver/dashboard');
    }
    setLoading(false);
  };

  const goBack = () => {
    if (step === 'otp') setStep('phone');
    else if (step === 'choose-profile' || step === 'register') setStep('otp');
    else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 relative z-10">
        <button onClick={goBack} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 -mt-16">
        <div className="flex justify-center mb-12">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, x: shake ? [-10, 10, -8, 8, -5, 5, 0] : 0 }}
            transition={{ duration: shake ? 0.4 : 0.5 }}
            src="/images/logo/wego_logo.svg"
            alt="We_goo"
            className="h-[135px] w-auto drop-shadow-sm"
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 'phone' && (
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 text-center">{t('auth.title')}</h1>
                <p className="text-muted-foreground mb-8 text-center">{t('auth.phone')}</p>
                <div className="relative mb-6">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder={t('auth.phonePlaceholder')}
                    className="w-full py-4 pl-12 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={!phone.trim()}
                  className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 transition-transform active:scale-[0.98]"
                >
                  {t('auth.sendOtp')}
                </button>
              </div>
            )}

            {step === 'otp' && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.otp')}</h1>
                <p className="text-muted-foreground mb-8">{phone}</p>
                {errorMsg && (
                  <p className="text-destructive text-center text-sm font-medium mb-4">{errorMsg}</p>
                )}
                <motion.div 
                  className="relative mb-6"
                  animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setErrorMsg(''); }}
                    placeholder={t('auth.otpPlaceholder')}
                    maxLength={4}
                    className={`w-full py-4 pl-12 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 tap-target text-center text-2xl tracking-[0.5em] ${errorMsg ? 'ring-2 ring-destructive' : 'focus:ring-accent'}`}
                  />
                </motion.div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 4 || loading}
                  className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 transition-transform active:scale-[0.98]"
                >
                  {loading ? t('common.loading') : t('auth.verifyOtp')}
                </button>
              </div>
            )}

            {step === 'choose-profile' && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-6">{t('auth.chooseProfile')}</h1>
                <div className="space-y-4">
                  <button
                    onClick={() => loginAs(foundUser!, 'user')}
                    className="w-full glass rounded-2xl p-5 flex items-center gap-4 tap-target hover:border-accent/40 transition-all active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{t('auth.asUser')}</p>
                      <p className="text-sm text-muted-foreground">{foundUser?.name}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => loginAs(foundDriver!, 'driver')}
                    className="w-full glass rounded-2xl p-5 flex items-center gap-4 tap-target hover:border-accent/40 transition-all active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent2/10 flex items-center justify-center">
                      <Car className="w-6 h-6 text-accent2" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{t('auth.asDriver')}</p>
                      <p className="text-sm text-muted-foreground">{foundDriver?.name}</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step === 'register' && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.createAccount')}</h1>
                <p className="text-muted-foreground mb-6">{t('auth.role')}</p>

                {/* Role toggle */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setRegisterAs('user')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium tap-target transition-all ${registerAs === 'user' ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}
                  >
                    {t('auth.roleUser')}
                  </button>
                  <button
                    onClick={() => setRegisterAs('driver')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium tap-target transition-all ${registerAs === 'driver' ? 'gradient-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}
                  >
                    {t('auth.roleDriver')}
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    className="w-full py-4 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
                  />
                  {registerAs === 'driver' && (
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      placeholder={t('auth.licenseNumber')}
                      className="w-full py-4 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
                    />
                  )}
                </div>

                <button
                  onClick={handleRegister}
                  disabled={!name.trim() || (registerAs === 'driver' && !licenseNumber.trim()) || loading}
                  className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 transition-transform active:scale-[0.98]"
                >
                  {loading ? t('common.loading') : t('auth.createAccount')}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginScreen;
