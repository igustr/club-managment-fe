import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar, DRAWER_WIDTH, COLLAPSED_WIDTH } from './Sidebar';
import { useUiStore } from '@/stores/uiStore';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header
        onToggleSidebar={() => setMobileOpen(!mobileOpen)}
        drawerWidth={drawerWidth}
      />
      <Sidebar
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
