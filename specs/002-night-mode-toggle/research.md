# Research: Night Mode Toggle

## Decision: Keep Display Mode Separate from Profile Domain State

**Decision**: Represent display mode as presentation preference state outside the existing profile reducer and profile data model.

**Rationale**: The specification requires mode changes to preserve profile content, edit permissions, saved data, and publication state. A separate state boundary prevents accidental coupling between display mode and profile editing flows while still allowing the profile view, dialogs, toasts, and controls to consume the current mode.

**Alternatives considered**:

- Extend the profile reducer with display-mode actions. Rejected because display mode is not profile data and should not affect draft/save/undo behavior.
- Use CSS-only device preference. Rejected because the feature requires an explicit upper-bar toggle and remembered user choice.

## Decision: Resolve Initial Mode from Saved Preference, Device Preference, then Day Default

**Decision**: On startup, use the saved explicit user preference when present. If none exists, use the device color-scheme preference when available. If neither is available, use day mode.

**Rationale**: This matches the spec assumptions and success criteria while keeping behavior predictable. It respects returning users first, then follows device comfort preferences, then falls back to the safest default.

**Alternatives considered**:

- Always default to day mode. Rejected because the spec requires using device preference when no saved choice exists.
- Always follow device preference. Rejected because users need their explicit same-device choice to persist across visits.
- Time-based automatic mode changes. Rejected because automatic scheduling is out of scope.

## Decision: Persist Explicit Choices in Dedicated Browser-Local Storage

**Decision**: Store only explicit day/night choices under a dedicated display-mode key, independent from existing profile storage.

**Rationale**: The feature is a current-device preference and does not require backend persistence. A dedicated key prevents conflicts with profile data and lets tests clear or corrupt the preference without touching saved profile content.

**Alternatives considered**:

- Store the preference inside the profile JSON. Rejected because display mode must not change profile data or publication state.
- Use session-only state. Rejected because returning same-device users should see their most recently selected mode.
- Require backend account sync. Rejected because cross-device synchronization is out of scope.

## Decision: Apply Mode with Root Attribute and CSS Token Overrides

**Decision**: Apply the current display mode through a root-level attribute and override existing CSS custom properties for night mode.

**Rationale**: The app already uses design tokens for colors, spacing, focus, surfaces, and buttons. Token overrides let existing components inherit mode changes consistently across section cards, controls, dialogs, toasts, and metadata panels without duplicating component styles.

**Alternatives considered**:

- Add component-specific night-mode classes everywhere. Rejected because it increases duplication and the chance of missed surfaces.
- Use a separate night-mode stylesheet. Rejected because token overrides are easier to test and keep aligned with existing design tokens.
- Inline styles from React. Rejected because CSS tokens are already the local styling pattern.

## Decision: Integrate Toggle into the Existing Upper Action Bar

**Decision**: Place the toggle in the existing top profile action band that currently hosts draft/preview/save/discard/undo controls, while keeping it available regardless of draft state.

**Rationale**: The specification asks for the upper bar. The existing profile experience already has a top control bar immediately below the title and before profile content, so it is the least disruptive integration point and naturally participates in responsive and RTL layout checks.

**Alternatives considered**:

- Place the toggle inside the profile details side panel. Rejected because it is not the upper bar and is less visible on mobile.
- Place the toggle inside the page header title area. Rejected because it risks crowding the title and eyebrow content.
- Hide the toggle until a user opens settings. Rejected because the toggle must be clearly visible and findable quickly.

## Decision: Validate with State Tests, E2E Flows, Accessibility Scans, and Performance Budgets

**Decision**: Cover initial resolution and persistence with unit tests; cover upper-bar behavior, profile-state preservation, responsive wrapping, RTL, and axe accessibility with Playwright; keep existing build and Lighthouse commands as performance guards.

**Rationale**: The feature has both state behavior and user-visible presentation requirements. Unit tests are sufficient for mode resolution and storage fallback, while E2E tests are needed to prove the toggle is discoverable, accessible, responsive, and non-disruptive to editing workflows.

**Alternatives considered**:

- Manual-only visual QA. Rejected because the spec includes measurable persistence, preservation, accessibility, and responsive outcomes.
- Unit tests only. Rejected because unit tests cannot prove upper-bar layout, focus behavior, screen-level contrast, or preservation across real interactions.
