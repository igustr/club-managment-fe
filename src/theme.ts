import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0D9488',
      light: '#2DD4BF',
      dark: '#0F766E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F1F5F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#22C55E',
    },
    info: {
      main: '#3B82F6',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        notchedOutline: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0F172A',
          color: '#E2E8F0',
        },
      },
    },
  },
});

/** Event type colors for calendar */
export const eventTypeColors = {
  training: { bg: '', text: '' }, // Uses team colors directly
  game: { bg: '#FFF7ED', text: '#C2410C', border: '#FB923C' },
  tournament: { bg: '#F5F3FF', text: '#6D28D9', border: '#A78BFA' },
} as const;

/** Sidebar colors (used in layout components) */
export const sidebarColors = {
  background: '#0F172A',
  text: '#CBD5E1',
  textActive: '#FFFFFF',
  hoverBackground: '#1E293B',
  activeBackground: '#0D9488',
  divider: '#334155',
} as const;
