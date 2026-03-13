import { useAuthStore } from '@/stores/authStore';

export const useClubId = () => useAuthStore((state) => state.user?.clubId ?? null);
