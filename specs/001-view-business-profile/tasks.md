# view-business-profile — Tasks

Brief: Implement single-page React+TS view for a business profile using a validated canonical JSON fixture, accessible collapsible sections, role-gated inline & modal editors, preview/undo, local persistence, i18n/RTL basics, and baseline tests/CI.

Milestone entry checklist (must be true before starting each Mx):
- M1: branch feat/view-business-profile created and repo ready to add frontend/
- M2: M1 delivered and Profile renders from validated fixture
- M3: M2 delivered and collapse/navigation stable
- M4: M3 delivered and editors validated locally
- M5: M4 delivered and CI test runners configured

Phases: M1..M5 (priority & order follow plan)

M1 — Scaffold, data & render (2.5d)
- [ ] T001 Scaffold Vite + React 19 + TypeScript app (frontend/package.json, frontend/vite.config.ts, frontend/src/main.tsx)
  - Owner: @dev | Estimate: 0.5d | Depends: none
  - Acceptance: npm install && npm run dev starts app and main.tsx mounts to DOM
  - GitHub issue: "Scaffold frontend (Vite + React 19 + TS)"

- [ ] T002 [P] Add canonical fixture at frontend/src/fixtures/initial-input/profile.json
  - Owner: @dev | Estimate: 0.5d | Depends: T001
  - Acceptance: fixture includes profileId, title, sections[], content, lastUpdated, lastEditedByUserId, and editableBy
  - GitHub issue: "Add initial profile JSON fixture"

- [ ] T003 [P] Add Profile Zod schema and fixture validation (frontend/src/domain/profileSchema.ts)
  - Owner: @dev | Estimate: 0.5d | Depends: T001,T002
  - Acceptance: fixture validates on import; missing required fields, invalid roles, invalid email, and invalid phone fail schema tests
  - GitHub issue: "Add profile schema and fixture validation"

- [ ] T004 [P] Add design tokens, CSS Modules baseline, and responsive layout primitives (frontend/src/styles/tokens.css, frontend/src/styles/globals.module.css)
  - Owner: @dev | Estimate: 0.5d | Depends: T001
  - Acceptance: tokens (--color-*, --spacing-*) are imported in main.tsx; section layout supports mobile single-column and desktop two-column behavior
  - GitHub issue: "Add design tokens and responsive CSS baseline"

- [ ] T005 Implement ProfileContext + reducer for profile, draft, preview, collapse, undo, and current role (frontend/src/context/ProfileContext.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T003,T004
  - Acceptance: context provides validated profile state, current viewer role, edit/preview/undo actions, and in-memory draft state
  - GitHub issue: "Implement ProfileContext and reducer"

- [ ] T006 Build Profile, Section, and SectionHeader components; wire validated fixture (frontend/src/features/view-business-profile/Profile.tsx, frontend/src/features/view-business-profile/Section/Section.tsx, frontend/src/features/view-business-profile/Section/SectionHeader.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T005
  - Acceptance: Profile renders sections from the validated fixture; SectionHeader shows title and non-functional edit affordance placeholder
  - GitHub issue: "Render profile sections from validated fixture"

M2 — Collapse & navigation (1d)
- [ ] T007 Implement accessible collapse + URL fragment sync (frontend/src/features/view-business-profile/Section/Accordion.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T006
  - Acceptance: toggles are keyboard operable, aria-expanded is present, focus is retained, animation runs within 200-300ms, and URL fragment reflects open section and vice versa
  - GitHub issue: "Add accessible collapse + fragment sync"

M3 — Permissions, edit flows & validation (3.5d)
- [ ] T008 Implement role-based edit gating (frontend/src/domain/permissions.ts, frontend/src/features/view-business-profile/Section/SectionHeader.tsx)
  - Owner: @dev | Estimate: 0.5d | Depends: T006
  - Acceptance: visitors never see edit controls; owners/editors only see controls for sections where their role is in editableBy
  - GitHub issue: "Implement role-based edit controls"

- [ ] T009 Inline editor using React Hook Form + Zod for simple fields (frontend/src/features/view-business-profile/editors/InlineEditor.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T007,T008
  - Acceptance: inline edit opens, validates required fields, Cancel reverts local draft, and Save updates context
  - GitHub issue: "Implement inline editor with validation"

- [ ] T010 Modal/Drawer editor using Radix Dialog for structured sections (frontend/src/features/view-business-profile/editors/ModalEditor.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T009
  - Acceptance: modal opens with focus trap, validates structured content on Save, and Cancel reverts
  - GitHub issue: "Add modal/drawer editor for rich sections"

- [ ] T011 Icons, micro-interactions, and animation polish (frontend/src/components/icons/index.tsx, frontend/src/styles/animations.css)
  - Owner: @dev | Estimate: 0.5d | Depends: T007,T009,T010
  - Acceptance: lucide chevrons/edit icons are present; hover/focus affordances are visible; collapse animation remains within 200-300ms
  - GitHub issue: "Add icons and micro-interactions"

M4 — Preview, undo, and local persistence (2d)
- [ ] T012 Preview mode, undo stack, and toast UX (frontend/src/features/view-business-profile/PreviewToggle.tsx, frontend/src/components/Toast.tsx)
  - Owner: @dev | Estimate: 1.5d | Depends: T009,T010,T005
  - Acceptance: preview shows unsaved changes, Save applies, Undo is available for 30s after save, and toasts show confirmations/errors
  - GitHub issue: "Implement preview, undo stack and toasts"

- [ ] T013 Persistence adapter and profile API stub (frontend/src/api/profileApi.ts, frontend/src/api/localProfileStorage.ts)
  - Owner: @dev | Estimate: 0.5d | Depends: T012
  - Acceptance: Save calls profileApi.save, persists through local adapter, updates lastUpdated and lastEditedByUserId, and handles success/failure for optimistic UI
  - GitHub issue: "Add local persistence adapter and save metadata"

M5 — Tests, i18n, performance & CI (2.5d)
- [ ] T014 Externalize UI strings, add locale date formatting, and support RTL smoke styling (frontend/src/i18n/messages.ts, frontend/src/i18n/format.ts, frontend/src/styles/direction.css)
  - Owner: @dev | Estimate: 0.5d | Depends: T010,T013
  - Acceptance: core UI labels are not hard-coded inside feature components; dates display via locale-aware formatter; profile view renders correctly under rtl direction
  - GitHub issue: "Add i18n helpers and RTL smoke support"

- [ ] T015 Unit tests for schema, permissions, components, reducer, and edge cases (frontend/tests/unit/profile.test.tsx, frontend/tests/unit/profileSchema.test.ts, frontend/tests/unit/permissions.test.ts)
  - Owner: @dev | Estimate: 1d | Depends: T003,T005,T006,T008,T013
  - Acceptance: deterministic tests cover schema validation, visitor/owner/editor permissions, reducer actions, empty sections, very long content, invalid email, and invalid phone
  - GitHub issue: "Add unit tests for profile behavior and edge cases"

- [ ] T016 E2E Playwright + axe accessibility checks (frontend/playwright.config.ts, frontend/tests/e2e/profile.spec.ts)
  - Owner: @dev | Estimate: 1d | Depends: T007,T012,T014
  - Acceptance: Playwright covers view/collapse/edit/preview/save/undo flows, mobile single-column layout, desktop two-column layout, RTL smoke scenario, and axe accessibility checks
  - GitHub issue: "Add Playwright E2E and axe accessibility checks"

- [ ] T017 Lighthouse CI baseline with explicit budgets (frontend/ci/lighthouseci.yml, frontend/docs/perf-baseline.md)
  - Owner: @dev | Estimate: 0.5d | Depends: T015,T016
  - Acceptance: Lighthouse baseline is documented; CI asserts Performance >= 90, Accessibility >= 90, Best Practices >= 90, and 3G-equivalent load target <= 2s
  - GitHub issue: "Add Lighthouse CI budgets and baseline"

- [ ] T018 Final QA, accessibility fixes, and performance tuning (frontend/docs/final-qa.md)
  - Owner: @dev | Estimate: 1d | Depends: T015,T016,T017
  - Acceptance: final QA records pass/fail status for responsive layout, WCAG 2.1 AA checks, performance budget, edge cases, and save/undo behavior
  - GitHub issue: "Finalize QA and polish"

Dependencies summary: follow Task IDs. Parallel opportunities: T002 and T004 can run after T001; T003 can begin once T002 exists; T011 can be worked in parallel with editor implementation after T007; T015 schema/permission tests can start before full E2E work once T003/T008 are complete.

Suggested MVP: M1 + M2 + role-gated minimal inline editor (T001..T009) — deliverable: view + accessible collapse + permission-aware basic edit/save in-memory.

Format validation: All tasks use checklist format, include Task IDs, file paths, owner (@dev), estimates, dependencies, acceptance criteria, and GitHub issue titles.
