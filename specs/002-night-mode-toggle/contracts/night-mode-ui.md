# UI Contract: Night Mode Toggle

## Scope

This contract defines the observable behavior of the night mode toggle in the profile experience. It is intended for implementation, unit tests, E2E tests, accessibility checks, and manual QA.

## Participants

- **Profile viewer**: Any visitor, owner, or editor viewing the profile page.
- **Upper bar**: The top profile action area that appears before the main profile sections.
- **Display mode toggle**: The control that switches between day mode and night mode.
- **Profile surface**: Header, upper bar, profile sections, profile details, forms, dialogs, toasts, validation messages, and controls.

## Initial Mode Contract

1. When a valid saved preference exists, the profile opens in that mode.
2. When no valid saved preference exists and the device reports a dark preference, the profile opens in night mode.
3. When no valid saved preference exists and the device reports a light preference, the profile opens in day mode.
4. When no saved preference or device preference is available, the profile opens in day mode.
5. Invalid saved preference data is ignored and does not block page load.

## Toggle Interaction Contract

1. The toggle is visible in the upper bar whenever the profile upper bar is present.
2. The toggle is available to visitors, owners, and editors.
3. The toggle can be activated by pointer.
4. The toggle can be reached and activated by keyboard.
5. The toggle exposes its current night-mode state to assistive technology.
6. Activating the toggle changes the visible profile surface without a page reload.
7. Activating the toggle persists the explicit choice for future same-device visits when storage is available.
8. If persistence is unavailable, activating the toggle still changes the current visible mode for the current visit.

## Preservation Contract

Changing display mode must preserve:

- Expanded and collapsed section state
- Current URL fragment and active section context
- Current scroll or reading position
- Viewer role
- Unsaved section drafts
- Preview state
- Validation messages
- Open editor dialogs
- Toast notifications
- Undo availability
- Saved profile content and metadata

## Visual and Layout Contract

1. Day mode and night mode both meet WCAG 2.1 AA contrast expectations for text and essential controls.
2. Focus indicators are visible in both modes.
3. Disabled, selected, hover, and active states remain distinguishable in both modes.
4. Dialog overlays, dialog content, toasts, section cards, profile details, form fields, buttons, and links inherit the active display mode.
5. The upper bar remains usable at mobile, tablet, and desktop widths.
6. At up to 200% text scaling, controls may wrap but must not overlap, clip, or become unreadable.
7. RTL direction keeps the toggle and upper-bar actions ordered and aligned coherently.

## Acceptance Scenarios

### Scenario: Switch to Night Mode

**Given** the profile opens in day mode  
**When** the user activates the upper-bar night mode toggle  
**Then** the profile surface changes to night mode  
**And** the toggle reports that night mode is active  
**And** profile content remains unchanged

### Scenario: Return Visit Uses Saved Preference

**Given** the user selected night mode  
**When** the user reloads or revisits the profile on the same device  
**Then** the profile opens in night mode  
**And** the toggle reports that night mode is active

### Scenario: Storage Fails Gracefully

**Given** display-mode preference persistence is unavailable  
**When** the user activates the toggle  
**Then** the current page changes mode  
**And** no profile data is changed  
**And** the user can continue viewing or editing the profile

### Scenario: Editing State Is Preserved

**Given** the user has an unsaved draft, preview is active, and a section editor is open  
**When** the user switches display modes  
**Then** the draft remains present  
**And** preview remains active  
**And** the editor remains open  
**And** any validation messages remain visible and readable
