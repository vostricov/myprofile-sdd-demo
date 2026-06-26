# Data Model: Night Mode Toggle

## DisplayModePreference

Represents the display mode selected or resolved for the current device. This is presentation state only and is not part of the business profile data.

### Fields

- `mode`: `day` or `night`
- `source`: `saved`, `device`, or `default`
- `explicitlyChosen`: boolean indicating whether the user selected the mode through the upper-bar toggle
- `canPersist`: boolean indicating whether the current environment can remember the explicit choice for future visits

### Validation Rules

- `mode` must be either `day` or `night`.
- `source` must match how the mode was resolved.
- A saved preference must only be accepted when it contains a valid `mode`.
- Invalid, missing, or unreadable saved values must be ignored without blocking current-session mode switching.
- Preference persistence failure must not change profile data or interrupt profile use.

### State Transitions

```text
No saved preference
  -> device preference says dark -> mode: night, source: device
  -> device preference says light -> mode: day, source: device
  -> no device preference -> mode: day, source: default

Resolved mode
  -> user activates toggle -> opposite mode, source: saved when persistence succeeds
  -> user activates toggle and persistence fails -> opposite mode, source: default/device for future visits but active for current visit

Saved day
  -> return visit -> mode: day, source: saved
  -> user activates toggle -> saved night

Saved night
  -> return visit -> mode: night, source: saved
  -> user activates toggle -> saved day
```

## UpperBarToggle

Represents the user-facing control in the upper bar that switches display mode.

### Fields

- `currentMode`: `day` or `night`
- `accessibleName`: describes the action or state for assistive technology
- `pressedState`: boolean-equivalent state where active means night mode is enabled
- `label`: visible text or compact label from the message catalog
- `icon`: day/night icon matching the current action or state
- `isFocusable`: always true when the upper bar is present
- `isDisabled`: always false unless the whole profile surface is unavailable

### Validation Rules

- The control must expose the current state non-visually.
- The control must be keyboard activatable.
- The control must remain visible and usable at supported screen sizes and up to 200% text scaling.
- The control must not obscure or disable existing upper-bar actions.

## ProfileViewModeState

Represents the visible profile experience after the display mode is applied.

### Fields

- `displayMode`: the active `DisplayModePreference.mode`
- `expandedSectionIds`: existing profile section expansion state
- `drafts`: existing unsaved profile edits
- `isPreviewing`: existing preview state
- `activeDialog`: current editor dialog, if any
- `validationMessages`: visible edit validation feedback, if any
- `scrollPosition`: current reading position

### Validation Rules

- Changing `displayMode` must not mutate profile content.
- Changing `displayMode` must not add, remove, save, discard, or publish drafts.
- Changing `displayMode` must not change edit permissions or viewer role.
- Changing `displayMode` must preserve section expansion, preview state, dialogs, validation messages, and reading position.
