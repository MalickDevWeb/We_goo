import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserType } from '@/types';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles: UserType[];
}

const RequireAuth = ({ children, allowedRoles }: RequireAuthProps) => {
  const { session, profile } = useAuthStore();

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.blocked) return <Navigate to="/blocked" replace />;
  if (!allowedRoles.includes(session.userType)) {
    const redirectMap: Record<UserType, string> = {
      user: '/user/dashboard',
      driver: '/driver/dashboard',
      'admin-stand': '/admin-stand/dashboard',
      'super-admin': '/super-admin/dashboard',
    };
    return <Navigate to={redirectMap[session.userType]} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
