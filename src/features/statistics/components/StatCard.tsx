import { Paper, Typography, Box } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, color = 'primary.main' }: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}`,
            color: 'white',
            opacity: 0.9,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
