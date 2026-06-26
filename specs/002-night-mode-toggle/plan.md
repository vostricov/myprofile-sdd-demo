# Implementation Plan: Night Mode Toggle

**Branch**: `(not set by setup-plan.sh)` | **Date**: 2026-06-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-night-mode-toggle/spec.md`

**Note**: Implementation tasks for this feature must use `feature/spec-002/t###-short-task-slug` branches and `[SPEC-002/T###]` commit messages.

## Summary

Add a night mode toggle to the existing profile upper action bar so any viewer can switch the profile experience between day and night appearances. The implementation will introduce a small presentation-preference state boundary, persist the selected mode on the current device, apply mode-specific CSS tokens across the profile surface, preserve existing profile/edit/preview state during mode changes, and extend unit, E2E, accessibility, responsive, and performance validation.

## Technical Context

**Language/Version**: TypeScript 6.0.3, React 19.2.7, Vite 8.0.16

**Primary Dependencies**: Existing React context/reducer patterns, CSS Modules, CSS custom properties, localStorage adapter pattern, lucide-react icons, React Testing Library, Vitest, Playwright, axe-core, Lighthouse CI

**Storage**: Browser-local display mode preference only; no backend persistence and no profile data changes

**Testing**: Vitest + React Testing Library for state/UI behavior; Playwright + axe for E2E/accessibility; Lighthouse CI for performance and best-practice budgets

**Target Platform**: Browser-based single-page frontend profile experience

**Project Type**: Frontend web application

**Performance Goals**: Display mode switch visible within 1 second in 99% of tested interactions; existing 2-second 3G-equivalent page load budget and Lighthouse scores remain at or above 90

**Constraints**: WCAG 2.1 AA contrast and focus visibility in both modes; usable upper bar at mobile/tablet/desktop sizes and 200% text scaling; no reload required; no loss of expanded sections, reading position, drafts, preview state, validation messages, or active dialogs

**Scale/Scope**: Existing single profile view, its upper action bar, section cards, controls, dialogs, toasts, and profile details panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Specification Authority**: PASS. Scope is defined in `specs/002-night-mode-toggle/spec.md`; design artifacts in this directory will be the source of truth until tasks are generated.
- **One Task, One Feature Branch**: PASS. Implementation work will be split into task-sized branches using `feature/spec-002/t###-short-task-slug` as required by `AGENTS.md`.
- **Traceable Implementation**: PASS. Tasks and commits will reference `SPEC-002` and the task ID, with commit messages formatted as `[SPEC-002/T###] concise description`.
- **Verification Before Completion**: PASS. Each planned task has direct validation through unit tests, E2E checks, axe accessibility scans, responsive checks, or Lighthouse CI before it can be marked complete.
- **Repository Hygiene**: PASS. The feature is frontend-only and scoped to display preference, upper-bar UI, styling tokens, messages, and tests. Existing unrelated modified files must remain untouched during implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-night-mode-toggle/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── night-mode-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── api/
│   │   └── localDisplayModePreference.ts
│   ├── components/
│   │   └── icons/
│   ├── context/
│   │   └── DisplayModeContext.tsx
│   ├── features/view-business-profile/
│   │   ├── NightModeToggle.tsx
│   │   ├── PreviewToggle.tsx
│   │   └── Profile.tsx
│   ├── i18n/
│   │   └── messages.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   └── globals.module.css
│   └── main.tsx
└── tests/
    ├── e2e/
    │   └── profile.spec.ts
    └── unit/
        └── displayMode.test.tsx
```

**Structure Decision**: Use the existing `frontend/` app structure. Add display-mode state and persistence alongside the existing profile context/local-storage pattern, integrate the toggle into the current top profile controls, and extend existing test files where coverage naturally belongs. New files are introduced only where they keep display mode separate from profile domain data.

## Implementation Approach

1. Add a display mode preference boundary that resolves initial mode from saved preference, device preference, or day-mode default.
2. Persist explicit day/night choices on the current device with graceful fallback when storage is unavailable.
3. Apply the current mode to the app through a root attribute and CSS token overrides so existing components inherit the mode without duplicating styles.
4. Add a toggle to the upper action bar with an icon, accessible name, state announcement, keyboard activation, and translated labels.
5. Verify mode switching does not mutate profile data or reset drafts, preview state, expanded sections, validation messages, toasts, dialogs, or scroll position.
6. Extend responsive, RTL, accessibility, and performance coverage for both display modes.

## Milestones

- **M1 - Preference State and Persistence**: Resolve initial mode, support explicit toggles, save preference when possible, and add unit coverage.
- **M2 - Upper-Bar UI Integration**: Add the night mode toggle to the upper action bar, update messages/icons, and preserve existing toolbar behavior.
- **M3 - Night Tokens and Visual Coverage**: Add night-mode design tokens for page, surfaces, text, borders, focus, buttons, dialogs, toasts, and disabled states.
- **M4 - End-to-End Validation**: Extend Playwright, axe, responsive, RTL, and Lighthouse checks to prove the feature against the spec.

## Acceptance Criteria Mapping

- **FR-001 to FR-004**: Upper action bar toggle, accessible state, keyboard/pointer activation, immediate visible mode change.
- **FR-005 and FR-011**: Reducer/context tests and E2E flows confirm profile state and profile data remain unchanged by display-mode changes.
- **FR-006 and FR-010**: Preference adapter tests cover saved choices and unavailable storage fallback.
- **FR-007**: Initial mode resolution tests cover saved preference, device preference, and day-mode fallback.
- **FR-008 and SC-004**: axe scans and visual assertions cover contrast, focus visibility, disabled controls, dialogs, and toasts.
- **FR-009 and SC-006**: Playwright viewport checks cover mobile, desktop, and large text behavior without overlap or clipping.
- **FR-012**: Message coverage and RTL smoke tests cover translated text and direction-safe layout.

## Risks and Mitigations

- **Risk**: Night-mode token changes accidentally affect the engineering dashboard. **Mitigation**: Scope mode application to the profile app root or confirm dashboard behavior explicitly if the root mode is global.
- **Risk**: Persisted preference tests become brittle because they share localStorage with profile persistence. **Mitigation**: Use a dedicated display-mode storage key and clear it independently in tests.
- **Risk**: Upper-bar controls wrap poorly when draft actions and the new toggle are all visible. **Mitigation**: define stable button dimensions, wrapping behavior, and viewport tests before marking the UI task complete.
- **Risk**: CSS token choices pass automated checks but still make disabled/focus states hard to distinguish. **Mitigation**: include explicit assertions and manual QA notes for focus, disabled, hover, dialog, and toast states in both modes.

## Complexity Tracking

No constitution violations or extra complexity exceptions are required.

## Post-Design Constitution Check

- **Specification Authority**: PASS. `research.md`, `data-model.md`, `contracts/night-mode-ui.md`, and `quickstart.md` support the active spec without expanding scope.
- **One Task, One Feature Branch**: PASS. Planned work is separable into state/persistence, UI integration, styling, and validation tasks.
- **Traceable Implementation**: PASS. All future tasks can map to `SPEC-002` requirements and success criteria.
- **Verification Before Completion**: PASS. Quickstart commands and contract scenarios define how task acceptance will be verified.
- **Repository Hygiene**: PASS. Generated artifacts are source documentation for this feature; implementation will avoid unrelated dirty files.
