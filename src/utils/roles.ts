import { ClubRole, SystemRole } from '@/types/common.types';

export const clubRoleDisplayNames: Record<ClubRole, { et: string; en: string }> = {
  [ClubRole.CLUB_ADMIN]: { et: 'Klubi administraator', en: 'Club Admin' },
  [ClubRole.COACH]: { et: 'Treener', en: 'Coach' },
  [ClubRole.PLAYER]: { et: 'Mängija', en: 'Player' },
  [ClubRole.PARENT]: { et: 'Lapsevanem', en: 'Parent' },
};

export const systemRoleDisplayNames: Record<SystemRole, { et: string; en: string }> = {
  [SystemRole.MASTER_ADMIN]: { et: 'Peaadministraator', en: 'Platform Admin' },
};

export const clubRoleColors: Record<ClubRole, string> = {
  [ClubRole.CLUB_ADMIN]: '#4F46E5',
  [ClubRole.COACH]: '#0D9488',
  [ClubRole.PLAYER]: '#3B82F6',
  [ClubRole.PARENT]: '#F59E0B',
};
