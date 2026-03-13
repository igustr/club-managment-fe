import { useAuthStore } from '@/stores/authStore';
import { ClubRole, SystemRole } from '@/types/common.types';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const clubRole = user?.role ?? null;
  const systemRole = user?.systemRole ?? null;

  return {
    clubRole,
    systemRole,
    isMasterAdmin: systemRole === SystemRole.MASTER_ADMIN,
    isClubAdmin: clubRole === ClubRole.CLUB_ADMIN,
    isCoach: clubRole === ClubRole.COACH,
    isPlayer: clubRole === ClubRole.PLAYER,
    isParent: clubRole === ClubRole.PARENT,
    hasClub: !!user?.clubId,
    canManageClub: clubRole === ClubRole.CLUB_ADMIN,
    canManagePitches: clubRole === ClubRole.CLUB_ADMIN,
    canManageUsers: clubRole === ClubRole.CLUB_ADMIN,
    canCreateTraining:
      clubRole === ClubRole.CLUB_ADMIN || clubRole === ClubRole.COACH,
    canViewAttendanceSummary:
      clubRole === ClubRole.CLUB_ADMIN || clubRole === ClubRole.COACH,
    canViewStatistics:
      clubRole === ClubRole.CLUB_ADMIN || clubRole === ClubRole.COACH,
  };
}
