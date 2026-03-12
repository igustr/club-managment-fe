# Club Management Frontend

SAY THAT WE NEED TO MAKE DESIGN FOR EACH PAGE!!!

Estonian football club management web application frontend (bachelor's thesis project).

## IMPORTANT: Before Starting Any Implementation

**MANDATORY: Before writing ANY code or making ANY architectural decisions, you MUST read through the thesis PDF (`final_thesis_Igor_Ustritski.pdf`) and the development plan (`.claude/development-plan.md`) in full. Do NOT skip this step. Do NOT start implementing based on assumptions — always ground your work in these documents first.**

**Read these sources first:**

1. **Thesis (requirements & architecture):** Read `final_thesis_Igor_Ustritski.pdf` in the project root — it contains all functional requirements (section 4.6), non-functional requirements (section 4.7), RBAC rules, and user flows.

2. **Development plan:** Read `.claude/development-plan.md` — it contains the phased plan, page structure, component hierarchy, and routing design.

3. **Backend API reference:** The backend is at `/Users/igorustritski/IdeaProjects/club-managment-be`. Check its controllers for exact endpoint paths, request/response DTOs, and security annotations.

4. **Reference project — emde-fe (PRIMARY):** Browse `/Users/igorustritski/emde-2-fe` — closest to our stack (Vite + React + TS + TanStack Query + Axios + React Hook Form + Zod + i18next + React Router 7):
   - `src/api/` — Axios instance, API modules with co-located TanStack Query hooks
   - `src/config/axios-config.ts` — Session timeout, activity tracking, interceptors
   - `src/features/` — Feature module structure (pages + components + schemas)
   - `src/permissions/` — Permission context, `usePermissions()` hook, ProtectedRoute
   - `src/hooks/` — Custom React hooks (useCurrentUser)
   - `src/i18n/` — i18next configuration
   - `src/components/form/fields.tsx` — RHF + Controller field wrappers

5. **Reference project — coop-admin:** Browse `/Users/igorustritski/Visual Studio Projects/coop-admin` for patterns on:
   - `src/authProvider.ts` — JWT auth flow (login, logout, token parsing, role extraction from JWT payload)
   - `src/httpClient.ts` — HTTP client with JWT injection from localStorage
   - `src/shared/component/CustomMenu.tsx` — Collapsible sidebar with role-gated sections
   - `src/items/*/` — Mode-based form reuse (`XxxMutate` with `mode: 'create' | 'edit'`)

6. **Reference project — partner-admin-ui:** Browse `/Users/igorustritski/Visual Studio Projects/partner admin ui` for patterns on:
   - `src/components/layout/MainLayout.tsx` — Sidebar admin layout (Ant Design Menu, dark theme, collapsible)
   - `src/api/api.ts` — SWR-based API hooks with Bearer token injection
   - `src/pages/` — Next.js file-based routing with List → Create → Edit pattern
   - Role-gated sidebar menu items (`hasAccess(role)` per item)

**When implementing a new phase, check emde-fe first (closest stack match), then coop-admin for JWT/auth patterns, partner-admin-ui for sidebar/layout patterns, and backend controllers for API contracts.**

## Project Overview

A React SPA for managing Estonian football clubs — members, training schedules, pitch bookings, attendance tracking, and team chat with role-based access control.

**Thesis:** "Eesti jalgpalliklubide haldamine veebipõhise rakenduse abil" (TalTech, 2026)

**Design approach:** Web-first (desktop). Primary users are coaches and admins working on desktop/laptop. Mobile-compatible but not mobile-first.

## Development Plan

See `.claude/development-plan.md` for the full phased development plan.

## Tech Stack

- **React 19** + **TypeScript 5** + **Vite 6**
- **MUI 6** (Material UI) for component library — Drawer sidebar, DataGrid, form controls
- **React Router 7** for client-side routing (lazy-loaded routes)
- **TanStack Query v5** for server state management (caching, refetch, loading)
- **Axios** for HTTP client with JWT interceptors
- **React Hook Form** + **Zod** for forms and validation
- **react-i18next** for internationalization (Estonian + English)
- **Zustand** for lightweight client state (auth store, UI preferences store)
- **react-hot-toast** for toast notifications
- **dayjs** for date/time formatting (Europe/Tallinn timezone)
- **ESLint** + **Prettier** for code quality

## Architecture

```
src/
├── api/                      # Axios instance + API modules (1 per backend controller)
│   ├── axios.ts              # Axios instance, JWT interceptor, 401 handler
│   ├── query-client.ts       # TanStack Query client config
│   ├── auth.api.ts           # Auth endpoints + query hooks
│   ├── club.api.ts           # Club endpoints + query hooks
│   ├── user.api.ts           # User endpoints + query hooks
│   ├── team.api.ts           # Team + member endpoints + query hooks
│   ├── training.api.ts       # Training session endpoints + query hooks
│   ├── pitch.api.ts          # Pitch endpoints + query hooks
│   ├── attendance.api.ts     # Attendance endpoints + query hooks
│   ├── statistics.api.ts     # Player/team/club statistics + query hooks
│   └── chat.api.ts           # Conversation + message endpoints + query hooks
├── components/               # Shared reusable components
│   ├── layout/               # AppLayout, Sidebar, Header
│   │   ├── AppLayout.tsx     # Main layout: Sidebar + Header + content area
│   │   ├── Sidebar.tsx       # MUI Drawer, collapsible, role-gated menu items
│   │   └── Header.tsx        # AppBar: club name, language switcher, user menu
│   ├── ui/                   # DataTable, ConfirmDialog, StatusChip, EmptyState, LoadingSkeleton
│   └── form/                 # RHF + MUI field wrappers (reusable across features)
│       ├── TextFieldInput.tsx     # Controller-wrapped MUI TextField
│       ├── SelectFieldInput.tsx   # Controller-wrapped MUI Select
│       ├── DateFieldInput.tsx     # Controller-wrapped date picker
│       └── CheckboxFieldInput.tsx # Controller-wrapped MUI Checkbox
├── features/                 # Feature modules (pages + feature-specific components + schemas)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── schemas.ts        # loginSchema, registerSchema (Zod)
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── clubs/
│   │   ├── ClubSettingsPage.tsx
│   │   └── schemas.ts
│   ├── users/
│   │   ├── UserListPage.tsx
│   │   ├── UserDetailPage.tsx
│   │   ├── components/       # AddUserDialog, RoleBadge, ParentLinkForm
│   │   └── schemas.ts
│   ├── teams/
│   │   ├── TeamListPage.tsx
│   │   ├── TeamDetailPage.tsx
│   │   ├── components/       # TeamForm, MemberRoster, AddMemberDialog
│   │   └── schemas.ts
│   ├── trainings/
│   │   ├── TrainingListPage.tsx
│   │   ├── TrainingDetailPage.tsx
│   │   ├── components/       # TrainingForm, RecurringTrainingForm
│   │   └── schemas.ts
│   ├── pitches/
│   │   ├── PitchListPage.tsx
│   │   ├── PitchSchedulePage.tsx
│   │   ├── components/       # PitchForm, ScheduleView
│   │   └── schemas.ts
│   ├── attendance/
│   │   └── components/       # AttendanceList, AttendanceSummary, ConfirmButton
│   │                         # (embedded in TrainingDetailPage, not standalone pages)
│   ├── calendar/
│   │   ├── CalendarPage.tsx   # Monthly calendar view of all trainings
│   │   └── components/       # MonthlyCalendar, DayDetailPopover, CalendarFilters
│   ├── statistics/
│   │   ├── AnalyticsPage.tsx  # Club-wide analytics dashboard (ADMIN/COACH)
│   │   └── components/       # AttendanceRateCard, TrendChart, TeamComparison, PlayerStatsTable
│   └── chat/
│       ├── ConversationListPage.tsx
│       ├── ConversationPage.tsx
│       └── components/       # MessageList, SendMessageForm, ConversationItem
├── hooks/                    # Non-API custom hooks
│   ├── usePermissions.ts     # Role-based permission checks (simplified from emde-fe)
│   └── useClubId.ts          # Read clubId from auth store
├── i18n/                     # Internationalization
│   ├── i18n.ts               # i18next config (Estonian default, browser detection)
│   ├── et.json               # Estonian translations
│   └── en.json               # English translations
├── routes/                   # Route definitions + guards
│   ├── router.tsx            # React Router config with lazy-loaded routes
│   ├── ProtectedRoute.tsx    # Auth guard (redirects to /login if unauthenticated)
│   └── RoleGuard.tsx         # Role-based route guard (shows 403 if insufficient role)
├── stores/                   # Zustand stores
│   ├── authStore.ts          # Auth state: user, tokens, role, clubId, login(), logout()
│   └── uiStore.ts            # UI preferences: sidebarCollapsed, language
├── types/                    # TypeScript types/interfaces (mirror backend DTOs)
│   ├── auth.types.ts         # UserDTO, LoginRequestDTO, AuthResponseDTO, RegisterRequestDTO
│   ├── club.types.ts         # ClubDTO, UpdateClubDTO
│   ├── user.types.ts         # UpdateUserDTO, AddUserToClubDTO, LinkParentDTO
│   ├── team.types.ts         # TeamDTO, TeamMemberDTO, CreateTeamDTO, AddTeamMemberDTO
│   ├── training.types.ts     # TrainingSessionDTO, CreateTrainingSessionDTO, CreateRecurringTrainingDTO
│   ├── pitch.types.ts        # PitchDTO, CreatePitchDTO
│   ├── attendance.types.ts   # AttendanceDTO, AttendanceSummaryDTO, UpdateAttendanceDTO
│   ├── chat.types.ts         # ConversationDTO, MessageDTO, SendMessageDTO, ParticipantDTO
│   └── common.types.ts       # Page<T>, ApiError, ClubRole enum, AttendanceStatus, TrainingSessionStatus
├── utils/
│   ├── date.ts               # dayjs config, Europe/Tallinn timezone, formatting helpers
│   └── roles.ts              # ClubRole constants, role display names, role color mapping
├── theme.ts                  # MUI theme (colors TBD — Estonian football context)
├── App.tsx                   # Root component: providers (QueryClient, Router, Theme, i18n, Toast)
├── main.tsx                  # Entry point
└── vite-env.d.ts             # Vite type declarations
```

## Key Conventions

### Code Style
- ESLint + Prettier (auto-format on save)
- Functional components only (no class components)
- Named exports (not default exports) for components
- TypeScript strict mode

### Naming
- Components: PascalCase (`TrainingList.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- API modules: kebab-case with `.api.ts` suffix (`training.api.ts`)
- Types: PascalCase interfaces (`TrainingSession`, `CreateTrainingDTO`)
- Feature folders: kebab-case (`trainings/`)
- Zod schemas: camelCase with `Schema` suffix (`createTrainingSchema`)

### API Layer Pattern (from emde-fe)
Each API module co-locates: raw API functions + query key factory + TanStack Query hooks.

```typescript
// Example: api/team.api.ts
import { api } from './axios';
import type { TeamDTO, CreateTeamDTO } from '@/types/team.types';

// --- Query key factory ---
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (clubId: string) => [...teamKeys.lists(), clubId] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
};

// --- API functions ---
export const getTeams = (clubId: string) =>
  api.get<TeamDTO[]>(`/clubs/${clubId}/teams`).then(r => r.data);

export const createTeam = (clubId: string, data: CreateTeamDTO) =>
  api.post<TeamDTO>(`/clubs/${clubId}/teams`, data).then(r => r.data);

// --- TanStack Query hooks ---
export const useTeams = (clubId: string) =>
  useQuery({ queryKey: teamKeys.list(clubId), queryFn: () => getTeams(clubId) });

export const useCreateTeam = (clubId: string) =>
  useMutation({
    mutationFn: (data: CreateTeamDTO) => createTeam(clubId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.lists() }),
  });
```

### Form Pattern (from coop-admin)
Single form component reused for create and edit, with `mode` prop:

```typescript
// features/teams/components/TeamForm.tsx
interface TeamFormProps {
  mode: 'create' | 'edit';
  defaultValues?: TeamFormValues;
  onSubmit: (data: TeamFormValues) => void;
}

export const TeamForm = ({ mode, defaultValues, onSubmit }: TeamFormProps) => {
  const { t } = useTranslation();
  const methods = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema(t)),
    defaultValues,
  });
  // ... render MUI fields wrapped in Controller
};
```

### Zod Schema Pattern (from emde-fe)
Schemas accept translation function for localized error messages:

```typescript
// features/teams/schemas.ts
export const teamSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, { message: t('validation.required') }),
    ageGroup: z.string().min(1, { message: t('validation.required') }),
    season: z.string().optional(),
  });
export type TeamFormValues = z.infer<ReturnType<typeof teamSchema>>;
```

### Permission System (simplified from emde-fe)
Role-based checks via `usePermissions()` hook, matching backend's `@clubSecurity` / `@teamSecurity`:

```typescript
// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role;
  return {
    role,
    isAdmin: role === 'ADMIN',
    isCoach: role === 'COACH',
    isPlayer: role === 'PLAYER',
    isParent: role === 'PARENT',
    canManageClub: role === 'ADMIN',
    canManagePitches: role === 'ADMIN',
    canManageUsers: role === 'ADMIN',
    canCreateTraining: role === 'ADMIN' || role === 'COACH',
    canViewAttendanceSummary: role === 'ADMIN' || role === 'COACH',
    canViewStatistics: role === 'ADMIN' || role === 'COACH',
  };
}

// Usage in components:
const { isAdmin, canCreateTraining } = usePermissions();
{isAdmin && <Button>Manage Users</Button>}

// Usage in routes (RoleGuard):
<Route element={<RoleGuard roles={['ADMIN']} />}>
  <Route path="settings" element={<ClubSettingsPage />} />
</Route>
```

### Routing (simplified — no clubId in URL)
Routes use flat paths. `clubId` is read from the auth store (user belongs to exactly one club).

```
/login                          # Public
/register                       # Public

/dashboard                      # All roles — landing page
/settings                       # ADMIN — club settings

/users                          # ADMIN — user management
/users/:userId                  # ADMIN — user detail

/teams                          # All roles — team list
/teams/:teamId                  # All roles — team detail + members

/trainings                      # All roles — training list (list + calendar toggle)
/trainings/create               # ADMIN/COACH — create training
/trainings/:trainingId          # All roles — training detail + attendance

/calendar                       # All roles — monthly calendar view

/pitches                        # All roles — pitch list
/pitches/:pitchId/schedule      # ADMIN — pitch schedule

/statistics                     # ADMIN/COACH — analytics dashboard

/chat                           # All roles — conversation list
/chat/:conversationId           # All roles — messages
```

### Security / RBAC
- JWT stored in localStorage (matching coop-admin pattern)
- Axios request interceptor attaches `Authorization: Bearer <token>`
- Axios response interceptor: 401 → clear tokens, redirect to `/login`
- `ProtectedRoute` — checks auth state, redirects unauthenticated users
- `RoleGuard` — checks user role against allowed roles, renders 403 if insufficient
- UI elements conditionally rendered via `usePermissions()` hook
- Four roles: **ADMIN**, **COACH**, **PLAYER**, **PARENT** (see RBAC matrix below)

### Internationalization
- Estonian (default) + English
- `react-i18next` with local JSON translation files
- Language detected from browser, switchable via header dropdown
- Language preference persisted in Zustand `uiStore`
- Translation keys: `feature.component.key` (e.g. `teams.form.name`)
- Zod validation messages use `t()` for localization

### State Management
- **Server state:** TanStack Query only (all API data — teams, trainings, users, etc.)
- **Auth state:** Zustand `authStore` (user, accessToken, refreshToken, role, clubId, login/logout actions)
- **UI preferences:** Zustand `uiStore` (sidebarCollapsed, language)
- **Ephemeral UI:** React local state (`useState`) — modals, form visibility, etc.
- **No Redux** — TanStack Query + Zustand covers all needs

### Toast Notifications
- `react-hot-toast` for success/error feedback
- Success: mutation callbacks (`onSuccess`)
- Error: global axios interceptor for network errors + per-mutation `onError`
- Position: top-right

### Chat Polling
- Unread count: poll every 30 seconds (sidebar badge)
- Active conversation messages: poll every 10 seconds (refetchInterval in TanStack Query)
- Mark as read: PUT on conversation open

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│  Header (AppBar)                                │
│  [☰ Toggle] [Club Name]    [🌐 ET/EN] [👤 User]│
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main Content Area                   │
│ (Drawer) │                                      │
│          │  ┌────────────────────────────────┐  │
│ Dashboard│  │  Page content (lazy-loaded)    │  │
│ Teams    │  │                                │  │
│ Trainings│  │                                │  │
│ Pitches  │  │                                │  │
│ Chat [3] │  │                                │  │
│ ──────── │  │                                │  │
│ ADMIN:   │  │                                │  │
│ Users    │  │                                │  │
│ Settings │  │                                │  │
│          │  └────────────────────────────────┘  │
└──────────┴──────────────────────────────────────┘

Desktop: Sidebar permanently visible (240px), collapsible to 64px (icons only)
Mobile:  Sidebar as temporary MUI Drawer (overlay), toggled via hamburger
```

## Backend API

Backend runs at `http://localhost:8080`. All club-scoped endpoints use `/api/clubs/{clubId}/` prefix.
Frontend reads `clubId` from the auth store (returned in `/api/auth/me` response).

```
# Auth (public)
POST   /api/auth/register          → RegisterRequestDTO → AuthResponseDTO
POST   /api/auth/login             → LoginRequestDTO → AuthResponseDTO
POST   /api/auth/refresh           → RefreshTokenRequestDTO → AuthResponseDTO
GET    /api/auth/me                → UserDTO (includes role, clubId)

# Club (ADMIN manages, all members view)
GET    /api/clubs/{clubId}                              → ClubDTO
PUT    /api/clubs/{clubId}                              → UpdateClubDTO → ClubDTO

# Users
GET    /api/clubs/{clubId}/users                        → Page<UserDTO>
POST   /api/clubs/{clubId}/users                        → AddUserToClubDTO → UserDTO
GET    /api/clubs/{clubId}/users/{userId}               → UserDTO
PUT    /api/clubs/{clubId}/users/{userId}               → UpdateUserDTO → UserDTO
DELETE /api/clubs/{clubId}/users/{userId}               → void
GET    /api/users/unaffiliated?search=                  → Page<UserDTO>

# Parent-child
GET    /api/clubs/{clubId}/users/{userId}/parents       → List<UserDTO>
POST   /api/clubs/{clubId}/users/{userId}/parents       → LinkParentDTO → void
DELETE /api/clubs/{clubId}/users/{userId}/parents/{pId}  → void
GET    /api/clubs/{clubId}/users/{userId}/children      → List<UserDTO>

# Teams
GET    /api/clubs/{clubId}/teams                        → List<TeamDTO>
POST   /api/clubs/{clubId}/teams                        → CreateTeamDTO → TeamDTO
GET    /api/clubs/{clubId}/teams/{teamId}               → TeamDTO
PUT    /api/clubs/{clubId}/teams/{teamId}               → UpdateTeamDTO → TeamDTO
DELETE /api/clubs/{clubId}/teams/{teamId}               → void
GET    /api/clubs/{clubId}/teams/{teamId}/members       → List<TeamMemberDTO>
POST   /api/clubs/{clubId}/teams/{teamId}/members       → AddTeamMemberDTO → TeamMemberDTO
DELETE /api/clubs/{clubId}/teams/{teamId}/members/{uId}  → void

# Trainings
GET    /api/clubs/{clubId}/trainings                    → List<TrainingSessionDTO>
GET    /api/clubs/{clubId}/trainings/{trainingId}       → TrainingSessionDTO
POST   /api/clubs/{clubId}/teams/{teamId}/trainings     → CreateTrainingSessionDTO → TrainingSessionDTO
POST   /api/clubs/{clubId}/teams/{teamId}/trainings/recurring → CreateRecurringTrainingDTO → List<TrainingSessionDTO>
PUT    /api/clubs/{clubId}/trainings/{trainingId}       → UpdateTrainingSessionDTO → TrainingSessionDTO
PUT    /api/clubs/{clubId}/trainings/{trainingId}/cancel → void
DELETE /api/clubs/{clubId}/trainings/{trainingId}       → void

# Pitches
GET    /api/clubs/{clubId}/pitches                      → List<PitchDTO>
POST   /api/clubs/{clubId}/pitches                      → CreatePitchDTO → PitchDTO
GET    /api/clubs/{clubId}/pitches/{pitchId}            → PitchDTO
PUT    /api/clubs/{clubId}/pitches/{pitchId}            → UpdatePitchDTO → PitchDTO
DELETE /api/clubs/{clubId}/pitches/{pitchId}            → void
GET    /api/clubs/{clubId}/pitches/{pitchId}/schedule?startDate=&endDate= → List<TrainingSessionDTO>

# Attendance
GET    /api/clubs/{clubId}/trainings/{tId}/attendance          → List<AttendanceDTO>
GET    /api/clubs/{clubId}/trainings/{tId}/attendance/summary  → AttendanceSummaryDTO
PUT    /api/clubs/{clubId}/trainings/{tId}/attendance/{userId}  → UpdateAttendanceDTO → AttendanceDTO

# Chat
GET    /api/clubs/{clubId}/conversations                       → List<ConversationDTO>
POST   /api/clubs/{clubId}/conversations                       → CreateDirectConversationDTO → ConversationDTO
GET    /api/clubs/{clubId}/conversations/{id}                  → ConversationDTO
GET    /api/clubs/{clubId}/conversations/{id}/messages          → Page<MessageDTO>
POST   /api/clubs/{clubId}/conversations/{id}/messages          → SendMessageDTO → MessageDTO
PUT    /api/clubs/{clubId}/conversations/{id}/read              → void
GET    /api/clubs/{clubId}/conversations/unread-count           → number
```

## RBAC Matrix

| Action                           | ADMIN | COACH | PLAYER | PARENT |
|----------------------------------|-------|-------|--------|--------|
| Manage club settings             | Yes   | No    | No     | No     |
| Add/remove users to club         | Yes   | No    | No     | No     |
| Manage all teams                 | Yes   | No    | No     | No     |
| Manage own team roster           | Yes   | Yes   | No     | No     |
| Manage pitches                   | Yes   | No    | No     | No     |
| Create/edit training (own team)  | Yes   | Yes   | No     | No     |
| Cancel training                  | Yes   | Yes   | No     | No     |
| View own team trainings          | Yes   | Yes   | Yes    | Yes    |
| Confirm attendance (self)        | No    | No    | Yes    | No     |
| Confirm attendance (child)       | No    | No    | No     | Yes    |
| View attendance summary          | Yes   | Yes   | No     | No     |
| Send/view messages               | Yes   | Yes   | Yes    | Yes    |

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run format       # Prettier format
npx tsc --noEmit     # Type check
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Reference Projects

- **emde-fe** (`/Users/igorustritski/emde-2-fe`): PRIMARY — Vite + React + TanStack Query + Axios + RHF + Zod + i18next architecture
- **coop-admin** (`/Users/igorustritski/Visual Studio Projects/coop-admin`): JWT auth pattern, collapsible sidebar, mode-based form reuse
- **partner-admin-ui** (`/Users/igorustritski/Visual Studio Projects/partner admin ui`): Sidebar admin layout, role-gated menu items, SWR API pattern
- **club-managment-be** (`/Users/igorustritski/IdeaProjects/club-managment-be`): Backend API — controllers, DTOs, Spring Security RBAC
