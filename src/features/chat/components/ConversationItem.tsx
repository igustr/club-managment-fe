import { useTranslation } from 'react-i18next';
import {
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
} from '@mui/material';
import { Groups } from '@mui/icons-material';
import type { ConversationDTO } from '@/types/chat.types';
import { ConversationType } from '@/types/chat.types';
import dayjs from 'dayjs';

interface ConversationItemProps {
  conversation: ConversationDTO;
  selected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  selected,
  onClick,
}: ConversationItemProps) {
  const { t } = useTranslation();

  const isTeam = conversation.type === ConversationType.TEAM;
  const initials = isTeam
    ? conversation.name.substring(0, 2).toUpperCase()
    : conversation.participants
        .slice(0, 2)
        .map((p) => p.firstName.charAt(0))
        .join('');

  const timeLabel = conversation.lastMessageTime
    ? dayjs(conversation.lastMessageTime).format('DD.MM HH:mm')
    : '';

  const preview = conversation.lastMessageText
    ? conversation.lastMessageSenderName
      ? `${conversation.lastMessageSenderName}: ${conversation.lastMessageText}`
      : conversation.lastMessageText
    : t('chat.noMessages');

  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{ borderRadius: 1, mb: 0.5 }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={conversation.unreadCount}
          color="primary"
          invisible={conversation.unreadCount === 0}
        >
          <Avatar
            sx={{
              bgcolor: isTeam ? 'primary.main' : 'secondary.main',
              width: 40,
              height: 40,
            }}
          >
            {isTeam ? <Groups fontSize="small" /> : initials}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="body2"
              fontWeight={conversation.unreadCount > 0 ? 700 : 500}
              noWrap
              sx={{ flex: 1 }}
            >
              {conversation.name}
            </Typography>
            {timeLabel && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
                {timeLabel}
              </Typography>
            )}
          </Box>
        }
        secondary={
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            component="span"
            fontWeight={conversation.unreadCount > 0 ? 600 : 400}
          >
            {preview}
          </Typography>
        }
      />
    </ListItemButton>
  );
}
