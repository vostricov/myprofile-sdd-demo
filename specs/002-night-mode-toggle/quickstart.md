# Quickstart: Night Mode Toggle Validation

## Prerequisites

- Node.js and npm available locally.
- Frontend dependencies installed under `frontend/`.
- Active feature artifacts available under `specs/002-night-mode-toggle/`.

## Setup

```bash
cd frontend
npm install
```

## Run the App

```bash
cd frontend
npm run dev
```

Open the local Vite URL and validate the profile view, not the engineering dashboard view.

## Manual Validation Scenarios

### 1. Upper-Bar Toggle

1. Open the profile page with no saved display-mode preference.
2. Confirm the night mode toggle appears in the upper bar.
3. Activate the toggle with a pointer.
4. Confirm the visible profile surface changes to night mode within 1 second.
5. Activate the toggle again.
6. Confirm the profile returns to day mode within 1 second.

Expected outcome: the toggle remains visible, reports its current state, and does not require a page reload.

### 2. Keyboard and Assistive Access

1. Navigate to the upper bar using the keyboard.
2. Confirm focus reaches the night mode toggle.
3. Activate the toggle using the keyboard.
4. Inspect the control with accessibility tooling or Playwright locators.

Expected outcome: the control has a meaningful name, exposes night-mode state, has visible focus, and can be activated without a pointer.

### 3. Preference Persistence

1. Select night mode.
2. Reload the page.
3. Confirm night mode is restored.
4. Select day mode.
5. Reload the page.
6. Confirm day mode is restored.

Expected outcome: same-device explicit choices survive reloads when storage is available.

### 4. State Preservation

1. Select the editor role.
2. Expand a section and create an unsaved draft.
3. Enter preview mode.
4. Open an editor or keep validation feedback visible.
5. Switch display modes.

Expected outcome: expanded sections, URL fragment, draft content, preview state, dialogs, validation feedback, toasts, and undo availability remain intact.

### 5. Responsive, RTL, and Large Text

1. Test mobile, tablet, and desktop widths.
2. Test up to 200% text scaling.
3. Open the RTL smoke route with `?dir=rtl`.
4. Switch display modes in each context.

Expected outcome: upper-bar controls may wrap but do not overlap, clip, or become unreadable; RTL ordering and alignment remain coherent.

## Automated Validation Commands

```bash
cd frontend
npm run test
npm run build
npm run e2e
npm run lhci
```

Expected outcomes:

- Unit tests cover initial mode resolution, persistence fallback, toggle state, and profile-state preservation.
- Build completes without TypeScript errors.
- Playwright covers day/night switching, persistence across reloads, keyboard activation, edit/preview preservation, mobile/desktop layout, RTL smoke, and axe checks.
- Lighthouse remains within the existing performance, accessibility, and best-practices budgets.

## Contract Reference

Use [contracts/night-mode-ui.md](contracts/night-mode-ui.md) as the source for observable UI behavior during implementation and QA.
