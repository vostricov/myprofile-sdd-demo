# Feature Specification: Night Mode Toggle

**Feature Branch**: `[002-night-mode-toggle]`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "Add night mode toggle to the upper bar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Display Mode from the Upper Bar (Priority: P1)

As a profile viewer, I can use a clearly visible toggle in the upper bar to switch the profile experience between day mode and night mode so I can read and use the page comfortably in different lighting conditions.

**Why this priority**: This is the core user value. Without a visible, reliable upper-bar toggle, the feature does not exist.

**Independent Test**: A tester can open the profile page, activate the upper-bar toggle, and confirm that the visible page changes between day and night appearances while the toggle communicates the current state.

**Acceptance Scenarios**:

1. **Given** the profile page is shown in day mode, **When** the user activates the upper-bar toggle, **Then** the visible profile experience changes to night mode and the toggle indicates that night mode is active.
2. **Given** the profile page is shown in night mode, **When** the user activates the upper-bar toggle again, **Then** the visible profile experience returns to day mode and the toggle indicates that night mode is inactive.
3. **Given** a user navigates by keyboard or assistive technology, **When** focus reaches the upper-bar toggle, **Then** the control has a meaningful name, exposes its current state, and can be activated without using a pointer.

---

### User Story 2 - Keep the Chosen Mode Across Visits (Priority: P2)

As a returning profile viewer, I want my last selected display mode to be remembered on this device so the page opens in the appearance I chose previously.

**Why this priority**: Remembering the mode prevents repeated setup and makes the toggle feel like a durable user preference rather than a temporary visual effect.

**Independent Test**: A tester can select night mode, leave or reload the profile experience, and confirm that the same mode is restored without needing to toggle it again.

**Acceptance Scenarios**:

1. **Given** the user has selected night mode, **When** the user returns to the profile experience on the same device, **Then** the page opens in night mode and the toggle reflects that state.
2. **Given** the user has selected day mode after previously using night mode, **When** the user returns to the profile experience on the same device, **Then** the page opens in day mode and the toggle reflects that state.
3. **Given** no previous display-mode choice exists for the user on this device, **When** the profile experience opens, **Then** the page uses the device display preference when available and otherwise opens in day mode.

---

### User Story 3 - Preserve Profile Work While Switching Modes (Priority: P3)

As a profile owner or editor, I can switch display modes while viewing, previewing, or editing profile content without losing my current place or work in progress.

**Why this priority**: The mode toggle should improve comfort without disrupting existing profile workflows.

**Independent Test**: A tester can expand sections, enter edits, show validation messages, open preview, and switch display modes while confirming the same state remains available after the visual mode changes.

**Acceptance Scenarios**:

1. **Given** the user has unsaved profile edits, **When** the user switches between day mode and night mode, **Then** the unsaved edits remain intact and editable.
2. **Given** a section is expanded or the user is viewing a specific profile section, **When** the user switches display modes, **Then** the current section state and reading position are preserved.
3. **Given** a message, edit control, validation error, or preview state is visible, **When** the user switches display modes, **Then** those elements remain visible, readable, and usable.

---

### Edge Cases

- The user switches modes while unsaved edits, validation errors, preview mode, or an editor dialog are active.
- The upper bar has limited space on small screens, at large text sizes, or with translated labels.
- The user has no saved mode preference and the device display preference is unavailable.
- The user's display-mode preference cannot be saved for a future visit.
- High-contrast, reduced-motion, or other accessibility-related device settings are active.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show a night mode toggle in the upper bar on every profile view where the upper bar is present.
- **FR-002**: The toggle MUST indicate the current display mode visually and non-visually so users can determine whether night mode is active.
- **FR-003**: Users MUST be able to switch between day mode and night mode using pointer input, keyboard input, and assistive technology.
- **FR-004**: Activating the toggle MUST update the visible profile experience, including the upper bar, profile sections, controls, messages, overlays, and editable states, without requiring the user to reload the page.
- **FR-005**: The system MUST preserve the user's current profile state when display mode changes, including expanded sections, reading position, unsaved edits, preview state, validation messages, and active dialogs.
- **FR-006**: The system MUST remember the user's most recent display-mode choice for future visits on the same device.
- **FR-007**: When no saved display-mode choice exists, the system MUST use the device display preference when available and otherwise default to day mode.
- **FR-008**: Night mode MUST maintain readable contrast, visible focus indicators, clear selected states, clear disabled states, and distinguishable interactive controls across supported profile states.
- **FR-009**: The toggle MUST fit within the upper bar across supported screen sizes and text sizes without obscuring existing upper-bar actions.
- **FR-010**: If the user's display-mode choice cannot be saved for a future visit, the system MUST still allow switching modes for the current visit without interrupting profile use.
- **FR-011**: Changing display mode MUST NOT change profile content, edit permissions, saved profile data, or profile publication state.
- **FR-012**: Toggle labels, state announcements, and related user-facing text MUST support the same translation and text-direction expectations as the rest of the profile experience.

### Key Entities *(include if feature involves data)*

- **Display Mode Preference**: Represents the user's selected profile display mode on the current device. Key attributes include current mode, preference source, and whether the mode was explicitly chosen by the user.
- **Upper Bar Toggle**: Represents the visible control used to switch display mode. Key attributes include current state, accessible name, focus state, and available action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of test participants can find and change night mode from the upper bar within 5 seconds without instructions.
- **SC-002**: Display-mode changes apply to all visible profile areas within 1 second in 99% of tested interactions.
- **SC-003**: In 100% of tested interactions, switching display modes preserves expanded sections, reading position, unsaved edits, preview state, validation messages, and active dialogs.
- **SC-004**: Both day mode and night mode meet WCAG 2.1 AA contrast and focus visibility expectations for all tested profile content and controls.
- **SC-005**: Returning users on the same device see their most recently selected display mode in at least 95% of reload and revisit tests where preference saving is available.
- **SC-006**: At supported mobile, tablet, and desktop sizes, including up to 200% text scaling, the upper bar remains usable with no overlapping, clipped, or unreadable toggle text or controls.

## Assumptions

- "Upper bar" refers to the existing top action area of the profile experience.
- The night mode toggle is available to all viewer roles and is not controlled by edit permissions.
- Night mode is a presentation preference only; it does not create profile content changes or require publishing.
- The preference is remembered for the current device only; cross-device account synchronization is out of scope.
- Day mode remains the default when no saved preference or device display preference is available.
- Automatic scheduling, such as changing modes by time of day, is out of scope for this feature.
