import { Box, Skeleton } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'form' | 'detail';
  rows?: number;
}

export function LoadingSkeleton({ variant = 'table', rows = 5 }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={140} />
        ))}
      </Box>
    );
  }

  if (variant === 'form') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={56} />
        ))}
      </Box>
    );
  }

  if (variant === 'detail') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={32} width={200} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  // table (default)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Skeleton variant="rounded" height={48} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={40} />
      ))}
    </Box>
  );
}
