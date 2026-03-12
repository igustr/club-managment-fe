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

## Backend Changes Needed

The frontend uses simplified routes (no `clubId` in URL). The backend currently requires `clubId` in every URL path. Two options:

### Option A: Frontend reads clubId from auth store (RECOMMENDED — no backend changes)
The `/api/auth/me` endpoint already returns `UserDTO` with `clubId`. The frontend stores this in Zustand and passes it to every API call. **No backend changes needed.** The API modules in the frontend will inject `clubId` automatically:

```typescript
// hooks/useClubId.ts
export const useClubId = () => useAuthStore(state => state.user?.clubId);

// api/team.api.ts — clubId injected from store, not from URL
export const useTeams = () => {
  const clubId = useAuthStore.getState().user?.clubId;
  return useQuery({ queryKey: teamKeys.list(clubId!), queryFn: () => getTeams(clubId!) });
};
```

### Option B: Backend adds club-implicit endpoints (alternative)
Add endpoints that infer clubId from the JWT token, e.g. `GET /api/my/teams` instead of `GET /api/clubs/{clubId}/teams`. This is cleaner long-term but requires backend changes. **Defer to later if needed.**

---

## Development Phases

### Phase 0: Project Setup
**Goal:** Replace Next.js scaffold with Vite + React + TypeScript, install all dependencies, configure tooling

- [ ] Remove Next.js files (app/, next.config.ts, next-env.d.ts, postcss.config.mjs, eslint.config.mjs)
- [ ] Init Vite + React + TypeScript (`npm create vite@latest . -- --template react-ts`)
- [ ] Install core dependencies:
  - `@mui/material @mui/icons-material @emotion/react @emotion/styled`
  - `react-router-dom@7`
  - `@tanstack/react-query @tanstack/react-query-devtools`
  - `axios`
  - `react-hook-form @hookform/resolvers zod`
  - `react-i18next i18next i18next-browser-languagedetector`
  - `zustand`
  - `react-hot-toast`
  - `dayjs`
- [ ] Install dev dependencies: `prettier eslint-config-prettier eslint-plugin-react-hooks`
- [ ] Configure ESLint + Prettier
- [ ] Configure `tsconfig.json` (strict mode, path aliases `@/*` → `./src/*`)
- [ ] Configure `vite.config.ts` (path aliases, proxy to `http://localhost:8080/api`)
- [ ] Create `.env` with `VITE_API_BASE_URL=http://localhost:8080`
- [ ] Create base `src/` directory structure per CLAUDE.md architecture
- [ ] Create placeholder MUI theme (`src/theme.ts`) — colors TBD
- [ ] Verify `npm run dev` starts cleanly with blank MUI app

### Phase 1: Auth & Core Infrastructure
**Goal:** Login/register, JWT management, protected routing, app layout shell with sidebar

**Auth infrastructure:**
- [ ] Create TypeScript types (`types/auth.types.ts`, `types/common.types.ts`) matching backend DTOs
- [ ] Create Axios instance (`api/axios.ts`):
  - Base URL from env
  - Request interceptor: attach JWT from Zustand store
  - Response interceptor: 401 → clear tokens, redirect to /login
- [ ] Create TanStack Query client (`api/query-client.ts`) with default options
- [ ] Create Zustand auth store (`stores/authStore.ts`):
  - State: `user: UserDTO | null`, `accessToken`, `refreshToken`, `isAuthenticated`
  - Actions: `login(tokens)`, `logout()`, `setUser(user)`, `getClubId()`
  - Persist token in localStorage, restore on app init
- [ ] Create Zustand UI store (`stores/uiStore.ts`): `sidebarCollapsed`, `language`
- [ ] Create auth API module (`api/auth.api.ts`): login, register, refresh, getMe + query hooks

**Auth pages:**
- [ ] Create Login page (`features/auth/LoginPage.tsx`) with MUI form + Zod schema
- [ ] Create Register page (`features/auth/RegisterPage.tsx`) with MUI form + Zod schema

**Layout shell (from coop-admin + partner-admin-ui patterns):**
- [ ] Create AppLayout (`components/layout/AppLayout.tsx`): MUI Box with Drawer + AppBar + main
- [ ] Create Sidebar (`components/layout/Sidebar.tsx`):
  - MUI permanent Drawer (desktop) / temporary Drawer (mobile)
  - Collapsible: 240px → 64px icons-only
  - Role-gated menu items (using `usePermissions()`)
  - Menu sections: Dashboard, Teams, Trainings, Pitches, Chat [badge], separator, Users (ADMIN), Settings (ADMIN)
  - Active link highlighting
- [ ] Create Header (`components/layout/Header.tsx`):
  - MUI AppBar with hamburger toggle
  - Club name display
  - Language switcher (ET/EN dropdown)
  - User avatar + dropdown menu (profile info, logout)

**Routing & guards:**
- [ ] Create `usePermissions()` hook (`hooks/usePermissions.ts`)
- [ ] Create `useClubId()` hook (`hooks/useClubId.ts`)
- [ ] Create `ProtectedRoute` component (redirects to /login if not authenticated)
- [ ] Create `RoleGuard` component (checks role, shows 403 if insufficient)
- [ ] Set up React Router with public routes (/login, /register) and protected routes inside AppLayout
- [ ] Set up lazy loading for all feature pages

**i18n:**
- [ ] Set up react-i18next with Estonian (default) + English
- [ ] Create initial translation files with auth + layout keys

**Providers:**
- [ ] Wire up App.tsx with: QueryClientProvider, RouterProvider, ThemeProvider, Toaster

**Verify:** Can login with seeded admin user → see dashboard with sidebar → token persists on refresh → logout works

### Phase 2: Club & User Management
**Goal:** Club settings page, user list, add/remove users, role management, parent-child linking

**API modules:**
- [ ] Create `api/club.api.ts`: getClub, updateClub + query hooks
- [ ] Create `api/user.api.ts`: getUsers, getUser, addUserToClub, updateUser, removeUser, searchUnaffiliated, parents/children CRUD + query hooks

**Pages:**
- [ ] Create Dashboard page (`features/dashboard/DashboardPage.tsx`) — overview cards (team count, upcoming trainings, unread messages)
- [ ] Create Club Settings page (`features/clubs/ClubSettingsPage.tsx`) — ADMIN only, edit name/contact
- [ ] Create User List page (`features/users/UserListPage.tsx`) — MUI DataGrid with role badges, search, pagination
- [ ] Create User Detail page (`features/users/UserDetailPage.tsx`) — profile info, role management, parent-child links

**Feature components:**
- [ ] Create AddUserDialog — search unaffiliated users, assign role, add to club
- [ ] Create RoleBadge — MUI Chip with role-specific color
- [ ] Create ParentLinkForm — link/unlink parent to player
- [ ] Create ConfirmDialog — shared reusable confirmation dialog

**Schemas:**
- [ ] Zod schemas for club settings form, add user form, update user form

**RBAC:** Only ADMIN sees Users menu item and Club Settings

### Phase 3: Team Management
**Goal:** Team CRUD, team member roster management

**API module:**
- [ ] Create `api/team.api.ts`: teams CRUD, members CRUD + query hooks

**Pages:**
- [ ] Create Team List page — MUI cards or table showing all teams with member count
- [ ] Create Team Detail page — team info header + member roster table

**Feature components:**
- [ ] Create TeamForm (mode: create/edit) — name, ageGroup, season fields
- [ ] Create MemberRoster — table of team members with role/joinedDate
- [ ] Create AddMemberDialog — search club users not yet in team, add with role

**RBAC:**
- ADMIN: CRUD all teams, manage all rosters
- COACH: view own teams, manage own team roster
- PLAYER/PARENT: view teams they belong to

### Phase 4: Pitch & Training Management
**Goal:** Pitch CRUD, training scheduling (single + recurring), pitch schedule view

**API modules:**
- [ ] Create `api/pitch.api.ts`: pitches CRUD, getSchedule + query hooks
- [ ] Create `api/training.api.ts`: trainings CRUD, createRecurring, cancel + query hooks

**Pitch pages:**
- [ ] Create Pitch List page (ADMIN manages, all view)
- [ ] Create PitchForm (mode: create/edit) — name, address, surfaceType, capacity
- [ ] Create Pitch Schedule page — calendar/timeline view of bookings for a pitch

**Training pages:**
- [ ] Create Training List page — filtered list/calendar of trainings
  - ADMIN sees all, COACH/PLAYER/PARENT see own team trainings
- [ ] Create TrainingForm — single session: date, startTime, endTime, team, pitch, notes
- [ ] Create RecurringTrainingForm — day of week, date range, time, team, pitch, notes
- [ ] Create Training Detail page — training info + attendance section (Phase 5)
- [ ] Create Cancel Training action with confirmation

**RBAC:**
- ADMIN/COACH: create/edit/cancel trainings (for their teams)
- All roles: view trainings for their teams

### Phase 5: Attendance
**Goal:** Attendance confirmation for players/parents, summary view for coaches/admins

**API module:**
- [ ] Create `api/attendance.api.ts`: getAttendance, updateAttendance, getSummary + query hooks

**Components (embedded in Training Detail page):**
- [ ] Create AttendanceList — shows all team members with status (PENDING/CONFIRMED/DECLINED)
- [ ] Create AttendanceSummary — counts: total, confirmed, declined, pending + visual bar
- [ ] Create ConfirmButton — PLAYER confirms/declines own attendance
- [ ] Create ParentConfirmButton — PARENT confirms/declines child's attendance

**RBAC:**
- ADMIN/COACH: view full attendance list + summary
- PLAYER: see own status, confirm/decline
- PARENT: see child's status, confirm/decline for child

### Phase 6: Chat
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

### Phase 7: Shared Components & Polish
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
/login                          # Public — LoginPage
/register                       # Public — RegisterPage

# Protected routes (inside AppLayout with sidebar)
/dashboard                      # All roles — DashboardPage
/settings                       # ADMIN only — ClubSettingsPage

/users                          # ADMIN only — UserListPage
/users/:userId                  # ADMIN only — UserDetailPage

/teams                          # All roles — TeamListPage
/teams/:teamId                  # All roles — TeamDetailPage

/trainings                      # All roles — TrainingListPage
/trainings/create               # ADMIN/COACH — TrainingForm (create)
/trainings/:trainingId          # All roles — TrainingDetailPage (includes attendance)

/pitches                        # All roles — PitchListPage
/pitches/:pitchId/schedule      # ADMIN — PitchSchedulePage

/chat                           # All roles — ConversationListPage
/chat/:conversationId           # All roles — ConversationPage

/403                            # Forbidden page
/404                            # Not found page
```

---

## Sidebar Menu Structure

```
┌──────────────────────┐
│  🏟️  Club Name       │  ← Club name from auth store
├──────────────────────┤
│  📊  Dashboard       │  ← All roles
│  👥  Teams           │  ← All roles
│  🏋️  Trainings       │  ← All roles
│  🏟️  Pitches         │  ← All roles
│  💬  Chat       [3]  │  ← All roles (unread badge)
├──────────────────────┤  ← Separator (ADMIN section below)
│  👤  Users           │  ← ADMIN only
│  ⚙️  Settings        │  ← ADMIN only
└──────────────────────┘
```

Menu items use MUI icons (not emoji). Unread badge uses MUI Badge component.

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
1. **Route level** — `<RoleGuard roles={['ADMIN']}>` wraps admin-only routes
2. **Component level** — `{isAdmin && <Button>Delete</Button>}` via `usePermissions()`
3. **Menu level** — Sidebar items conditionally rendered by role

---

## Current Status

**Phase:** 0 (Project Setup) — NOT STARTED
**Next action:** Remove Next.js scaffold, init Vite + React + TypeScript
