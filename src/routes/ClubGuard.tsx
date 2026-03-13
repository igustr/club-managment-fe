import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

export function ClubGuard() {
  const { hasClub } = usePermissions();

  if (!hasClub) {
    return <Navigate to="/no-club" replace />;
  }

  return <Outlet />;
}
