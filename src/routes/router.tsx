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
const AdminClubListPage = lazy(() =>
  import('@/features/admin/ClubListPage').then((m) => ({
    default: m.ClubListPage,
  })),
);
const AdminClubDetailPage = lazy(() =>
  import('@/features/admin/ClubDetailPage').then((m) => ({
    default: m.ClubDetailPage,
  })),
);
const AdminUserListPage = lazy(() =>
  import('@/features/admin/UserListPage').then((m) => ({
    default: m.UserListPage,
  })),
);
const ClubSettingsPage = lazy(() =>
  import('@/features/clubs/ClubSettingsPage').then((m) => ({
    default: m.ClubSettingsPage,
  })),
);
const ClubUserListPage = lazy(() =>
  import('@/features/users/UserListPage').then((m) => ({
    default: m.UserListPage,
  })),
);
const ClubUserDetailPage = lazy(() =>
  import('@/features/users/UserDetailPage').then((m) => ({
    default: m.UserDetailPage,
  })),
);
const TeamListPage = lazy(() =>
  import('@/features/teams/TeamListPage').then((m) => ({
    default: m.TeamListPage,
  })),
);
const TeamDetailPage = lazy(() =>
  import('@/features/teams/TeamDetailPage').then((m) => ({
    default: m.TeamDetailPage,
  })),
);
const PitchListPage = lazy(() =>
  import('@/features/pitches/PitchListPage').then((m) => ({
    default: m.PitchListPage,
  })),
);
const PitchSchedulePage = lazy(() =>
  import('@/features/pitches/PitchSchedulePage').then((m) => ({
    default: m.PitchSchedulePage,
  })),
);
const PitchOverviewPage = lazy(() =>
  import('@/features/pitches/PitchOverviewPage').then((m) => ({
    default: m.PitchOverviewPage,
  })),
);
const PitchConflictsPage = lazy(() =>
  import('@/features/pitches/PitchConflictsPage').then((m) => ({
    default: m.PitchConflictsPage,
  })),
);
const TrainingListPage = lazy(() =>
  import('@/features/trainings/TrainingListPage').then((m) => ({
    default: m.TrainingListPage,
  })),
);
const TrainingDetailPage = lazy(() =>
  import('@/features/trainings/TrainingDetailPage').then((m) => ({
    default: m.TrainingDetailPage,
  })),
);
const GameListPage = lazy(() =>
  import('@/features/games/GameListPage').then((m) => ({
    default: m.GameListPage,
  })),
);
const GameDetailPage = lazy(() =>
  import('@/features/games/GameDetailPage').then((m) => ({
    default: m.GameDetailPage,
  })),
);
const TournamentDetailPage = lazy(() =>
  import('@/features/tournaments/TournamentDetailPage').then((m) => ({
    default: m.TournamentDetailPage,
  })),
);
const CalendarPage = lazy(() =>
  import('@/features/calendar/CalendarPage').then((m) => ({
    default: m.CalendarPage,
  })),
);
const ConversationListPage = lazy(() =>
  import('@/features/chat/ConversationListPage').then((m) => ({
    default: m.ConversationListPage,
  })),
);
const ConversationPage = lazy(() =>
  import('@/features/chat/ConversationPage').then((m) => ({
    default: m.ConversationPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import('@/features/statistics/AnalyticsPage').then((m) => ({
    default: m.AnalyticsPage,
  })),
);
const MemberProfilePage = lazy(() =>
  import('@/features/members/MemberProfilePage').then((m) => ({
    default: m.MemberProfilePage,
  })),
);
const ChildrenPage = lazy(() =>
  import('@/features/children/ChildrenPage').then((m) => ({
    default: m.ChildrenPage,
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
                    <AdminClubListPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/admin/clubs/:clubId',
                element: (
                  <SuspenseWrapper>
                    <AdminClubDetailPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/admin/users',
                element: (
                  <SuspenseWrapper>
                    <AdminUserListPage />
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
                        <ClubSettingsPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/users',
                    element: (
                      <SuspenseWrapper>
                        <ClubUserListPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/users/:userId',
                    element: (
                      <SuspenseWrapper>
                        <ClubUserDetailPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/pitches',
                    element: (
                      <SuspenseWrapper>
                        <PitchConflictsPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/pitches/manage',
                    element: (
                      <SuspenseWrapper>
                        <PitchListPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/pitches/overview',
                    element: (
                      <SuspenseWrapper>
                        <PitchOverviewPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/pitches/:pitchId/schedule',
                    element: (
                      <SuspenseWrapper>
                        <PitchSchedulePage />
                      </SuspenseWrapper>
                    ),
                  },
                ],
              },

              // All club roles
              {
                path: '/members/:userId',
                element: (
                  <SuspenseWrapper>
                    <MemberProfilePage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/children',
                element: (
                  <SuspenseWrapper>
                    <ChildrenPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/teams',
                element: (
                  <SuspenseWrapper>
                    <TeamListPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/teams/:teamId',
                element: (
                  <SuspenseWrapper>
                    <TeamDetailPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/trainings',
                element: (
                  <SuspenseWrapper>
                    <TrainingListPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/trainings/:trainingId',
                element: (
                  <SuspenseWrapper>
                    <TrainingDetailPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/games',
                element: (
                  <SuspenseWrapper>
                    <GameListPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/games/:gameId',
                element: (
                  <SuspenseWrapper>
                    <GameDetailPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/tournaments/:tournamentId',
                element: (
                  <SuspenseWrapper>
                    <TournamentDetailPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/calendar',
                element: (
                  <SuspenseWrapper>
                    <CalendarPage />
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
                        <TrainingListPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: '/statistics',
                    element: (
                      <SuspenseWrapper>
                        <AnalyticsPage />
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
                    <ConversationListPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: '/chat/:conversationId',
                element: (
                  <SuspenseWrapper>
                    <ConversationPage />
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
