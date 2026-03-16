import { Box, Typography, Stack, IconButton, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  backPath?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, backPath, breadcrumbs, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs.map((item, index) =>
            item.path ? (
              <Link
                key={index}
                underline="hover"
                color="text.secondary"
                sx={{ cursor: 'pointer', fontSize: 14 }}
                onClick={() => navigate(item.path!)}
              >
                {item.label}
              </Link>
            ) : (
              <Typography key={index} color="text.primary" fontSize={14}>
                {item.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {backPath && (
            <IconButton onClick={() => navigate(backPath)} size="small">
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        {actions && <Box>{actions}</Box>}
      </Box>
    </Box>
  );
}
