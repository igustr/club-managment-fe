---
name: project_architecture_decisions
description: Finalized tech stack and architecture decisions for club-managment-fe (2026-03-12)
type: project
---

Architecture decisions confirmed on 2026-03-12:

- **UI library:** MUI 6 (Material UI)
- **Toast notifications:** react-hot-toast (not notistack, not react-toastify)
- **Routes:** Simplified — no `/clubs/:clubId/` prefix. clubId read from auth store. Backend needs endpoint changes to support this.
- **Chat polling:** 30s for unread count (sidebar badge), 10s when viewing conversation
- **Design:** Web-first, desktop-centric. Mobile compatible but not mobile-first.
- **Colors/theme:** TBD — Estonian football context, will discuss later
- **Reference projects:** emde-fe (primary, closest stack), coop-admin (JWT/auth), partner-admin-ui (sidebar/layout), club-managment-be (backend API)

**Why:** These decisions come from analyzing 3 reference projects + thesis requirements + user preference.

**How to apply:** All implementation must follow these choices. Do not suggest alternatives unless asked.
