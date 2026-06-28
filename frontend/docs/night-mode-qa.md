# Night Mode QA

Task: SPEC-002/T022

## Manual QA Matrix

| Area | Contract reference | Quickstart scenario | Expected evidence |
|------|--------------------|---------------------|-------------------|
| Upper-bar toggle | Toggle Interaction 1-6 | 1. Upper-Bar Toggle | Screenshot or note showing the toggle in the profile upper bar, day-to-night and night-to-day switches within 1 second, and no page reload. |
| Keyboard and assistive access | Toggle Interaction 3-5, Visual 2 | 2. Keyboard and Assistive Access | Keyboard focus reaches the toggle, Enter or Space activates it, `aria-pressed` changes, and the focus ring is visible in both modes. |
| Preference persistence | Initial Mode 1-5, Toggle Interaction 7-8 | 3. Preference Persistence | Night mode survives reload, day mode survives reload after explicit selection, invalid saved data is ignored, and storage failure still allows current-session switching. |
| Editing state preservation | Preservation Contract | 4. State Preservation | Expanded section, unsaved inline draft, preview state, validation message, modal editor, toast, and undo button remain visible and usable after a mode switch. |
| Contrast and readability | Visual 1-4 | 1-4 | Manual contrast spot checks for page text, section cards, details panel, links, primary/secondary buttons, disabled buttons, validation errors, dialogs, and toasts in both modes. |
| Responsive layout | Visual 5-7 | 5. Responsive, RTL, and Large Text | Mobile, desktop, 200-percent text, and `?dir=rtl` checks show wrapping without overlap, clipping, or unreadable controls. |

## Validation Notes

- Automated coverage in `frontend/tests/unit/displayMode.test.tsx` verifies mode resolution, persistence fallback, current-session toggling, and profile-state preservation.
- Automated coverage in `frontend/tests/e2e/profile.spec.ts` verifies upper-bar activation, reload persistence, preservation flows, responsive layouts, RTL, and axe scans.
- Lighthouse and final command results are recorded in this file by SPEC-002/T024.
