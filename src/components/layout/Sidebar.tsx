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
  Badge,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Groups,
  FitnessCenter,
  Stadium,
  CalendarMonth,
  Chat,
  People,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  SportsSoccer,
  ChildCare,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useUnreadCount } from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { sidebarColors } from '@/theme';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 64;

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface NavItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  labelKey: string;
  badge?: number;
  roles?: string[];
}

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = useAuthStore((s) => s.user);
  const { isClubAdmin, isParent, canViewStatistics, canManagePitches } = usePermissions();
  const clubId = useClubId();
  const { data: unreadCount } = useUnreadCount(clubId);

  const mainItems: NavItem[] = [
    { key: 'dashboard', path: '/dashboard', icon: <Dashboard />, labelKey: 'nav.dashboard' },
    { key: 'calendar', path: '/calendar', icon: <CalendarMonth />, labelKey: 'nav.calendar' },
    ...(!isParent
      ? [{ key: 'teams', path: '/teams', icon: <Groups />, labelKey: 'nav.teams' }]
      : []),
    ...(isParent
      ? [{ key: 'children', path: '/children', icon: <ChildCare />, labelKey: 'nav.children' }]
      : []),
    { key: 'trainings', path: '/trainings', icon: <FitnessCenter />, labelKey: 'nav.trainings' },
    { key: 'games', path: '/games', icon: <SportsSoccer />, labelKey: 'nav.games' },
    ...(canManagePitches
      ? [{ key: 'pitches', path: '/pitches', icon: <Stadium />, labelKey: 'nav.pitches' }]
      : []),
    { key: 'chat', path: '/chat', icon: <Chat />, labelKey: 'nav.chat', badge: unreadCount },
  ];

  const adminItems: NavItem[] = [
    ...(isClubAdmin
      ? [{ key: 'users', path: '/users', icon: <People />, labelKey: 'nav.users' }]
      : []),
    ...(canViewStatistics
      ? [{ key: 'statistics', path: '/statistics', icon: <BarChart />, labelKey: 'nav.statistics' }]
      : []),
    ...(isClubAdmin
      ? [{ key: 'settings', path: '/settings', icon: <Settings />, labelKey: 'nav.settings' }]
      : []),
  ];

  const width = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const roleKey = user?.role ? `roles.${user.role}` : '';

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
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{ color: sidebarColors.text }}
          >
            <ChevronRight />
          </IconButton>
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

      {/* Main nav */}
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
            {t('nav.main')}
          </Typography>
        )}
        <List disablePadding>
          {mainItems.map((item) => (
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
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error" variant="dot">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={t(item.labelKey)}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                  />
                )}
                {!collapsed && item.badge ? (
                  <Badge badgeContent={item.badge} color="error" sx={{ mr: 1 }} />
                ) : null}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Admin section */}
        {adminItems.length > 0 && (
          <>
            <Divider sx={{ borderColor: sidebarColors.divider, my: 1 }} />
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
                {t('nav.admin')}
              </Typography>
            )}
            <List disablePadding>
              {adminItems.map((item) => (
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
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
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
            bgcolor: 'primary.main',
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
            <Typography
              variant="caption"
              color={sidebarColors.text}
              noWrap
            >
              {roleKey ? t(roleKey) : ''}
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
            width: DRAWER_WIDTH,
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

export { DRAWER_WIDTH, COLLAPSED_WIDTH };
