import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDTO, AuthResponseDTO } from '@/types/auth.types';
import { SystemRole } from '@/types/common.types';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (authResponse: AuthResponseDTO, user: UserDTO) => void;
  setUser: (user: UserDTO) => void;
  setTokens: (authResponse: AuthResponseDTO) => void;
  logout: () => void;
  getClubId: () => string | null;
  isMasterAdmin: () => boolean;
  hasClub: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (authResponse, user) =>
        set({
          user,
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      setTokens: (authResponse) =>
        set({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      getClubId: () => get().user?.clubId ?? null,

      isMasterAdmin: () =>
        get().user?.systemRole === SystemRole.MASTER_ADMIN,

      hasClub: () => !!get().user?.clubId,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
