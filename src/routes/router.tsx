import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute } from './ProtectedRoute';
import { MasterAdminGuard } from './MasterAdminGuard';
import { ClubGuard } from './ClubGuard';
import { RoleGuard } from './RoleGuard';
import { NotFoundPage } from './NotFoundPage';
import { ForbiddenPage } from './ForbiddenPage';
import { ClubRole } from '@/types/common.types';

// Lazy-loaded pages
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  })),
);
const NoClubPage = lazy(() =>
  import('@/features/auth/NoClubPage').then((m) => ({
    default: m.NoClubPage,
  })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
);

// Layout components (not lazy — always needed)
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <SuspenseWrapper>
        <RegisterPage />
      </SuspenseWrapper>
    ),
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      // No club page
      {
        path: '/no-club',
        element: (
          <SuspenseWrapper>
            <NoClubPage />
          </SuspenseWrapper>
        ),
      },

      // Master Admin routes
      {
        element: <MasterAdminGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: '/admin/clubs',
                element: (
                  <SuspenseWrapper>
                    <Box sx={{ typography: 'h5', fontWeight: 700 }}>
                      Club List (Phase 2)
                    </Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/admin/clubs/:clubId',
                element: (
                  <SuspenseWrapper>
                    <Box sx={{ typography: 'h5', fontWeight: 700 }}>
                      Club Detail (Phase 2)
                    </Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/admin/users',
                element: (
                  <SuspenseWrapper>
                    <Box sx={{ typography: 'h5', fontWeight: 700 }}>
                      Platform Users (Phase 2)
                    </Box>
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },

      // Club routes (requires club membership)
      {
        element: <ClubGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: '/dashboard',
                element: (
                  <SuspenseWrapper>
                    <DashboardPage />
                  </SuspenseWrapper>
                ),
              },

              // CLUB_ADMIN only
              {
                element: <RoleGuard roles={[ClubRole.CLUB_ADMIN]} />,
                children: [
                  {
                    path: '/settings',
                    element: (
                      <SuspenseWrapper>
                        <Box>Settings (Phase 3)</Box>
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/users',
                    element: (
                      <SuspenseWrapper>
                        <Box>Users (Phase 3)</Box>
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/users/:userId',
                    element: (
                      <SuspenseWrapper>
                        <Box>User Detail (Phase 3)</Box>
                      </SuspenseWrapper>
                    ),
                  },
                ],
              },

              // All club roles
              {
                path: '/teams',
                element: (
                  <SuspenseWrapper>
                    <Box>Teams (Phase 4)</Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/teams/:teamId',
                element: (
                  <SuspenseWrapper>
                    <Box>Team Detail (Phase 4)</Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/trainings',
                element: (
                  <SuspenseWrapper>
                    <Box>Trainings (Phase 5)</Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/trainings/:trainingId',
                element: (
                  <SuspenseWrapper>
                    <Box>Training Detail (Phase 5)</Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/calendar',
                element: (
                  <SuspenseWrapper>
                    <Box>Calendar (Phase 5)</Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/pitches',
                element: (
                  <SuspenseWrapper>
                    <Box>Pitches (Phase 5)</Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/pitches/:pitchId/schedule',
                element: (
                  <SuspenseWrapper>
                    <Box>Pitch Schedule (Phase 5)</Box>
                  </SuspenseWrapper>
                ),
              },

              // CLUB_ADMIN/COACH
              {
                element: (
                  <RoleGuard
                    roles={[ClubRole.CLUB_ADMIN, ClubRole.COACH]}
                  />
                ),
                children: [
                  {
                    path: '/trainings/create',
                    element: (
                      <SuspenseWrapper>
                        <Box>Create Training (Phase 5)</Box>
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/statistics',
                    element: (
                      <SuspenseWrapper>
                        <Box>Statistics (Phase 8)</Box>
                      </SuspenseWrapper>
                    ),
                  },
                ],
              },

              // Chat — all roles
              {
                path: '/chat',
                element: (
                  <SuspenseWrapper>
                    <Box>Chat (Phase 7)</Box>
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/chat/:conversationId',
                element: (
                  <SuspenseWrapper>
                    <Box>Conversation (Phase 7)</Box>
                  </SuspenseWrapper>
                ),
              },

              // 403
              { path: '/403', element: <ForbiddenPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Error pages (outside layouts)
  { path: '/403', element: <ForbiddenPage /> },

  // Root redirect
  { path: '/', element: <Navigate to="/login" replace /> },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
