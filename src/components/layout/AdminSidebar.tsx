import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Business,
  People,
  ChevronLeft,
  SportsSoccer,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { sidebarColors } from '@/theme';

const ADMIN_DRAWER_WIDTH = 260;
const ADMIN_COLLAPSED_WIDTH = 64;

interface AdminSidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = useAuthStore((s) => s.user);

  const items = [
    {
      key: 'clubs',
      path: '/admin/clubs',
      icon: <Business />,
      labelKey: 'nav.clubs',
    },
    {
      key: 'users',
      path: '/admin/users',
      icon: <People />,
      labelKey: 'nav.users',
    },
  ];

  const width = collapsed ? ADMIN_COLLAPSED_WIDTH : ADMIN_DRAWER_WIDTH;

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: sidebarColors.background,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SportsSoccer sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color={sidebarColors.textActive}
              noWrap
            >
              {t('common.appName')}
            </Typography>
          </Box>
        )}
        {collapsed && (
          <SportsSoccer sx={{ color: 'primary.main', fontSize: 24 }} />
        )}
        {!isMobile && !collapsed && (
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{ color: sidebarColors.text }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: sidebarColors.divider }} />

      {/* Nav */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: 'block',
              color: sidebarColors.text,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: 11,
            }}
          >
            {t('nav.platform')}
          </Typography>
        )}
        <List disablePadding>
          {items.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 1,
                  minHeight: 40,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 1 : 2,
                  color: sidebarColors.text,
                  '&.Mui-selected': {
                    bgcolor: sidebarColors.activeBackground,
                    color: sidebarColors.textActive,
                    '& .MuiListItemIcon-root': {
                      color: sidebarColors.textActive,
                    },
                  },
                  '&:hover': {
                    bgcolor: sidebarColors.hoverBackground,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 36,
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={t(item.labelKey)}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User footer */}
      <Divider sx={{ borderColor: sidebarColors.divider }} />
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 1.5,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'secondary.main',
            fontSize: 13,
          }}
        >
          {user
            ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
            : ''}
        </Avatar>
        {!collapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color={sidebarColors.textActive}
              noWrap
            >
              {user ? `${user.firstName} ${user.lastName}` : ''}
            </Typography>
            <Typography variant="caption" color={sidebarColors.text} noWrap>
              {t('roles.MASTER_ADMIN')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: ADMIN_DRAWER_WIDTH,
            bgcolor: sidebarColors.background,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          transition: 'width 0.2s',
          overflowX: 'hidden',
          bgcolor: sidebarColors.background,
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
}

export { ADMIN_DRAWER_WIDTH, ADMIN_COLLAPSED_WIDTH };
