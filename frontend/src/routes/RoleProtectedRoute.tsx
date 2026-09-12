import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, type UserRole } from '../contexts/AuthContext';

interface Props {
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute = ({ allowedRoles }: Props) => {
  const { t } = useTranslation();
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div className="loading-state">{t('common.loading')}</div>;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};
