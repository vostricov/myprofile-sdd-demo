# Short Title
view-business-profile

## Summary
A single-page web app that displays a user's business profile as a set of collapsible content blocks. The page supports section-level edit affordances, inline edit flows for small fields and modal/drawer editors for larger content, with clear save/cancel flow, client-side validation, preview of unsaved changes, and role-based edit permission. Initial content is loaded from a mock profile JSON fixture and persisted through a browser-local profile storage adapter.

## Scope
Included:
- Single-page profile composed of discrete, collapsible sections (e.g., Overview, Services, Contact, Hours, Social links)
- Section headers with visible edit buttons; per-block inline editing where appropriate
- Modal/drawer editor for rich or multi-field sections
- Save and Cancel controls, with undo affordance for recent changes
- Initial content load from a mock profile JSON fixture and persistence through a browser-local profile storage adapter
- Responsive layout for desktop/tablet/mobile and WCAG 2.1 AA accessibility
- Client-side validation and preview mode

Out of scope:
- Authentication flows and user provisioning (assume existing auth)
- Backend API design or storage implementation details
- Multi-profile management UI or admin dashboards

## Personas & Primary User Stories
Personas:
- Owner: business owner who edits and publishes their profile.
- Visitor: public user who views the profile (read-only).
- Editor: staff member with permission to edit certain sections.

Primary stories:
- As a Visitor, I can view the business profile and expand/collapse sections to read details.
- As an Owner/Editor, I can click a section-level Edit button to change content blocks.
- As an Owner/Editor, I can use inline edits for single fields and open a modal for complex edits.
- As an Editor, I can Save or Cancel edits, with validation preventing invalid data.
- As an Owner, I can preview unsaved changes before publishing.
- As an Owner/Editor, I only see edit controls when I have permission.

## Functional Requirements
- FR-001: The page MUST load a canonical profile JSON fixture from `frontend/src/fixtures/initial-input/profile.json` and render all sections from that data.
- FR-002: Each section MUST support expand/collapse using keyboard-operable controls, update `aria-expanded`, retain focus, and synchronize the open section with the URL fragment.
- FR-003: The app MUST determine a current viewer role (`visitor`, `owner`, or `editor`) and only display section edit controls when that role is present in the section `editableBy` list.
- FR-004: The app MUST provide inline editing for simple fields and a modal or drawer editor for structured or multi-field section content.
- FR-005: Save MUST be blocked when required fields are missing or invalid, and validation errors MUST appear next to the affected field with clear descriptions.
- FR-006: Preview mode MUST show unsaved changes without committing them to persistent profile storage until Save is confirmed.
- FR-007: Save MUST persist the full profile JSON through the browser-local profile storage adapter, update the saved section `lastUpdated` timestamp, and record `lastEditedByUserId`.
- FR-008: After a successful Save, the app MUST show a confirmation toast and provide an Undo action for 30 seconds.
- FR-009: The layout MUST support mobile, tablet, and desktop breakpoints and meet WCAG 2.1 AA expectations for the implemented controls and content.
- FR-010: User-visible strings MUST be externalized, dates MUST display through locale-aware formatting, and RTL direction MUST be smoke-tested with direction-safe layout styling.

## Acceptance Criteria (testable)
Navigation & layout
- The page loads within 2s on a 3G-equivalent simulated connection (per performance budget)
- Sections appear in a single-column stack on mobile and two-column where space permits on desktop

Collapse behavior
- Each section header toggles its content; state persists while the page is open and is reflected in the URL fragment (e.g., #services)
- Expanding/collapsing animates smoothly within 200ms-300ms and retains focus for keyboard users

Edit flows & persistence
- Edit button is visible for permitted users and hidden for visitors
- Clicking Edit opens inline fields or a modal; Cancel reverts changes locally; Save persists changes and shows a confirmation toast
- Validation: required fields block Save and show inline error messages with clear descriptions
- Preview mode shows unsaved changes in a non-persistent state until Save
- Initial content loads from a mock profile JSON fixture and matches the data model example below

Accessibility
- Meets WCAG 2.1 AA: semantic headings, keyboard operable controls, ARIA attributes for expand/collapse, color contrast >= 4.5:1 for text

Performance
- Lighthouse targets: Performance >= 90, Accessibility >= 90, Best Practices >= 90 on desktop

UX
- Edit affordances are visible on hover and focus; confirmations for Save; an undo option available for 30s after save

## Data Model
Entities:
- Profile: `profileId`, `title`, `sections`
- Section: `id`, `title`, `content`, `lastUpdated`, `lastEditedByUserId`, `editableBy`
- SectionContent: string content or structured content such as `ContactContent`, `HoursContent`, or `SocialLinksContent`

Validation:
- `profileId`, `title`, `sections`, section `id`, section `title`, section `content`, section `lastUpdated`, and section `editableBy` are required.
- `editableBy` contains one or more of `owner` or `editor`; visitors never edit.
- `lastUpdated` is stored as an ISO 8601 UTC timestamp.
- `lastEditedByUserId` is updated on successful Save.
- Contact email and phone fields must pass client-side format validation when present.

Example mock JSON fixture:
{
  "profileId": "business-123",
  "title": "Acme Consulting",
  "sections": [
    {
      "id": "overview",
      "title": "Overview",
      "content": "Acme Consulting provides business strategy services.",
      "lastUpdated": "2026-06-01T12:00:00Z",
      "lastEditedByUserId": "user-001",
      "editableBy": ["owner","editor"]
    },
    {
      "id": "contact",
      "title": "Contact",
      "content": { "phone": "+1-555-0100", "email": "info@acme.example" },
      "lastUpdated": "2026-06-01T12:00:00Z",
      "lastEditedByUserId": "user-001",
      "editableBy": ["owner"]
    }
  ]
}

Storage expectations:
- Initial profile data loads from `frontend/src/fixtures/initial-input/profile.json`.
- Save persists to an in-browser local persistence adapter for this frontend-only release.
- The adapter exposes `loadProfile()` and `saveProfile(profile)`.
- Save updates the changed section `lastUpdated` and `lastEditedByUserId` before persistence.
- Backend API persistence is out of scope for this feature and is represented only by the adapter boundary.

## UI/UX Guidelines
- Visual: simple, modern, sleek; neutral palette with 1 accent color
- Spacing: 16px base rhythm, section padding 24px, vertical rhythm 16px
- Typography: scale with base 16px; headings 20/18/16 for H1/H2/H3
- Design tokens: --color-bg, --color-text, --color-accent, --spacing-1..4, --radius
- Components: SectionHeader (title, chevron, edit button), EditButton, InlineEditor, ModalEditor/Drawer, Save/Cancel, ValidationMessage, Toast, Undo
- Animations: collapse/expand height transition 200–300ms, fade for modals 150–200ms

## Editing Interaction Design
- Per-block Edit button visible on hover/focus; inline editing for single-line or short fields; modal/drawer for multi-field or rich text
- Manual save recommended (Save/Cancel) with optional local autosave draft per session
- Validation shows inline errors; Save blocked until resolved
- Optimistic UI: show updated content immediately on Save, revert on persistence error and show error toast
- Backend concurrent-save conflict resolution is deferred until API persistence is added

## Accessibility & Internationalization
- All interactive controls keyboard operable; ARIA-expanded on toggles; focus management when opening editors
- Externalize user-visible strings; store date/time in ISO format; display dates with locale-aware formatting
- Support RTL direction with direction-safe layout styling and at least one RTL smoke test for the profile view

## Testing & QA Checklist
- Navigation: load, fragment linking, responsive breakpoints
- Collapse: keyboard toggle, ARIA attributes, animation timing
- Edit flows: inline and modal, Save/Cancel, validation messages
- Persistence: initial load from JSON, save updates, lastUpdated and lastEditedByUserId changes
- Accessibility: WCAG 2.1 AA core checks, screen reader flows
- Performance: Lighthouse targets met
- Edge cases: empty sections, very long content, invalid email/phone formats

## Deliverables & Next Steps
- Spec file: specs/001-view-business-profile/spec.md
- Recommended wireframes: simple desktop, tablet, mobile for (1) default view, (2) inline edit open, (3) modal editor open, (4) preview mode
- Story/task breakdown (suggested priority):
  1. Data loading & render sections (High)
  2. Collapse/expand behavior & URL fragments (High)
  3. Role-based edit affordances & inline editor (High)
  4. Modal editor and validation (Medium)
  5. Preview, Save/Cancel, persistence (Medium)
  6. Accessibility audit & responsive polish (High)

Success: spec is ready for planning.
