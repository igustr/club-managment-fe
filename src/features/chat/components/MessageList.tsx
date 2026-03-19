import { useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import type { MessageDTO } from '@/types/chat.types';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';

interface MessageListProps {
  messages: MessageDTO[];
  onProfileClick?: (userId: string) => void;
}

export function MessageList({ messages, onProfileClick }: MessageListProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Messages come from API in descending order (newest first), reverse for display
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  let lastDate = '';

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 2,
      }}
    >
      {sorted.map((msg) => {
        const isOwn = msg.senderId === currentUserId;
        const dateStr = dayjs(msg.createdAt).format('DD.MM.YYYY');
        const showDate = dateStr !== lastDate;
        lastDate = dateStr;

        return (
          <Box key={msg.id}>
            {showDate && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'center', display: 'block', my: 1.5 }}
              >
                {dateStr}
              </Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                gap: 1,
                mb: 0.5,
              }}
            >
              {!isOwn && (
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    mt: 0.5,
                    ...(onProfileClick ? { cursor: 'pointer' } : {}),
                  }}
                  onClick={onProfileClick ? () => onProfileClick(msg.senderId) : undefined}
                >
                  {msg.senderFirstName.charAt(0)}
                  {msg.senderLastName.charAt(0)}
                </Avatar>
              )}
              <Box sx={{ maxWidth: '70%' }}>
                {!isOwn && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      ml: 0.5,
                      ...(onProfileClick ? { cursor: 'pointer', '&:hover': { color: 'primary.main' } } : {}),
                    }}
                    onClick={onProfileClick ? () => onProfileClick(msg.senderId) : undefined}
                  >
                    {msg.senderFirstName} {msg.senderLastName}
                  </Typography>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: isOwn ? 'primary.main' : 'grey.100',
                    color: isOwn ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.25,
                      opacity: 0.7,
                      fontSize: '0.65rem',
                    }}
                  >
                    {dayjs(msg.createdAt).format('HH:mm')}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>
        );
      })}
      <div ref={bottomRef} />
    </Box>
  );
}
