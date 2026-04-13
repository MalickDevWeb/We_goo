import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Home, MapPin, Wallet, ClipboardList, User } from 'lucide-react';

const tabs = [
  { key: 'home',    path: '/user/dashboard', icon: Home          },
  { key: 'booking', path: '/user/booking',   icon: MapPin        },
  { key: 'wallet',  path: '/user/wallet',    icon: Wallet        },
  { key: 'history', path: '/user/history',   icon: ClipboardList },
  { key: 'profile', path: '/user/profile',   icon: User          },
];

const UserLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen max-h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </div>

      {/* Bottom Tab Bar */}
      <nav className="glass-strong border-t border-border safe-bottom" role="navigation">
        <div className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className="flex-1 flex flex-col items-center py-3 tap-target transition-colors"
                aria-label={t(`tabs.${tab.key}`)}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] mt-1 font-medium ${active ? 'text-accent' : 'text-muted-foreground'}`}>
                  {t(`tabs.${tab.key}`)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default UserLayout;
