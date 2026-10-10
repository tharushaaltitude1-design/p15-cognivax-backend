# Cognivax — Phase 1
Enterprise Reasoning & Knowledge Engine. A complete dark demo workspace, with no backend or real authentication.

## Setup
```sh
bun install
bun run dev
bun run test
```
The project uses React 19, TypeScript, Vite, TanStack Start/Router and Query, Tailwind v4, shadcn/ui, react-hook-form, Zod, Lucide, Recharts, Sonner and date-fns. Routing and CSS configuration follow the hosted template rather than legacy React Router or tailwind.config conventions.

## Structure
- `src/routes`: automatically code-split file-based pages; parent layouts and index leaves.
- `src/components/layout`: floating sidebar, top bar, mobile navigation and command palette.
- `src/components/common`: shared headers, panels, statuses, avatars, dialogs and fields.
- `src/features/modules`: one configurable list/detail/form kit for all five modules.
- `src/features/dashboard`: charts, attention feed, recent records and reviews.
- `src/features/workspace`: governance, feeds, search, profile and settings.
- `src/config`: navigation, module definitions and status mapping.
- `src/types`: typed records and workspace contracts.
- `src/data/seed`: 20 records per module, 10 team members, 60 audit events, 15 notifications and 8 exceptions.
- `src/services`: Repository interface, LocalRepository, workspace service, query hooks and exports.

## Demo storage
Repositories expose promise-based list, getById, create, update and remove methods with 240 ms mock latency. Browser localStorage persists the workspace. All record mutations produce audit events, status changes generate notifications, and reverse links are discovered from incoming references. Settings can export/import JSON or restore the initial workspace. Attachments store metadata only; profile photos are local data URLs. Invitations, passwords, sessions, webhooks and API keys are explicit demo interactions without external delivery or authentication.

## Phase 2: Firebase migration
Implement the Repository contract with Firestore and replace the exported repository instances in `src/services/repository.ts`. Preserve record IDs, collection types, query keys and mutation semantics. Move the activity/notification effects to transactional writes or trusted Firebase functions and replace workspaceService with a Firestore-backed implementation. Add real identity, file storage and integrations only in Phase 2. No Firebase credentials are required for Phase 1.

## Verification
Vitest covers route matching, fixed-user values, required seed counts, cross-link integrity and repository audit/notification behavior. Browser checks exercised all main pages, create/edit/read-back/delete, reload persistence and command search. All main pages were checked for horizontal overflow at 320, 360, 390, 430, 768, 820, 1024, 1280, 1440 and 1920 px.
