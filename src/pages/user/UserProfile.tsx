import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Globe } from 'lucide-react';
import { changeLanguage } from '@/i18n';
import i18n from '@/i18n';
import type { User as UserType } from '@/types';

const UserProfile = () => {
  const { t } = useTranslation();
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const user = profile as UserType | null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = () => {
    const next = i18n.language === 'es' ? 'fr' : 'es';
    changeLanguage(next);
  };

  return (
    <div className="min-h-full safe-top px-6 pb-6">
      <h1 className="text-xl font-bold text-foreground pt-6 mb-6">{t('user.profile.title')}</h1>

      <div className="glass rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-accent">{user?.name?.charAt(0) || 'U'}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.phone}</p>
          {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={toggleLang} className="w-full glass rounded-xl p-4 flex items-center justify-between tap-target">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-accent" />
            <span className="text-sm text-foreground">{t('user.profile.language')}</span>
          </div>
          <span className="text-sm text-muted-foreground uppercase">{i18n.language}</span>
        </button>

        <button onClick={handleLogout} className="w-full glass rounded-xl p-4 flex items-center gap-3 tap-target text-accent">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t('common.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
