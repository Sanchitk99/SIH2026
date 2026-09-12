import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  allowedRoles: Array<'ADMIN' | 'RECYCLER' | 'COLLECTOR'>;
}

export const RoleProtectedRoute = ({ allowedRoles }: Props) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (!role || !allowedRoles.includes(role as any)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};