import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Stack,
  Avatar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  useConversation,
  useMessages,
  useSendMessage,
  useMarkAsRead,
} from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { MessageList } from './components/MessageList';
import { SendMessageForm } from './components/SendMessageForm';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function ConversationPage() {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();

  const { data: conversation } = useConversation(clubId, conversationId);
  const { data: messagesPage, isLoading: messagesLoading } = useMessages(
    clubId,
    conversationId,
    { size: 100 },
  );
  const sendMutation = useSendMessage(clubId!, conversationId!);
  const markReadMutation = useMarkAsRead(clubId!, conversationId!);

  // Mark as read on open
  useEffect(() => {
    if (clubId && conversationId) {
      markReadMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, conversationId]);

  const handleSend = async (text: string) => {
    try {
      await sendMutation.mutateAsync({ text });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const messages = messagesPage?.content ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderRadius: '8px 8px 0 0',
        }}
      >
        <IconButton onClick={() => navigate('/chat')}>
          <ArrowBack />
        </IconButton>
        {conversation && (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
              {conversation.name.substring(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {conversation.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {conversation.participants.length} {t('chat.participants')}
              </Typography>
            </Box>
          </Stack>
        )}
      </Paper>

      {/* Messages */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 0,
          borderTop: 0,
        }}
      >
        {messagesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Typography color="text.secondary">{t('chat.noMessages')}</Typography>
          </Box>
        ) : (
          <MessageList messages={messages} />
        )}

        <SendMessageForm
          onSend={handleSend}
          disabled={sendMutation.isPending}
        />
      </Paper>
    </Box>
  );
}
