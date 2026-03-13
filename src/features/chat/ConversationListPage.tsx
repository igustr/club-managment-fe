import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  List,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useConversations, useCreateDirectConversation } from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { ConversationItem } from './components/ConversationItem';
import { NewDirectChatDialog } from './components/NewDirectChatDialog';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function ConversationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();

  const { data: conversations, isLoading } = useConversations(clubId);
  const createMutation = useCreateDirectConversation(clubId!);

  const [newChatOpen, setNewChatOpen] = useState(false);

  const handleSelectUser = async (participantId: string) => {
    try {
      const conversation = await createMutation.mutateAsync({ participantId });
      setNewChatOpen(false);
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const sorted = [...(conversations ?? [])].sort((a, b) => {
    if (!a.lastMessageTime && !b.lastMessageTime) return 0;
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {t('chat.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewChatOpen(true)}
        >
          {t('chat.newConversation')}
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sorted.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('chat.noConversations')}
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding sx={{ p: 1 }}>
            {sorted.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                selected={false}
                onClick={() => navigate(`/chat/${conv.id}`)}
              />
            ))}
          </List>
        </Paper>
      )}

      <NewDirectChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelect={handleSelectUser}
        loading={createMutation.isPending}
      />
    </Box>
  );
}
