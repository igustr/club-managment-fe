import { Chip, type ChipProps } from '@mui/material';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const statusColors: Record<StatusVariant, { bgcolor: string; color: string }> = {
  success: { bgcolor: '#22C55E1A', color: '#22C55E' },
  warning: { bgcolor: '#F59E0B1A', color: '#F59E0B' },
  error: { bgcolor: '#EF44441A', color: '#EF4444' },
  info: { bgcolor: '#3B82F61A', color: '#3B82F6' },
  default: { bgcolor: '#64748B1A', color: '#64748B' },
};

interface StatusChipProps extends Omit<ChipProps, 'variant'> {
  status: StatusVariant;
}

export function StatusChip({ status, sx, ...chipProps }: StatusChipProps) {
  const colors = statusColors[status] ?? statusColors.default;

  return (
    <Chip
      size="small"
      {...chipProps}
      sx={{
        bgcolor: colors.bgcolor,
        color: colors.color,
        fontWeight: 600,
        ...sx,
      }}
    />
  );
}
