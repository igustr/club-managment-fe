import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

interface HeaderProps {
  title?: string;
  onToggleSidebar: () => void;
  drawerWidth: number;
}

export function Header({ title, onToggleSidebar, drawerWidth }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'et' ? 'en' : 'et';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : '';

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* Language switcher */}
        <Button
          onClick={toggleLanguage}
          size="small"
          sx={{
            mr: 1,
            minWidth: 'auto',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {i18n.language === 'et' ? 'EN' : 'ET'}
        </Button>

        {/* User menu */}
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: 14,
            }}
          >
            {initials}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout fontSize="small" sx={{ mr: 1 }} />
            {t('common.logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
