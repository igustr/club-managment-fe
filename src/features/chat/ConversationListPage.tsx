import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  List,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Add, Search, Person, GroupAdd } from '@mui/icons-material';
import {
  useConversations,
  useCreateDirectConversation,
  useCreateGroupConversation,
} from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { usePermissions } from '@/hooks/usePermissions';
import { ConversationItem } from './components/ConversationItem';
import { NewDirectChatDialog } from './components/NewDirectChatDialog';
import { NewGroupChatDialog } from './components/NewGroupChatDialog';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function ConversationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();

  const { isClubAdmin, isCoach } = usePermissions();
  const canCreateGroup = isClubAdmin || isCoach;

  const { data: conversations, isLoading } = useConversations(clubId);
  const createMutation = useCreateDirectConversation(clubId!);
  const createGroupMutation = useCreateGroupConversation(clubId!);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');

  const handleSelectUser = async (participantId: string) => {
    try {
      const conversation = await createMutation.mutateAsync({ participantId });
      setNewChatOpen(false);
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleCreateGroup = async (name: string, participantIds: string[]) => {
    try {
      const conversation = await createGroupMutation.mutateAsync({
        name,
        participantIds,
      });
      setNewGroupOpen(false);
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const sorted = useMemo(() => {
    let list = [...(conversations ?? [])];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.participants.some(
            (p) =>
              p.firstName.toLowerCase().includes(q) ||
              p.lastName.toLowerCase().includes(q),
          ),
      );
    }
    return list.sort((a, b) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
  }, [conversations, search]);

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
        {canCreateGroup ? (
          <>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              {t('chat.newConversation')}
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setNewChatOpen(true);
                }}
              >
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('chat.directMessage')}</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setNewGroupOpen(true);
                }}
              >
                <ListItemIcon>
                  <GroupAdd fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('chat.newGroupChat')}</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewChatOpen(true)}
          >
            {t('chat.newConversation')}
          </Button>
        )}
      </Box>

      <TextField
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, width: 320 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

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

      <NewGroupChatDialog
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        onCreate={handleCreateGroup}
        loading={createGroupMutation.isPending}
      />
    </Box>
  );
}
