# Short Title
view-business-profile

## Summary
A single-page web app that displays a user's business profile as a set of collapsible content blocks. The page supports section-level edit affordances, inline edit flows for small fields and modal/drawer editors for larger content, with clear save/cancel flow, client-side validation, preview of unsaved changes, and role-based edit permission. Initial content is loaded from an "initial input" folder and persisted to the canonical storage format.

## Scope
Included:
- Single-page profile composed of discrete, collapsible sections (e.g., Overview, Services, Contact, Hours, Social links)
- Section headers with visible edit buttons; per-block inline editing where appropriate
- Modal/drawer editor for rich or multi-field sections
- Save and Cancel controls, with undo affordance for recent changes
- Initial content load from an "initial input" folder (JSON files) and persistence to storage
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
- Initial content loads from an "initial input" folder (JSON) and matches the data model example below

Accessibility
- Meets WCAG 2.1 AA: semantic headings, keyboard operable controls, ARIA attributes for expand/collapse, color contrast >= 4.5:1 for text

Performance
- Lighthouse targets: Performance >= 90, Accessibility >= 90, Best Practices >= 90 on desktop

UX
- Edit affordances are visible on hover and focus; confirmations for Save; an undo option available for 30s after save

## Data Model (minimal)
Entities: profile -> sections -> fields
Fields per section: id, title, content (string or structured), lastUpdated, editableBy (roles array)

Example initial JSON (initial input folder):
{
  "profileId": "business-123",
  "title": "Acme Consulting",
  "sections": [
    {
      "id": "overview",
      "title": "Overview",
      "content": "Acme Consulting provides business strategy services.",
      "lastUpdated": "2026-06-01T12:00:00Z",
      "editableBy": ["owner","editor"]
    },
    {
      "id": "contact",
      "title": "Contact",
      "content": { "phone": "+1-555-0100", "email": "info@acme.example" },
      "lastUpdated": "2026-06-01T12:00:00Z",
      "editableBy": ["owner"]
    }
  ]
}

Storage expectations:
- Persist full profile JSON after Save
- Track lastUpdated per section and userId of last editor

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
- Optimistic UI: show updated content immediately on Save, revert on server error and show error toast
- Conflict resolution: on concurrent-save conflict, show diff overlay with options: Keep mine / Keep theirs / Merge manually

## Accessibility & Internationalization
- All interactive controls keyboard operable; ARIA-expanded on toggles; focus management when opening editors
- Support RTL and string externalization; date/time in ISO in storage; allow locale-aware display in UI

## Testing & QA Checklist
- Navigation: load, fragment linking, responsive breakpoints
- Collapse: keyboard toggle, ARIA attributes, animation timing
- Edit flows: inline and modal, Save/Cancel, validation messages
- Persistence: initial load from JSON, save updates, lastUpdated changes
- Accessibility: WCAG 2.1 AA core checks, screen reader flows
- Performance: Lighthouse targets met
- Edge cases: empty sections, very long content, invalid email/phone formats

## Deliverables & Next Steps
- Spec file: specs/001-view-business-profile/spec.md
- Recommended wireframes: simple desktop, tablet, mobile for (1) default view, (2) inline edit open, (3) modal editor open, (4) preview mode
- Story/task breakdown (suggested priority):
  1. Data loading & render sections (High)
  2. Collapse/expand behavior & URL fragments (High)
  3. Edit affordances & inline editor (High)
  4. Modal editor and validation (Medium)
  5. Preview, Save/Cancel, persistence (Medium)
  6. Accessibility audit & responsive polish (High)

Success: spec is ready for planning.

