# Tasks: Night Mode Toggle

**Input**: Design documents from `specs/002-night-mode-toggle/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/night-mode-ui.md](contracts/night-mode-ui.md), [quickstart.md](quickstart.md)

**Tests**: Included because the feature specification, plan, UI contract, and quickstart require unit, E2E, accessibility, responsive, and performance validation.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified as an independently useful increment.

**Branching**: Each task MUST be implemented on its own branch using `feature/spec-002/t###-short-task-slug`.

**Commits**: Commit messages MUST start with `[SPEC-002/T###]` followed by a concise task-specific message.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its listed dependencies are complete because it touches different files from other parallel tasks.
- **[Story]**: User story label for story-scoped tasks only.
- Each task line includes at least one exact file path.
- Each task includes branch, dependency, and acceptance details.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add small shared assets needed by all display-mode work.

- [X] T001 [P] Add night mode labels, state announcements, and action copy in frontend/src/i18n/messages.ts
  - Branch: feature/spec-002/t001-night-mode-messages
  - Depends: none
  - Acceptance: message keys cover day mode, night mode, toggle action, and non-visual current-state text without hard-coded toggle strings in components.

- [X] T002 [P] Add SunIcon and MoonIcon exports for display mode controls in frontend/src/components/icons/index.tsx
  - Branch: feature/spec-002/t002-display-mode-icons
  - Depends: none
  - Acceptance: exported icon components use the same lucide wrapper pattern and default accessibility props as existing icons.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared display-mode state boundary and layout slot before user stories are implemented.

**Critical**: Complete this phase before starting user story tasks.

- [X] T003 Create display mode types, context, provider shell, and hook in frontend/src/context/DisplayModeContext.tsx
  - Branch: feature/spec-002/t003-display-mode-context-shell
  - Depends: T001
  - Acceptance: provider exposes `mode`, `isNightMode`, `source`, `canPersist`, and `toggleMode` placeholders without coupling to profile reducer state.

- [X] T004 Wire DisplayModeProvider around only the profile app path in frontend/src/main.tsx
  - Branch: feature/spec-002/t004-wire-display-mode-provider
  - Depends: T003
  - Acceptance: profile view renders inside DisplayModeProvider, engineering dashboard route remains outside the mode scope unless explicitly verified, and existing ToastProvider/ProfileProvider order is preserved.

- [X] T005 [P] Add upper-bar toggle layout slot and stable wrapping styles in frontend/src/styles/globals.module.css
  - Branch: feature/spec-002/t005-upper-bar-toggle-layout
  - Depends: T001
  - Acceptance: preview toolbar can host a persistent toggle plus existing draft actions without overlap at mobile and desktop widths.

**Checkpoint**: Display-mode foundation exists; user story work can begin.

---

## Phase 3: User Story 1 - Switch Display Mode from the Upper Bar (Priority: P1) MVP

**Goal**: A viewer can find the upper-bar toggle, switch between day and night mode, and understand the current state through visual and non-visual cues.

**Independent Test**: Open the profile page, activate the upper-bar toggle by pointer and keyboard, verify the visible profile surface changes modes within 1 second, and confirm axe reports no accessibility violations for the main profile surface.

### Tests for User Story 1

Write these tests first and confirm they fail before implementation.

- [ ] T006 [P] [US1] Add unit tests for current-session toggle state, accessible name, and aria-pressed behavior in frontend/tests/unit/displayMode.test.tsx
  - Branch: feature/spec-002/t006-us1-toggle-unit-tests
  - Depends: T003
  - Acceptance: tests fail until the provider and toggle expose day/night state, accessible labels, and keyboard-operable state changes.

- [ ] T007 [P] [US1] Add Playwright contract coverage for visible upper-bar toggle, pointer activation, keyboard activation, and axe scan in frontend/tests/e2e/profile.spec.ts
  - Branch: feature/spec-002/t007-us1-toggle-e2e-tests
  - Depends: T003,T005
  - Acceptance: test fails until the upper-bar toggle is visible, activatable without a pointer, updates state immediately, and passes axe checks.

### Implementation for User Story 1

- [ ] T008 [US1] Implement current-session day/night mode actions and root mode attribute updates in frontend/src/context/DisplayModeContext.tsx
  - Branch: feature/spec-002/t008-us1-current-session-mode
  - Depends: T006
  - Acceptance: toggling mode updates provider state and a root/app attribute without profile data changes or page reloads.

- [ ] T009 [P] [US1] Implement NightModeToggle button with icon, visible label, aria-pressed, and focus behavior in frontend/src/features/view-business-profile/NightModeToggle.tsx
  - Branch: feature/spec-002/t009-us1-night-mode-toggle
  - Depends: T001,T002,T003,T006
  - Acceptance: component renders a keyboard-focusable button that reflects the current mode visually and non-visually and calls the display-mode toggle action.

- [ ] T010 [US1] Insert NightModeToggle into the profile upper bar without disabling preview actions in frontend/src/features/view-business-profile/PreviewToggle.tsx
  - Branch: feature/spec-002/t010-us1-upper-bar-integration
  - Depends: T005,T008,T009
  - Acceptance: toggle appears in the upper bar for visitor, owner, and editor roles; preview, save, discard, and undo buttons retain their existing enabled/disabled behavior.

- [ ] T011 [US1] Add day/night token overrides and visible toggle/button states in frontend/src/styles/tokens.css and frontend/src/styles/globals.module.css
  - Branch: feature/spec-002/t011-us1-night-mode-tokens
  - Depends: T005,T008,T009
  - Acceptance: page, upper bar, sections, details panel, buttons, links, focus rings, and disabled states visibly switch between day and night appearances with WCAG 2.1 AA contrast targets.

**Checkpoint**: User Story 1 is fully functional and independently testable as the MVP.

---

## Phase 4: User Story 2 - Keep the Chosen Mode Across Visits (Priority: P2)

**Goal**: A returning same-device viewer sees the most recently selected display mode, with device preference and day-mode fallback when no saved choice exists.

**Independent Test**: Select night mode, reload and verify night mode is restored; select day mode, reload and verify day mode is restored; clear saved preference and verify device preference or day fallback is used.

### Tests for User Story 2

Write these tests first and confirm they fail before implementation.

- [ ] T012 [P] [US2] Add unit tests for saved, invalid, unavailable-storage, device-preference, and default mode resolution in frontend/tests/unit/displayMode.test.tsx
  - Branch: feature/spec-002/t012-us2-preference-unit-tests
  - Depends: T006,T008
  - Acceptance: tests fail until saved choices, corrupt saved values, storage failures, device dark/light preference, and day fallback are all handled.

- [ ] T013 [P] [US2] Add Playwright reload persistence scenarios for day and night choices in frontend/tests/e2e/profile.spec.ts
  - Branch: feature/spec-002/t013-us2-preference-e2e-tests
  - Depends: T007,T010
  - Acceptance: tests fail until explicit mode choices survive same-device reloads and the toggle reflects restored state.

### Implementation for User Story 2

- [ ] T014 [US2] Implement dedicated display mode preference adapter and storage key in frontend/src/api/localDisplayModePreference.ts
  - Branch: feature/spec-002/t014-us2-local-preference-adapter
  - Depends: T012
  - Acceptance: adapter loads valid day/night choices, ignores invalid data, uses a dedicated key, and returns safe fallback results when localStorage is unavailable.

- [ ] T015 [US2] Integrate saved, device, default, and unavailable-storage resolution in frontend/src/context/DisplayModeContext.tsx
  - Branch: feature/spec-002/t015-us2-initial-mode-resolution
  - Depends: T014
  - Acceptance: provider initializes from saved preference first, device preference second, day default last, and keeps current-session toggling available when persistence fails.

- [ ] T016 [US2] Update NightModeToggle to persist explicit choices and display restored state in frontend/src/features/view-business-profile/NightModeToggle.tsx
  - Branch: feature/spec-002/t016-us2-persist-toggle-choice
  - Depends: T015
  - Acceptance: activating the toggle saves explicit choices when possible, reports current state after reload, and continues to work for the current visit when saving fails.

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Preserve Profile Work While Switching Modes (Priority: P3)

**Goal**: Owners and editors can switch display modes during viewing, previewing, or editing without losing drafts, section state, messages, dialogs, toasts, or undo availability.

**Independent Test**: Create an unsaved edit, activate preview, keep validation feedback or an editor open, switch display modes, and confirm all profile workflow state remains available and readable.

### Tests for User Story 3

Write these tests first and confirm they fail before implementation.

- [ ] T017 [P] [US3] Add unit tests that display mode changes preserve profile drafts, preview state, expanded sections, and viewer role in frontend/tests/unit/displayMode.test.tsx
  - Branch: feature/spec-002/t017-us3-preservation-unit-tests
  - Depends: T012,T015
  - Acceptance: tests fail until display-mode state changes do not mutate ProfileContext profile, drafts, preview, expandedSectionIds, or currentViewerRole.

- [ ] T018 [P] [US3] Add Playwright preservation flow for inline edit, modal editor, preview, validation message, toast, undo availability, and mode switching in frontend/tests/e2e/profile.spec.ts
  - Branch: feature/spec-002/t018-us3-preservation-e2e-tests
  - Depends: T013,T016
  - Acceptance: test fails until mode switching preserves visible workflow state and keeps all affected controls readable.

### Implementation for User Story 3

- [ ] T019 [US3] Refine provider integration so display mode changes do not remount ProfileProvider or ToastProvider in frontend/src/main.tsx
  - Branch: feature/spec-002/t019-us3-preserve-provider-state
  - Depends: T017
  - Acceptance: changing mode updates presentation attributes without recreating profile context, toast context, active drafts, or undo stack.

- [ ] T020 [US3] Ensure dialogs, toasts, form errors, disabled states, and focus indicators inherit both display modes in frontend/src/styles/globals.module.css
  - Branch: feature/spec-002/t020-us3-mode-aware-overlays
  - Depends: T011,T018,T019
  - Acceptance: inline editors, modal editors, validation errors, toasts, disabled buttons, and focus states remain visible and usable in day and night mode.

**Checkpoint**: All user stories are independently functional and integrated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete responsive, RTL, accessibility, and final validation work across all user stories.

- [ ] T021 [P] Add mobile, desktop, 200-percent text, and RTL night-mode assertions in frontend/tests/e2e/profile.spec.ts
  - Branch: feature/spec-002/t021-responsive-rtl-night-mode
  - Depends: T018,T020
  - Acceptance: Playwright confirms the upper bar wraps without overlap or clipping and remains coherent under `?dir=rtl` in both display modes.

- [ ] T022 [P] Document manual QA coverage for day/night contrast, focus, disabled states, dialogs, toasts, and storage fallback in frontend/docs/night-mode-qa.md
  - Branch: feature/spec-002/t022-night-mode-manual-qa
  - Depends: T020
  - Acceptance: QA checklist maps to `contracts/night-mode-ui.md` and records expected evidence for the scenarios in `quickstart.md`.

- [ ] T023 Update Lighthouse baseline notes for night mode and performance acceptance in frontend/docs/perf-baseline.md
  - Branch: feature/spec-002/t023-night-mode-lighthouse-baseline
  - Depends: T021
  - Acceptance: notes confirm existing Performance, Accessibility, and Best Practices targets remain at or above 90 and the 3G-equivalent load target remains within budget.

- [ ] T024 Run final validation commands and record outcomes in frontend/docs/night-mode-qa.md
  - Branch: feature/spec-002/t024-final-night-mode-validation
  - Depends: T021,T022,T023
  - Acceptance: `npm run test`, `npm run build`, `npm run e2e`, and `npm run lhci` results are recorded, with any skipped validation explained before marking this task complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 - Setup**: No dependencies; T001 and T002 can start immediately.
- **Phase 2 - Foundational**: Depends on Phase 1; blocks user story work.
- **Phase 3 - US1**: Depends on Phase 2; this is the MVP increment.
- **Phase 4 - US2**: Depends on US1 display-mode state and toggle.
- **Phase 5 - US3**: Depends on US1 and US2 behavior being available for preservation tests.
- **Phase 6 - Polish**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after foundational tasks; no dependency on US2 or US3.
- **US2 (P2)**: Depends on US1 because persistence applies to the explicit toggle introduced by US1.
- **US3 (P3)**: Depends on US1 and US2 because preservation must cover active mode switching and restored preference state.

### Within Each User Story

- Tests are written first and should fail before implementation.
- State/model work precedes component integration.
- Component integration precedes styling and full E2E validation.
- Each story must pass its independent test before marking that story's tasks complete.

## Parallel Opportunities

- T001 and T002 can run in parallel.
- T003 and T005 can run in parallel after T001; T004 waits for T003.
- T006 and T007 can run in parallel after foundational tasks.
- T009 and T011 can run in parallel once T008 is available, then T010 integrates the finished toggle.
- T012 and T013 can run in parallel after US1.
- T017 and T018 can run in parallel after US2.
- T021 and T022 can run in parallel after US3.
- Parallel work still requires one dedicated `feature/spec-002/t###-...` branch per task.

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, these test tasks can be worked independently:
Task: "T006 [US1] Add unit tests in frontend/tests/unit/displayMode.test.tsx"
Task: "T007 [US1] Add E2E and axe checks in frontend/tests/e2e/profile.spec.ts"

# After T008 defines current-session behavior, these implementation tasks can split by file:
Task: "T009 [US1] Implement NightModeToggle in frontend/src/features/view-business-profile/NightModeToggle.tsx"
Task: "T011 [US1] Add token/style updates in frontend/src/styles/tokens.css and frontend/src/styles/globals.module.css"
```

## Parallel Example: User Story 2

```bash
# After US1 is complete, these validation tasks can be developed independently:
Task: "T012 [US2] Add preference unit tests in frontend/tests/unit/displayMode.test.tsx"
Task: "T013 [US2] Add reload persistence E2E tests in frontend/tests/e2e/profile.spec.ts"
```

## Parallel Example: User Story 3

```bash
# After US2 is complete, these preservation tests can be developed independently:
Task: "T017 [US3] Add preservation unit tests in frontend/tests/unit/displayMode.test.tsx"
Task: "T018 [US3] Add preservation E2E flow in frontend/tests/e2e/profile.spec.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup tasks.
2. Complete Phase 2 foundational tasks.
3. Complete Phase 3 User Story 1 tasks.
4. Stop and validate: visible upper-bar toggle, pointer and keyboard activation, immediate visual mode switch, accessible state, and axe scan.

### Incremental Delivery

1. Deliver US1 as the current-session visible toggle MVP.
2. Add US2 to persist explicit choices and respect device/default fallback.
3. Add US3 to harden behavior during editing, preview, validation, dialogs, toasts, and undo.
4. Complete polish tasks for responsive, RTL, manual QA, Lighthouse, and full quickstart validation.

### Format Validation

- All task lines use `- [ ] T###` checklist format.
- Parallel tasks include `[P]`.
- User story tasks include `[US1]`, `[US2]`, or `[US3]`.
- Setup, foundational, and polish tasks omit user story labels.
- Every task line includes at least one exact file path.
- Every task includes a dedicated `feature/spec-002/t###-...` branch detail.
