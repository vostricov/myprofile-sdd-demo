# Implementation Plan: view-business-profile

**Branch**: `feat/view-business-profile` | **Date**: 2026-06-18 | **Spec**: specs/001-view-business-profile/spec.md

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Single-page React 19 + TypeScript app that renders a canonical profile JSON fixture and provides accessible, collapsible sections with per-section edit affordances (inline & modal), draft/preview flow, undo, and basic performance/accessibility checks.

## Technical Context

- **Frontend**: React 19 + TypeScript + Vite
- **UI primitives**: Radix UI (Accordion/Dialog/Toast) + CSS Modules + CSS custom properties (design tokens)
- **Forms/validation**: React Hook Form + Zod
- **State**: local reducer + Context for draft/preview/collapse/undo; add TanStack Query only when API persistence is added
- **Icons**: lucide-react
- **Testing**: Vitest + React Testing Library; Playwright + axe for E2E/accessibility; Lighthouse CI for performance budgets
- **Data**: initial JSON fixture at `src/fixtures/initial-input/profile.json`
- **Backend (future)**: Fastify + TypeScript + PostgreSQL (jsonb) with versioning and audit fields

**Goals**
- Render profile sections from the fixture.
- Provide keyboard-accessible collapse/expand and section navigation (URL fragments).
- Implement edit flows with validation, preview, undo, and confirmation UX.
- Ship unit + E2E + accessibility checks and baseline Lighthouse run in CI.

**Milestones**
M1 – Data & render (2 days)
M2 – Collapse & navigation (1 day)
M3 – Edit flows & validation (3 days)
M4 – Preview, undo, and persistence hooks (2 days)
M5 – Tests & CI (2 days)

**Tasks (ordered, estimates)**
1. Add fixture: `frontend/src/fixtures/initial-input/profile.json` (0.5d)
2. Scaffold Vite + React 19 + TS app + package.json (0.5d)
3. Add design tokens (CSS variables) and CSS Modules baseline (0.5d)
4. Implement ProfileContext + reducer (draft/preview/collapse/undo) (1d)
5. Build Section and SectionHeader components; wire fixtures (1d)
6. Implement accessible collapse (Radix Accordion or custom) + URL fragment sync (1d)
7. Inline editor (React Hook Form + Zod) for small fields (1d)
8. Modal/Drawer editor (Radix Dialog) for rich sections (1d)
9. Preview mode, undo stack, toast UX (1.5d)
10. Icons, micro-interactions, animations polish (0.5d)
11. Unit tests (Vitest + RTL) for components & reducer (1d)
12. E2E Playwright + axe accessibility checks (1d)
13. Lighthouse CI config and baseline run (0.5d)
14. Final QA, accessibility fixes, perf tuning (1d)

**Repo layout (recommended)**
frontend/
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── app/
│   ├── features/view-business-profile/
│   │   ├── Profile.tsx
│   │   ├── Section/
│   │   └── editors/
│   ├── components/
│   ├── styles/ (tokens, globals.module.css)
│   └── fixtures/initial-input/profile.json
└── tests/

**CI pipeline outline**
- PR pipeline: lint (ESLint + Prettier) → unit tests (Vitest) → build (Vite)
- Merge/main: Playwright E2E + axe accessibility checks
- Main branch: Lighthouse CI for performance regression detection

**Acceptance criteria mapping**
- Render & load from fixture → Tasks 1–5
- Collapse/navigation & accessibility → Tasks 6, 11–12
- Edit/validation/save/cancel/preview → Tasks 7–9
- Undo & toast → Task 9
- Tests & performance budgets → Tasks 11–13

**Risks & mitigations**
- Accessibility regressions: run axe in Playwright on PRs early
- Flaky tests: isolate and quarantine; prefer deterministic fixtures
- Over-complex state: keep reducer actions minimal; favor simple state shapes

**Required files to add**
- `frontend/src/fixtures/initial-input/profile.json` (canonical profile fixture)
- `frontend/README.dev` with setup and developer notes

**Developer setup (macOS)**
1. cd frontend
2. npm install
3. npm run dev
4. npm run test
5. npm run e2e

**Estimated effort**: ~11–12 working days for a single developer to reach M5 baseline.
