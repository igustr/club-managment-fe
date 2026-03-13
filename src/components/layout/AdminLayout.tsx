import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import {
  AdminSidebar,
  ADMIN_DRAWER_WIDTH,
  ADMIN_COLLAPSED_WIDTH,
} from './AdminSidebar';
import { useUiStore } from '@/stores/uiStore';
import { useTranslation } from 'react-i18next';

export function AdminLayout() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const drawerWidth = collapsed
    ? ADMIN_COLLAPSED_WIDTH
    : ADMIN_DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header
        title={t('roles.MASTER_ADMIN')}
        onToggleSidebar={() => setMobileOpen(!mobileOpen)}
        drawerWidth={drawerWidth}
      />
      <AdminSidebar
        open={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={toggleSidebar}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
