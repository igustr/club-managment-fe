import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import type { ClubRole } from '@/types/common.types';

interface RoleGuardProps {
  roles: ClubRole[];
}

export function RoleGuard({ roles }: RoleGuardProps) {
  const { clubRole, hasClub } = usePermissions();

  if (!hasClub) {
    return <Navigate to="/no-club" replace />;
  }

  if (!clubRole || !roles.includes(clubRole)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
