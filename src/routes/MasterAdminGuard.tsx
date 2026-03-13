import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

export function MasterAdminGuard() {
  const { isMasterAdmin } = usePermissions();

  if (!isMasterAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
