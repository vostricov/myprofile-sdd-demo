# view-business-profile — Tasks

Brief: Implement single-page React+TS view for a business profile using a canonical JSON fixture, accessible collapsible sections, inline & modal editors, preview/undo, and baseline tests/CI.

Milestone entry checklist (must be true before starting each Mx):
- M1: repo scaffolded or ready to add frontend/, branch feat/view-business-profile created
- M2: M1 delivered and Profile renders from fixture
- M3: M2 delivered and collapse/navigation stable
- M4: M3 delivered and editors validated locally
- M5: M4 delivered and CI test runners configured

Phases: M1..M5 (priority & order follow plan)

M1 — Data & render (2d)
- [ ] T001 [P] Add canonical fixture at frontend/src/fixtures/initial-input/profile.json
  - Owner: @dev | Estimate: 0.5d | Depends: none
  - Acceptance: fixture matches spec data model (profileId, sections[], fields) and loads via import
  - GitHub issue: "Add initial profile JSON fixture"

- [ ] T002 Scaffold Vite + React 19 + TypeScript app (frontend/package.json, vite.config.ts, frontend/src/main.tsx)
  - Owner: @dev | Estimate: 0.5d | Depends: T001
  - Acceptance: npm install && npm run dev starts app and main.tsx mounts to DOM
  - GitHub issue: "Scaffold frontend (Vite + React 19 + TS)"

- [ ] T003 Add design tokens and CSS Modules baseline (frontend/src/styles/tokens.css, frontend/src/styles/globals.module.css)
  - Owner: @dev | Estimate: 0.5d | Depends: T002
  - Acceptance: tokens (--color-*, --spacing-*) available and imported in main.tsx
  - GitHub issue: "Add design tokens and CSS Modules baseline"

- [ ] T004 Implement ProfileContext + reducer for draft/preview/collapse/undo (frontend/src/context/ProfileContext.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T001,T002,T003
  - Acceptance: context provides profile state, actions for edit/preview/undo and persists in-memory draft
  - GitHub issue: "Implement ProfileContext and reducer"

- [ ] T005 Build Profile, Section and SectionHeader components; wire fixtures (frontend/src/features/view-business-profile/Profile.tsx, frontend/src/features/view-business-profile/Section/Section.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T004
  - Acceptance: Profile renders sections from fixture; SectionHeader shows title and edit affordance placeholder
  - GitHub issue: "Render profile sections from fixture"

M2 — Collapse & navigation (1d)
- [ ] T006 Implement accessible collapse (Radix Accordion or custom) + URL fragment sync (frontend/src/features/view-business-profile/Section/Accordion.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T005
  - Acceptance: toggles keyboard operable, aria-expanded present, URL fragment reflects open section and vice-versa
  - GitHub issue: "Add accessible collapse + fragment sync"

M3 — Edit flows & validation (3d)
- [ ] T007 Inline editor using React Hook Form + Zod for simple fields (frontend/src/features/view-business-profile/editors/InlineEditor.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T006
  - Acceptance: inline edit opens, validates required fields, Cancel reverts local draft, Save updates context
  - GitHub issue: "Implement inline editor with validation"

- [ ] T008 Modal/Drawer editor (Radix Dialog) for rich sections (frontend/src/features/view-business-profile/editors/ModalEditor.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T007
  - Acceptance: modal opens with focus trap, validation on Save, Cancel reverts
  - GitHub issue: "Add modal/drawer editor for rich sections"

- [ ] T009 Icons, micro-interactions, animations polish (frontend/src/components/icons/*, frontend/src/styles/animations.css)
  - Owner: @dev | Estimate: 0.5d | Depends: T007,T008
  - Acceptance: chevrons, edit icons present; collapse animation within 200-300ms
  - GitHub issue: "Add icons and micro-interactions"

M4 — Preview, undo, and persistence hooks (2d)
- [ ] T010 Preview mode, undo stack, toast UX (frontend/src/features/view-business-profile/preview.tsx, frontend/src/components/Toast.tsx)
  - Owner: @dev | Estimate: 1.5d | Depends: T008,T004
  - Acceptance: preview shows unsaved changes, Save applies, Undo available for 30s after save, toasts show confirmations/errors
  - GitHub issue: "Implement preview, undo stack and toasts"

- [ ] T011 Persistence hooks (stubbed client API + local save) (frontend/src/api/profileApi.ts)
  - Owner: @dev | Estimate: 0.5d | Depends: T010
  - Acceptance: Save triggers profileApi.save which returns success/failure; local optimistic UI handled
  - GitHub issue: "Add client persistence hooks (stub API)"

M5 — Tests & CI (2d)
- [ ] T012 Unit tests (Vitest + RTL) for components & reducer (frontend/tests/unit/profile.test.tsx)
  - Owner: @dev | Estimate: 1d | Depends: T005,T004
  - Acceptance: core components and reducer covered by deterministic unit tests; CI runs them
  - GitHub issue: "Add unit tests for profile components and reducer"

- [ ] T013 E2E Playwright + axe accessibility checks (playwright.config.ts, tests/e2e/profile.spec.ts)
  - Owner: @dev | Estimate: 1d | Depends: T006,T010
  - Acceptance: Playwright runs and reports axe results; core flows pass accessibility checks
  - GitHub issue: "Add Playwright E2E and axe accessibility checks"

- [ ] T014 Lighthouse CI baseline & final QA fixes (ci/lighthouseci.yml, docs/perf-baseline.md)
  - Owner: @dev | Estimate: 0.5d | Depends: T012,T013
  - Acceptance: Lighthouse baseline run committed and final QA items addressed
  - GitHub issue: "Add Lighthouse CI baseline and finalize QA"

Dependencies summary: follow Task IDs (linear where listed). Parallel opportunities: T001 and T003 are parallelizable with T002 once scaffold exists; T009 (icons) can be worked in parallel with editors (T007/T008).

Suggested MVP: M1 + M2 + minimal inline editor (T001..T007) — deliverable: view + accessible collapse + basic edit/save in-memory.

Format validation: All tasks use checklist format, include Task IDs, file paths, owner (@dev), estimates, dependencies, acceptance criteria, and GitHub issue titles.

