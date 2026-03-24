import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarCollapsed: boolean;
  language: string;
  scheduleStartHour: number;
  scheduleEndHour: number;
}

interface UiActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLanguage: (lang: string) => void;
  setScheduleStartHour: (hour: number) => void;
  setScheduleEndHour: (hour: number) => void;
}

type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      language: 'et',
      scheduleStartHour: 8,
      scheduleEndHour: 22,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setLanguage: (lang) => set({ language: lang }),

      setScheduleStartHour: (hour) => set({ scheduleStartHour: hour }),

      setScheduleEndHour: (hour) => set({ scheduleEndHour: hour }),
    }),
    {
      name: 'ui-storage',
    },
  ),
);
