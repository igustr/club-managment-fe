import { Box, Typography } from '@mui/material';
import { Inbox } from '@mui/icons-material';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'text.secondary', opacity: 0.5 }}>
        {icon ?? <Inbox sx={{ fontSize: 48 }} />}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
