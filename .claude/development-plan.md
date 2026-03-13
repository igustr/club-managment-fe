# Club Management Frontend - Development Plan

> Based on thesis "Eesti jalgpalliklubide haldamine veebipõhise rakenduse abil"
> Backend: club-managment-be | References: emde-fe (primary), coop-admin, partner-admin-ui

---

## IMPORTANT: Read Before Implementing

**Before starting any phase, ALWAYS read the thesis PDF (`final_thesis_Igor_Ustritski.pdf`) and CLAUDE.md in full. Do NOT begin coding based on assumptions — verify requirements, user flows, and RBAC rules from the thesis first.**

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Library | MUI 6 | Admin sidebar layout, DataGrid, form controls |
| Server State | TanStack Query v5 only | No Redux needed; caching, refetch, invalidation |
| Client State | Zustand (auth + UI) | Lightweight; auth store + UI preferences store |
| Forms | React Hook Form + Zod | From emde-fe; Zod schemas with i18n for validation messages |
| HTTP | Axios + JWT interceptor | From coop-admin; auto token injection, 401 redirect |
| Toast | react-hot-toast | Lightweight, simple API |
| Date | dayjs + Europe/Tallinn | Lighter than Moment.js |
| Routing | Simplified flat paths | No `/clubs/:clubId/` prefix; clubId from auth store |
| Design | Web-first, desktop-centric | Coaches/admins on desktop. Mobile compatible, not mobile-first |

---

## User Roles & Registration Flow

### Role Hierarchy

| Level | Role | Backend Enum | Description |
|-------|------|-------------|-------------|
| Platform | Master Admin | `SystemRole.MASTER_ADMIN` | Platform owner — creates clubs, manages all |
| Club | Club Admin | `ClubRole.CLUB_ADMIN` | Full club management |
| Club | Coach | `ClubRole.COACH` | Team/training management |
| Club | Player | `ClubRole.PLAYER` | View trainings, confirm attendance |
| Club | Parent | `ClubRole.PARENT` | View child's trainings, confirm attendance |

### Registration & Onboarding Flow

```
1. SELF-REGISTRATION (open to all)
   User registers → account created with NO club, NO role
   User logs in → sees "waiting" page ("Contact your club admin to be added")

2. MASTER ADMIN creates clubs
   Master Admin logs in → platform dashboard
   Creates club (name, contact info)
   Assigns first Club Admin (searches registered users → assigns CLUB_ADMIN role)

3. CLUB ADMIN adds members
   Club Admin searches registered users (unaffiliated)
   Adds them to club with role: CLUB_ADMIN / COACH / PLAYER / PARENT
   Users can now log in and see club content

4. MASTER ADMIN can also:
   - Create user accounts (for people who haven't self-registered)
   - Enter any club and manage it like a Club Admin
   - View all clubs and all users across the platform
   - Delete clubs (users become unaffiliated)
```

### Post-Login Routing Logic

```
Login → /api/auth/me → check user state:
  ├── systemRole == MASTER_ADMIN → redirect to /admin/clubs (platform dashboard)
  ├── clubId != null → redirect to /dashboard (club dashboard)
  └── clubId == null → redirect to /no-club (waiting page)
```

---

## Backend Changes Needed

### Already in backend
- `ClubRole` enum: `CLUB_ADMIN`, `COACH`, `PLAYER`, `PARENT`
- User registration creates unaffiliated user (no club, no role)
- Club Admin adds users to club via `POST /api/clubs/{clubId}/users`
- JWT tokens with role, clubId, email claims

### Backend additions for Master Admin (separate task)
- `SystemRole` enum: `MASTER_ADMIN`
- `system_role` field on User entity
- `systemRole` claim in JWT token
- `AdminController` (`/api/admin/*`):
  - `GET /api/admin/clubs` — list all clubs
  - `POST /api/admin/clubs` — create club
  - `DELETE /api/admin/clubs/{clubId}` — delete club
  - `GET /api/admin/users` — list all users
  - `POST /api/admin/users` — create user account
  - `POST /api/admin/clubs/{clubId}/admins` — assign first Club Admin
- `ClubMembershipChecker` updated: Master Admin passes all club security checks
- `SecurityConfiguration`: `/api/admin/**` requires ROLE_MASTER_ADMIN
- Master Admin seeded in DB (not created via registration)

### Frontend reads clubId from auth store (no clubId in URL)
The `/api/auth/me` endpoint returns `UserDTO` with `clubId`. The frontend stores this in Zustand and passes it to every API call.

```typescript
// hooks/useClubId.ts
export const useClubId = () => useAuthStore(state => state.user?.clubId);

// api/team.api.ts — clubId injected from store, not from URL
export const useTeams = () => {
  const clubId = useAuthStore.getState().user?.clubId;
  return useQuery({ queryKey: teamKeys.list(clubId!), queryFn: () => getTeams(clubId!) });
};
```

---

## Development Phases

### Phase 0: Project Setup ✅ COMPLETE
**Goal:** Replace Next.js scaffold with Vite + React + TypeScript, install all dependencies, configure tooling

- [x] Remove Next.js files
- [x] Create package.json with Vite + all dependencies
- [x] Install dependencies (`npm install`)
- [x] Configure tsconfig.json (strict, path aliases)
- [x] Configure vite.config.ts (aliases, proxy)
- [x] Configure ESLint + Prettier
- [x] Create .env
- [x] Create index.html
- [x] Create src/ directory structure with all feature folders
- [x] Create theme.ts (Modern Navy palette), App.tsx, main.tsx

### Phase 1: Auth & Core Infrastructure
**Goal:** Login/register, JWT management, protected routing, app layout shell with sidebar, Master Admin routing

**Auth infrastructure:**
- [x] Create TypeScript types (`types/auth.types.ts`, `types/common.types.ts`, `types/club.types.ts`) matching backend DTOs
  - Include `SystemRole` type and `systemRole` field in UserDTO
- [x] Create Axios instance (`api/axios.ts`):
  - Base URL from env
  - Request interceptor: attach JWT from Zustand store
  - Response interceptor: 401 → refresh token → redirect to /login
- [x] Create TanStack Query client (`api/query-client.ts`) with default options
- [x] Create Zustand auth store (`stores/authStore.ts`):
  - State: `user: UserDTO | null`, `accessToken`, `refreshToken`, `isAuthenticated`
  - Computed: `isMasterAdmin`, `isClubAdmin`, `hasClub`
  - Actions: `login(tokens)`, `logout()`, `setUser(user)`, `getClubId()`
  - Persist token in localStorage, restore on app init
- [x] Create Zustand UI store (`stores/uiStore.ts`): `sidebarCollapsed`, `language`
- [x] Create auth API module (`api/auth.api.ts`): login, register, refresh, getMe + query hooks

**Auth pages:**
- [x] Create Login page (`features/auth/LoginPage.tsx`) with MUI form + Zod schema
- [x] Create Register page (`features/auth/RegisterPage.tsx`) with MUI form + Zod schema
  - Fields: firstName, lastName, email, password, confirmPassword, dateOfBirth, phone
  - Info box: "After registering, contact your club administrator to be added to a club"
  - Password strength indicator
  - No club creation on register
- [x] Create No Club page (`features/auth/NoClubPage.tsx`)
  - Simple centered card: "Your account is ready. Contact your club administrator to be added."
  - "Check again" button + Logout button

**Layout shells:**
- [x] Create Club AppLayout (`components/layout/AppLayout.tsx`): MUI Box with Drawer + AppBar + Outlet
- [x] Create Club Sidebar (`components/layout/Sidebar.tsx`):
  - MUI permanent Drawer (desktop) / temporary Drawer (mobile)
  - Collapsible: 260px → 64px icons-only
  - Role-gated menu items (using `usePermissions()`)
  - Menu sections: Ülevaade, Meeskonnad, Treeningud, Väljakud, Kalender, Sõnumid
  - Admin section: Kasutajad (CLUB_ADMIN), Statistika (CLUB_ADMIN/COACH), Seaded (CLUB_ADMIN)
- [x] Create Club Header (`components/layout/Header.tsx`):
  - MUI AppBar with hamburger toggle
  - Language switcher (ET/EN)
  - User avatar + dropdown menu (profile, logout)
- [x] Create Master Admin Layout (`components/layout/AdminLayout.tsx`):
  - Similar structure but different sidebar
  - Sidebar items: Klubid (Clubs), Kasutajad (Users)
  - Header: "Peaadministraator" title
- [x] Create Master Admin Sidebar (`components/layout/AdminSidebar.tsx`)

**Routing & guards:**
- [x] Create `usePermissions()` hook (`hooks/usePermissions.ts`)
  - Include: `isMasterAdmin`, `isClubAdmin`, `isCoach`, `isPlayer`, `isParent`
  - Club-level permissions: `canManageClub`, `canManageUsers`, `canCreateTraining`, etc.
- [x] Create `useClubId()` hook (`hooks/useClubId.ts`)
- [x] Create `ProtectedRoute` component (redirects to /login if not authenticated)
- [x] Create `RoleGuard` component (checks role, shows 403 if insufficient)
- [x] Create `MasterAdminGuard` component (checks systemRole == MASTER_ADMIN)
- [x] Create `ClubGuard` component (checks hasClub, redirects to /no-club)
- [x] Set up React Router (`routes/router.tsx`):
  - Public: /login, /register
  - No-club: /no-club (authenticated but no club)
  - Master Admin: /admin/* (inside AdminLayout)
  - Club: /dashboard, /teams, etc. (inside AppLayout)
  - Post-login redirect logic based on role
  - 403 + 404 error pages
- [x] Set up lazy loading for all feature pages

**i18n:**
- [x] Set up react-i18next with Estonian (default) + English
- [x] Create initial translation files with auth + layout + nav + validation + error keys

**Providers:**
- [x] Wire up App.tsx with: QueryClientProvider, RouterProvider, ThemeProvider, Toaster, ReactQueryDevtools

**Utilities:**
- [x] Create `utils/roles.ts` — role display names, role colors
- [x] Create `utils/date.ts` — dayjs config, Europe/Tallinn timezone, formatting helpers
- [x] Create `features/auth/components/AuthLayout.tsx` — shared auth page wrapper (brand, language switcher)

**Verify:**
- Can register → redirects to login page
- Can login as Club Admin → see club dashboard with sidebar
- Can login as Master Admin → see platform admin dashboard
- Can login as unaffiliated user → see "no club" waiting page
- Token persists on refresh → logout works

### Phase 2: Master Admin Dashboard
**Goal:** Master Admin can create/manage clubs, view all users, assign first Club Admins

**API modules:**
- [ ] Create `api/admin.api.ts`:
  - listAllClubs, createClub, deleteClub
  - listAllUsers, createUser
  - assignClubAdmin
  - + TanStack Query hooks for all

**Pages:**
- [ ] Create Club List page (`features/admin/ClubListPage.tsx`)
  - Table of all clubs: name, member count, admin name, created date
  - Search/filter
  - "Create Club" button
- [ ] Create Club Detail/Edit page (`features/admin/ClubDetailPage.tsx`)
  - Club info form (name, address, contact)
  - Members table (all users in this club with roles)
  - "Assign Admin" action
  - "Delete Club" action with confirmation
- [ ] Create Create Club dialog/page (`features/admin/components/CreateClubDialog.tsx`)
  - Form: name (required), registrationCode, address, contactEmail, contactPhone
- [ ] Create Platform User List page (`features/admin/UserListPage.tsx`)
  - All users across platform
  - Filter: by club, unaffiliated only, search by name/email
  - "Create User" button
- [ ] Create Assign Admin dialog (`features/admin/components/AssignAdminDialog.tsx`)
  - Search unaffiliated users
  - Assign as CLUB_ADMIN to selected club

**Schemas:**
- [ ] Zod schemas for create club, create user, assign admin forms

**RBAC:** All pages in /admin/* require MASTER_ADMIN systemRole

### Phase 3: Club & User Management ✅ COMPLETE
**Goal:** Club settings page, user list, add/remove users, role management, parent-child linking

**API modules:**
- [x] Create `api/club.api.ts`: getClub, updateClub + query hooks
- [x] Create `api/user.api.ts`: getUsers, getUser, addUserToClub, updateUser, removeUser, searchUnaffiliated, parents/children CRUD + query hooks

**Pages:**
- [x] Create Dashboard page (`features/dashboard/DashboardPage.tsx`) — overview cards (member count, team/training/pitch placeholders)
- [x] Create Club Settings page (`features/clubs/ClubSettingsPage.tsx`) — CLUB_ADMIN only, edit name/contact
- [x] Create User List page (`features/users/UserListPage.tsx`) — MUI Table with role badges, search, pagination
- [x] Create User Detail page (`features/users/UserDetailPage.tsx`) — profile info, role management, parent-child links

**Feature components:**
- [x] Create AddUserDialog — search unaffiliated users, assign role, add to club
- [x] Create LinkParentDialog — search club members, link as parent to player
- [x] Create ConfirmDialog — shared reusable confirmation dialog (`components/ui/ConfirmDialog.tsx`)

**Schemas:**
- [x] Zod schemas for club settings form, add user form, update user form

**Types:**
- [x] Create `types/user.types.ts` — AddUserToClubDTO, UpdateUserDTO, LinkParentDTO

**RBAC:** Only CLUB_ADMIN sees Users menu item and Club Settings

### Phase 4: Team Management ✅ COMPLETE
**Goal:** Team CRUD, team member roster management

**API module:**
- [x] Create `api/team.api.ts`: teams CRUD, members CRUD + query hooks
- [x] Create `types/team.types.ts`: TeamDTO, CreateTeamDTO, UpdateTeamDTO, TeamMemberDTO, AddTeamMemberDTO

**Pages:**
- [x] Create Team List page — CSS grid card layout showing all teams with member count, age group, season chips
- [x] Create Team Detail page — team info header + member roster table with role chips and joined date

**Feature components:**
- [x] Create TeamFormDialog (mode: create/edit) — name, ageGroup, season fields with Zod validation
- [x] Create AddMemberDialog — search club users not yet in team, shows role chips, filters out existing members

**Schemas:**
- [x] Create `features/teams/schemas.ts`: teamSchema with i18n validation

**RBAC:**
- CLUB_ADMIN: CRUD all teams, manage all rosters
- COACH: view own teams, manage own team roster
- PLAYER/PARENT: view teams they belong to

### Phase 5: Pitch & Training Management + Monthly Calendar
**Goal:** Pitch CRUD, training scheduling (single + recurring), pitch schedule view, monthly calendar view

**API modules:**
- [ ] Create `api/pitch.api.ts`: pitches CRUD, getSchedule + query hooks
- [ ] Create `api/training.api.ts`: trainings CRUD, createRecurring, cancel + query hooks

**Pitch pages:**
- [ ] Create Pitch List page (CLUB_ADMIN manages, all view)
- [ ] Create PitchForm (mode: create/edit) — name, address, surfaceType, capacity
- [ ] Create Pitch Schedule page — calendar/timeline view of bookings for a pitch

**Training pages:**
- [ ] Create Training List page with two view modes:
  - **List view** — filtered table of trainings with sorting/search
  - **Monthly calendar view** — full month grid showing trainings per day (color-coded by team)
  - CLUB_ADMIN sees all, COACH/PLAYER/PARENT see own team trainings
  - Toggle between list/calendar via view switcher
- [ ] Create TrainingForm — single session: date, startTime, endTime, team, pitch, notes
- [ ] Create RecurringTrainingForm — day of week, date range, time, team, pitch, notes
- [ ] Create Training Detail page — training info + attendance section (Phase 6)
- [ ] Create Cancel Training action with confirmation

**Monthly Calendar (`features/calendar/`):**
- [ ] Create MonthlyCalendar component — full month grid (MUI-based, custom built)
  - Navigate between months (prev/next arrows + month/year selector)
  - Each day cell shows training sessions as colored chips (color = team)
  - Click on day → show day detail with all trainings
  - Click on training chip → navigate to training detail page
  - Today highlighted
  - Show pitch conflicts visually (overlapping time slots)
- [ ] Create DayDetailPopover — shows full list of trainings for selected day
- [ ] Create CalendarFilters — filter by team, pitch, status
- [ ] Add `/calendar` route to sidebar navigation (visible to all roles)

**RBAC:**
- CLUB_ADMIN/COACH: create/edit/cancel trainings (for their teams)
- All roles: view trainings and calendar for their teams

### Phase 6: Attendance
**Goal:** Attendance confirmation for players/parents, summary view for coaches/admins

**API module:**
- [ ] Create `api/attendance.api.ts`: getAttendance, updateAttendance, getSummary + query hooks

**Components (embedded in Training Detail page):**
- [ ] Create AttendanceList — shows all team members with status (PENDING/CONFIRMED/DECLINED)
- [ ] Create AttendanceSummary — counts: total, confirmed, declined, pending + visual bar
- [ ] Create ConfirmButton — PLAYER confirms/declines own attendance
- [ ] Create ParentConfirmButton — PARENT confirms/declines child's attendance

**RBAC:**
- CLUB_ADMIN/COACH: view full attendance list + summary
- PLAYER: see own status, confirm/decline
- PARENT: see child's status, confirm/decline for child

### Phase 7: Chat
**Goal:** Team conversations, direct messages, unread badges

**API module:**
- [ ] Create `api/chat.api.ts`: conversations CRUD, messages, markRead, unreadCount + query hooks

**Pages:**
- [ ] Create Conversation List page — team chats (auto-created) + direct chats
- [ ] Create Conversation page — message list with pagination + send form

**Components:**
- [ ] Create ConversationItem — avatar, name, last message preview, unread count, timestamp
- [ ] Create MessageList — messages with sender name, timestamp, own/other styling
- [ ] Create SendMessageForm — text input + send button
- [ ] Create NewDirectChatDialog — select club member to start direct conversation

**Polling:**
- [ ] Unread count badge on sidebar: poll every 30 seconds (`refetchInterval: 30000`)
- [ ] Active conversation messages: poll every 10 seconds (`refetchInterval: 10000`)
- [ ] Mark as read: PUT on conversation open

**RBAC:** All roles can send/view messages. Team chats visible only to team members.

### Phase 8: Player Statistics & Analytics
**Goal:** Per-player statistics, attendance analytics, team performance overview

**Backend endpoints needed (NEW — not yet in backend):**
- `GET /api/clubs/{clubId}/users/{userId}/statistics` — player attendance rate, training count, etc.
- `GET /api/clubs/{clubId}/teams/{teamId}/statistics` — team-level aggregates
- `GET /api/clubs/{clubId}/statistics/attendance?from=&to=` — club-wide attendance analytics

**API module:**
- [ ] Create `api/statistics.api.ts`: player stats, team stats, club analytics + query hooks

**Pages:**
- [ ] Create Player Statistics view (embedded in User Detail page)
- [ ] Create Team Statistics view (embedded in Team Detail page)
- [ ] Create Analytics Dashboard page (`features/statistics/AnalyticsPage.tsx`)

**Components (`features/statistics/components/`):**
- [ ] AttendanceRateCard — circular progress + percentage
- [ ] AttendanceTrendChart — line chart
- [ ] TeamComparisonChart — bar chart comparing teams
- [ ] PlayerStatsTable — sortable table with player name, attendance %, trainings count
- [ ] StatCard — reusable stat display (value, label, trend arrow)

**Route:** `/statistics` — CLUB_ADMIN/COACH only

### Phase 9: Shared Components & Polish
**Goal:** Reusable components, error handling, loading states, final UI polish

**Shared form components (`components/form/`):**
- [ ] TextFieldInput — MUI TextField + RHF Controller
- [ ] SelectFieldInput — MUI Select + RHF Controller
- [ ] DateFieldInput — MUI DatePicker + RHF Controller
- [ ] TimeFieldInput — MUI TimePicker + RHF Controller
- [ ] CheckboxFieldInput — MUI Checkbox + RHF Controller

**Shared UI components (`components/ui/`):**
- [ ] DataTable — reusable MUI DataGrid wrapper with pagination, sorting, search
- [ ] ConfirmDialog — MUI Dialog for destructive actions
- [ ] StatusChip — status display with color coding
- [ ] EmptyState — illustration + message for empty lists
- [ ] LoadingSkeleton — MUI Skeleton for data loading
- [ ] PageHeader — page title + breadcrumbs + action buttons

**Error handling:**
- [ ] Global error boundary (React ErrorBoundary)
- [ ] 404 page (route not found)
- [ ] 403 page (insufficient permissions)
- [ ] Toast notifications for API errors (global axios interceptor)
- [ ] Toast notifications for mutation success (per-mutation onSuccess)

**Responsive:**
- [ ] Sidebar: permanent on desktop, temporary Drawer on mobile
- [ ] Tables: horizontal scroll on narrow screens
- [ ] Forms: stack layout on mobile
- [ ] Header: compact on mobile

**Language:**
- [ ] Complete Estonian translation file
- [ ] Complete English translation file
- [ ] Language switcher persists choice in Zustand uiStore

---

## Routing Structure

```
# Public routes
/login                          # LoginPage
/register                       # RegisterPage

# Authenticated but no club
/no-club                        # NoClubPage ("waiting to be added")

# Master Admin routes (inside AdminLayout)
/admin/clubs                    # ClubListPage — all clubs
/admin/clubs/:clubId            # ClubDetailPage — manage specific club
/admin/users                    # Platform UserListPage — all users

# Club routes (inside AppLayout — requires club membership)
/dashboard                      # All roles — DashboardPage
/settings                       # CLUB_ADMIN only — ClubSettingsPage

/users                          # CLUB_ADMIN only — UserListPage
/users/:userId                  # CLUB_ADMIN only — UserDetailPage

/teams                          # All roles — TeamListPage
/teams/:teamId                  # All roles — TeamDetailPage

/trainings                      # All roles — TrainingListPage (list + calendar toggle)
/trainings/create               # CLUB_ADMIN/COACH — TrainingForm (create)
/trainings/:trainingId          # All roles — TrainingDetailPage (includes attendance)

/calendar                       # All roles — Monthly calendar view

/pitches                        # All roles — PitchListPage
/pitches/:pitchId/schedule      # CLUB_ADMIN — PitchSchedulePage

/statistics                     # CLUB_ADMIN/COACH — Analytics dashboard

/chat                           # All roles — ConversationListPage
/chat/:conversationId           # All roles — ConversationPage

/403                            # Forbidden page
/404                            # Not found page
```

---

## Sidebar Menu Structures

### Club Sidebar (for CLUB_ADMIN / COACH / PLAYER / PARENT)
```
┌──────────────────────────┐
│  [⚽]  Club Name          │  ← Club name from auth store
├──────────────────────────┤
│  PÕHILEHT                │  ← Section label
│  📊  Ülevaade            │  ← All roles
│  👥  Meeskonnad          │  ← All roles
│  🏋  Treeningud          │  ← All roles
│  🏟  Väljakud            │  ← All roles
│  📅  Kalender            │  ← All roles
│  💬  Sõnumid        [3]  │  ← All roles (unread badge)
├──────────────────────────┤
│  HALDUS                  │  ← CLUB_ADMIN/COACH section
│  👤  Kasutajad           │  ← CLUB_ADMIN only
│  📈  Statistika          │  ← CLUB_ADMIN/COACH
│  ⚙  Seaded               │  ← CLUB_ADMIN only
└──────────────────────────┘
│  [avatar] User Name      │
│  Klubi administraator    │
└──────────────────────────┘
```

### Master Admin Sidebar
```
┌──────────────────────────┐
│  [⚽]  Club Management    │  ← Platform name
├──────────────────────────┤
│  PLATVORM                │  ← Section label
│  🏢  Klubid              │  ← All clubs
│  👥  Kasutajad           │  ← All platform users
├──────────────────────────┤
│  [avatar] Platform Admin │
│  Peaadministraator       │
└──────────────────────────┘
```

---

## RBAC Matrix

| Action | Master Admin | Club Admin | Coach | Player | Parent |
|--------|-------------|------------|-------|--------|--------|
| Create/delete clubs | ✅ | — | — | — | — |
| Assign first Club Admin | ✅ | — | — | — | — |
| View all clubs | ✅ | — | — | — | — |
| Create user accounts | ✅ | — | — | — | — |
| Enter any club as admin | ✅ | — | — | — | — |
| Manage club settings | (via enter) | ✅ | — | — | — |
| Add/remove users to club | (via enter) | ✅ | — | — | — |
| Manage all teams | (via enter) | ✅ | — | — | — |
| Manage own team roster | — | ✅ | ✅ | — | — |
| Manage pitches | (via enter) | ✅ | — | — | — |
| Create/edit training | — | ✅ | ✅ | — | — |
| Cancel training | — | ✅ | ✅ | — | — |
| View own team trainings | — | ✅ | ✅ | ✅ | ✅ |
| Confirm attendance (self) | — | — | — | ✅ | — |
| Confirm attendance (child) | — | — | — | — | ✅ |
| View attendance summary | — | ✅ | ✅ | — | — |
| View statistics | — | ✅ | ✅ | — | — |
| Send/view messages | — | ✅ | ✅ | ✅ | ✅ |

---

## Key Technical Patterns

### API Module Structure
Every `api/*.api.ts` file follows this pattern (from emde-fe):
1. **Query key factory** — typed, hierarchical keys
2. **API functions** — raw axios calls returning typed data
3. **Query hooks** — `useQuery()` wrappers with proper keys
4. **Mutation hooks** — `useMutation()` with `onSuccess` cache invalidation

### Form Architecture
Every feature with forms follows this pattern (from coop-admin):
1. **Zod schema** in `features/xxx/schemas.ts` — accepts `t()` for i18n messages
2. **Form component** in `features/xxx/components/XxxForm.tsx` — reusable for create/edit via `mode` prop
3. **Page component** — wraps form with data loading (edit) or empty defaults (create)

### Permission Checks
Three levels (from emde-fe):
1. **Route level** — `<RoleGuard roles={['CLUB_ADMIN']}>` or `<MasterAdminGuard>` wraps protected routes
2. **Component level** — `{isClubAdmin && <Button>Delete</Button>}` via `usePermissions()`
3. **Menu level** — Sidebar items conditionally rendered by role

---

## Backend API Reference

### Platform Admin (MASTER_ADMIN only)
```
GET    /api/admin/clubs                          → Page<ClubDTO>
POST   /api/admin/clubs                          → CreateClubDTO → ClubDTO
DELETE /api/admin/clubs/{clubId}                  → void
GET    /api/admin/users                           → Page<UserDTO>
POST   /api/admin/users                           → AdminCreateUserDTO → UserDTO
POST   /api/admin/clubs/{clubId}/admins           → AssignAdminDTO → UserDTO
```

### Auth (public)
```
POST   /api/auth/register          → RegisterRequestDTO → UserDTO
POST   /api/auth/login             → LoginRequestDTO → AuthResponseDTO
POST   /api/auth/refresh           → RefreshTokenRequestDTO → AuthResponseDTO
GET    /api/auth/me                → UserDTO (includes systemRole, role, clubId)
```

### Club (CLUB_ADMIN manages, all members view)
```
GET    /api/clubs/{clubId}                              → ClubDTO
PUT    /api/clubs/{clubId}                              → UpdateClubDTO → ClubDTO
```

### Users
```
GET    /api/clubs/{clubId}/users                        → Page<UserDTO>
POST   /api/clubs/{clubId}/users                        → AddUserToClubDTO → UserDTO
GET    /api/clubs/{clubId}/users/{userId}               → UserDTO
PUT    /api/clubs/{clubId}/users/{userId}               → UpdateUserDTO → UserDTO
DELETE /api/clubs/{clubId}/users/{userId}               → void
GET    /api/users/unaffiliated?search=                  → Page<UserDTO>
```

### Parent-child
```
GET    /api/clubs/{clubId}/users/{userId}/parents       → List<UserDTO>
POST   /api/clubs/{clubId}/users/{userId}/parents       → LinkParentDTO → void
DELETE /api/clubs/{clubId}/users/{userId}/parents/{pId}  → void
GET    /api/clubs/{clubId}/users/{userId}/children      → List<UserDTO>
```

### Teams
```
GET    /api/clubs/{clubId}/teams                        → List<TeamDTO>
POST   /api/clubs/{clubId}/teams                        → CreateTeamDTO → TeamDTO
GET    /api/clubs/{clubId}/teams/{teamId}               → TeamDTO
PUT    /api/clubs/{clubId}/teams/{teamId}               → UpdateTeamDTO → TeamDTO
DELETE /api/clubs/{clubId}/teams/{teamId}               → void
GET    /api/clubs/{clubId}/teams/{teamId}/members       → List<TeamMemberDTO>
POST   /api/clubs/{clubId}/teams/{teamId}/members       → AddTeamMemberDTO → TeamMemberDTO
DELETE /api/clubs/{clubId}/teams/{teamId}/members/{uId}  → void
```

### Trainings
```
GET    /api/clubs/{clubId}/trainings                    → List<TrainingSessionDTO>
GET    /api/clubs/{clubId}/trainings/{trainingId}       → TrainingSessionDTO
POST   /api/clubs/{clubId}/teams/{teamId}/trainings     → CreateTrainingSessionDTO → TrainingSessionDTO
POST   /api/clubs/{clubId}/teams/{teamId}/trainings/recurring → CreateRecurringTrainingDTO → List<TrainingSessionDTO>
PUT    /api/clubs/{clubId}/trainings/{trainingId}       → UpdateTrainingSessionDTO → TrainingSessionDTO
PUT    /api/clubs/{clubId}/trainings/{trainingId}/cancel → void
DELETE /api/clubs/{clubId}/trainings/{trainingId}       → void
```

### Pitches
```
GET    /api/clubs/{clubId}/pitches                      → List<PitchDTO>
POST   /api/clubs/{clubId}/pitches                      → CreatePitchDTO → PitchDTO
GET    /api/clubs/{clubId}/pitches/{pitchId}            → PitchDTO
PUT    /api/clubs/{clubId}/pitches/{pitchId}            → UpdatePitchDTO → PitchDTO
DELETE /api/clubs/{clubId}/pitches/{pitchId}            → void
GET    /api/clubs/{clubId}/pitches/{pitchId}/schedule?startDate=&endDate= → List<TrainingSessionDTO>
```

### Attendance
```
GET    /api/clubs/{clubId}/trainings/{tId}/attendance          → List<AttendanceDTO>
GET    /api/clubs/{clubId}/trainings/{tId}/attendance/summary  → AttendanceSummaryDTO
PUT    /api/clubs/{clubId}/trainings/{tId}/attendance/{userId}  → UpdateAttendanceDTO → AttendanceDTO
```

### Chat
```
GET    /api/clubs/{clubId}/conversations                       → List<ConversationDTO>
POST   /api/clubs/{clubId}/conversations                       → CreateDirectConversationDTO → ConversationDTO
GET    /api/clubs/{clubId}/conversations/{id}                  → ConversationDTO
GET    /api/clubs/{clubId}/conversations/{id}/messages          → Page<MessageDTO>
POST   /api/clubs/{clubId}/conversations/{id}/messages          → SendMessageDTO → MessageDTO
PUT    /api/clubs/{clubId}/conversations/{id}/read              → void
GET    /api/clubs/{clubId}/conversations/unread-count           → number
```

---

## Current Status

**Phase 0:** ✅ COMPLETE
**Phase 1:** ✅ COMPLETE
**Phase 2:** ✅ COMPLETE
**Phase 3:** NOT STARTED — next up

**Design mockups completed:**
- `.claude/mockups/auth/01-login.html` — Login page
- `.claude/mockups/auth/02-register.html` — Register page (needs update: remove club name field, add dateOfBirth + phone, update info box text)
- `.claude/mockups/auth/03-layout-shell.html` — Club layout shell (sidebar + header)
- `.claude/mockups/color-preview.html` — Dashboard with color palette

**Design mockups needed:**
- Master Admin dashboard (club list)
- Master Admin club detail page
- No-club waiting page
