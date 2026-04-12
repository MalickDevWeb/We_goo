import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';

const AdminLoginScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const adminStand = await api.loginAdminStand(email, password);
    if (adminStand) {
      setSession({ userType: 'admin-stand', id: adminStand.id });
      navigate('/admin-stand/dashboard');
      setLoading(false);
      return;
    }
    const superAdmin = await api.loginSuperAdmin(email, password);
    if (superAdmin) {
      setSession({ userType: 'super-admin', id: superAdmin.id });
      navigate('/super-admin/dashboard');
      setLoading(false);
      return;
    }
    toast.error(t('auth.invalidCredentials'));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom flex flex-col">
      <div className="flex items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="tap-target p-2 rounded-xl hover:bg-muted" aria-label={t('common.back')}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.adminLogin')}</h1>
        <p className="text-muted-foreground mb-8">{t('auth.email')}</p>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('auth.email')}
              className="w-full py-4 pl-12 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('auth.password')}
              className="w-full py-4 pl-12 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent tap-target"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!email || !password || loading}
          className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-semibold tap-target disabled:opacity-40 transition-transform active:scale-[0.98]"
        >
          {loading ? t('common.loading') : t('auth.login')}
        </button>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
