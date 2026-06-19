# Implementation Plan: view-business-profile

**Branch**: `feature/spec-001/view-business-profile` | **Date**: 2026-06-18 | **Spec**: specs/001-view-business-profile/spec.md

**Input**: Feature specification from `specs/001-view-business-profile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Single-page React 19 + TypeScript app that renders a validated canonical profile JSON fixture and provides accessible, collapsible sections with role-gated per-section edit affordances (inline & modal), draft/preview flow, local persistence adapter, undo, i18n/RTL basics, and measurable performance/accessibility checks.

## Technical Context

- **Frontend**: React 19 + TypeScript + Vite
- **UI primitives**: Radix UI (Accordion/Dialog/Toast) + CSS Modules + CSS custom properties (design tokens)
- **Forms/validation**: React Hook Form + Zod, including a shared profile schema for fixture and edit validation
- **State**: local reducer + Context for draft/preview/collapse/undo; add TanStack Query only when API persistence is added
- **Icons**: lucide-react
- **Testing**: Vitest + React Testing Library; Playwright + axe for E2E/accessibility; Lighthouse CI for performance budgets
- **Data**: initial JSON fixture at `frontend/src/fixtures/initial-input/profile.json`, validated by `frontend/src/domain/profileSchema.ts`
- **Persistence**: browser-local profile storage adapter behind `frontend/src/api/profileApi.ts`; backend API is out of scope for this feature
- **Backend (future)**: Fastify + TypeScript + PostgreSQL (jsonb) with versioning and audit fields

**Goals**
- Render profile sections from the fixture.
- Provide keyboard-accessible collapse/expand and section navigation (URL fragments).
- Implement role-based edit gating, edit flows with validation, preview, undo, and confirmation UX.
- Persist saved profiles through a local adapter while updating `lastUpdated` and `lastEditedByUserId`.
- Externalize UI strings, use locale-aware date formatting, and smoke-test RTL direction.
- Ship unit + E2E + accessibility checks and enforced Lighthouse performance budgets in CI.

**Milestones**
M1 – Scaffold, data & render (2.5 days)
M2 – Collapse & navigation (1 day)
M3 – Permissions, edit flows & validation (3.5 days)
M4 – Preview, undo, and local persistence (2 days)
M5 – Tests, i18n, performance & CI (2.5 days)

**Tasks (ordered, estimates)**
1. Scaffold Vite + React 19 + TS app + package.json (0.5d)
2. Add fixture: `frontend/src/fixtures/initial-input/profile.json` (0.5d)
3. Add profile Zod schema and fixture validation at `frontend/src/domain/profileSchema.ts` (0.5d)
4. Add design tokens (CSS variables) and CSS Modules baseline with responsive grid support (0.5d)
5. Implement ProfileContext + reducer (draft/preview/collapse/undo/current role) (1d)
6. Build Section and SectionHeader components; wire validated fixture (1d)
7. Implement accessible collapse (Radix Accordion or custom) + URL fragment sync (1d)
8. Implement role-based edit gating from `editableBy` and current viewer role (0.5d)
9. Inline editor (React Hook Form + Zod) for small fields (1d)
10. Modal/Drawer editor (Radix Dialog) for rich sections (1d)
11. Preview mode, undo stack, toast UX (1.5d)
12. Persistence adapter and profile API stub with metadata updates (0.5d)
13. Icons, micro-interactions, animations polish (0.5d)
14. Externalized messages, locale date formatting, and RTL smoke styling (0.5d)
15. Schema validation unit tests (Vitest) (0.25d)
16. Permission unit tests (Vitest) (0.25d)
17. Reducer and component unit tests (Vitest + RTL) (0.5d)
18. Persistence and save metadata unit tests (Vitest) (0.5d)
19. E2E Playwright + axe accessibility checks, including responsive and RTL smoke scenarios (1d)
20. Lighthouse CI config with 3G-equivalent budget assertions and baseline run (0.5d)
21. Final QA, accessibility fixes, perf tuning (1d)

**Repo layout (recommended)**
frontend/
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── app/
│   ├── api/
│   ├── domain/
│   ├── features/view-business-profile/
│   │   ├── Profile.tsx
│   │   ├── Section/
│   │   └── editors/
│   ├── i18n/
│   ├── components/
│   ├── styles/ (tokens, globals.module.css)
│   └── fixtures/initial-input/profile.json
└── tests/

**CI pipeline outline**
- PR pipeline: lint (ESLint + Prettier) → unit tests (Vitest) → build (Vite)
- Merge/main: Playwright E2E + axe accessibility checks
- Main branch: Lighthouse CI for performance regression detection with explicit thresholds for 2s 3G-equivalent load and Lighthouse Performance/Accessibility/Best Practices >= 90

**Acceptance criteria mapping**
- Render & load from validated fixture → Tasks 1–6
- Collapse/navigation & accessibility → Tasks 7, 17, 19
- Role-based edit permissions → Tasks 5, 8, 16–17
- Edit/validation/save/cancel/preview → Tasks 9–12
- Undo & toast → Task 11
- Local persistence and save metadata → Task 12
- Responsive/i18n/RTL → Tasks 4, 14, 19
- Tests & performance budgets → Tasks 15–20

**Risks & mitigations**
- Accessibility regressions: run axe in Playwright on PRs early
- Flaky tests: isolate and quarantine; prefer deterministic fixtures
- Over-complex state: keep reducer actions minimal; favor simple state shapes

**Required files to add**
- `frontend/src/fixtures/initial-input/profile.json` (canonical profile fixture)
- `frontend/src/domain/profileSchema.ts` (Profile/Section schema and validation rules)
- `frontend/src/domain/permissions.ts` (role-to-section edit permission checks)
- `frontend/src/api/profileApi.ts` (local persistence adapter boundary)
- `frontend/src/i18n/messages.ts` and `frontend/src/i18n/format.ts` (externalized strings and locale helpers)
- `frontend/README.dev` with setup and developer notes

**Developer setup (macOS)**
1. cd frontend
2. npm install
3. npm run dev
4. npm run test
5. npm run e2e

**Estimated effort**: ~13–14 working days for a single developer to reach M5 baseline.
