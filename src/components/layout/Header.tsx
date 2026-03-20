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
  Badge,
  Popover,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Notifications,
  FitnessCenter,
  Cancel,
  Delete,
  Chat,
  DoneAll,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useClubId } from '@/hooks/useClubId';
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/api/notification.api';
import { NotificationType } from '@/types/notification.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface HeaderProps {
  title?: string;
  onToggleSidebar: () => void;
  drawerWidth: number;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  [NotificationType.TRAINING_UPDATED]: (
    <FitnessCenter sx={{ fontSize: 18, color: 'info.main' }} />
  ),
  [NotificationType.TRAINING_CANCELLED]: (
    <Cancel sx={{ fontSize: 18, color: 'error.main' }} />
  ),
  [NotificationType.TRAINING_DELETED]: (
    <Delete sx={{ fontSize: 18, color: 'error.main' }} />
  ),
  [NotificationType.MESSAGE]: (
    <Chat sx={{ fontSize: 18, color: 'primary.main' }} />
  ),
};

export function Header({ title, onToggleSidebar, drawerWidth }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const clubId = useClubId();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const { data: unreadCount } = useNotificationUnreadCount(clubId);
  const { data: notificationsPage, isLoading: notifLoading } = useNotifications(
    notifAnchorEl ? clubId : null,
    { page: 0, size: 15 },
  );
  const markAsRead = useMarkNotificationAsRead(clubId ?? '');
  const markAllAsRead = useMarkAllNotificationsAsRead(clubId ?? '');

  const notifications = notificationsPage?.content ?? [];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    setLangAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login', { replace: true });
  };

  const handleNotificationClick = (
    notifId: string,
    type: NotificationType,
    referenceId: string | null,
    isRead: boolean,
  ) => {
    if (!isRead) {
      markAsRead.mutate(notifId);
    }
    setNotifAnchorEl(null);

    if (type === NotificationType.MESSAGE && referenceId) {
      navigate(`/chat/${referenceId}`);
    } else if (
      type === NotificationType.TRAINING_UPDATED &&
      referenceId
    ) {
      navigate(`/trainings/${referenceId}`);
    } else if (type === NotificationType.TRAINING_CANCELLED && referenceId) {
      navigate(`/trainings/${referenceId}`);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : '';

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

        {/* Notification bell */}
        <IconButton
          onClick={(e) => setNotifAnchorEl(e.currentTarget)}
          size="small"
          sx={{ mr: 0.5 }}
        >
          <Badge
            badgeContent={unreadCount ?? 0}
            color="error"
            max={99}
          >
            <Notifications />
          </Badge>
        </IconButton>

        <Popover
          open={!!notifAnchorEl}
          anchorEl={notifAnchorEl}
          onClose={() => setNotifAnchorEl(null)}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          slotProps={{
            paper: {
              sx: { width: 360, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {t('notifications.title')}
            </Typography>
            {(unreadCount ?? 0) > 0 && (
              <Button
                size="small"
                startIcon={<DoneAll sx={{ fontSize: 16 }} />}
                onClick={handleMarkAllRead}
                sx={{ fontSize: 12 }}
              >
                {t('notifications.markAllRead')}
              </Button>
            )}
          </Stack>

          <Box sx={{ overflow: 'auto', flex: 1 }}>
            {notifLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Notifications sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {t('notifications.empty')}
                </Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <Box
                  key={notif.id}
                  onClick={() =>
                    handleNotificationClick(
                      notif.id,
                      notif.type,
                      notif.referenceId,
                      notif.read,
                    )
                  }
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: notif.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ pt: 0.3 }}>
                      {notificationIcons[notif.type]}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label={t(`notifications.type.${notif.type}`)}
                          size="small"
                          variant="outlined"
                          sx={{ height: 18, fontSize: 10 }}
                        />
                        {!notif.read && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="body2"
                        fontWeight={notif.read ? 400 : 600}
                        sx={{ mt: 0.3 }}
                        noWrap
                      >
                        {notif.title}
                      </Typography>
                      {notif.message && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: 'block' }}
                        >
                          {notif.message}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ mt: 0.3, display: 'block' }}
                      >
                        {dayjs(notif.createdAt).fromNow()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))
            )}
          </Box>
        </Popover>

        {/* Language switcher */}
        <Button
          onClick={(e) => setLangAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            mr: 1,
            minWidth: 'auto',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {i18n.language.toUpperCase()}
        </Button>
        <Menu
          anchorEl={langAnchorEl}
          open={!!langAnchorEl}
          onClose={() => setLangAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            selected={i18n.language === 'et'}
            onClick={() => handleLanguageChange('et')}
          >
            Eesti
          </MenuItem>
          <MenuItem
            selected={i18n.language === 'en'}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </MenuItem>
        </Menu>

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
