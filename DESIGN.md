# DesignPdfViewer.md
# PDF Viewer — Monkeytype-Inspired Design System

> **Purpose:** This document is the authoritative UI/UX design specification for the PDF Viewer application. Use it as the design source of truth when building or updating the frontend.
>
> **Visual reference:** [Monkeytype](https://monkeytype.com/) — borrow its restrained dark interface, typography-led hierarchy, generous negative space, muted surfaces, precise alignment, subtle accent color, and keyboard-friendly interaction philosophy. Do **not** copy its logo, wording, exact page composition, or typing-test-specific UI.
>
> **Product:** A focused PDF reading experience. Admins upload and manage PDF documents. Users can open and read PDFs in the browser. Users must not be offered a PDF download action.

---

## 1. Design direction

Create a calm, premium, distraction-free reading interface that feels precise and intentional.

The interface should communicate:
- **Focus:** the document is the main content; surrounding UI stays quiet.
- **Clarity:** clear hierarchy, readable typography, predictable controls.
- **Consistency:** shared spacing, widths, colors, radii, and component behavior across every route.
- **Restraint:** avoid decorative gradients, excessive cards, heavy shadows, noisy borders, and unnecessary animation.
- **Trust:** clear document titles, upload status, loading states, and useful error messages.

### Design principles

1. Use a dark charcoal background rather than pure black.
2. Use one warm, restrained accent color for active states and important actions.
3. Keep most text neutral and muted; reserve high contrast for primary content.
4. Use whitespace and alignment to create hierarchy instead of boxes around everything.
5. Keep the PDF page visually dominant and centered.
6. Make every control have a clear purpose, accessible label, and visible focus state.
7. Keep the admin experience visually related to the reader experience.
8. Never introduce a second design language on an individual route.

---

## 2. Color tokens

Use these tokens consistently. Do not invent one-off colors in components.

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#17181C` | Global application background |
| `--color-bg-elevated` | `#1D1F24` | Header, toolbar, elevated areas |
| `--color-surface` | `#23252B` | Menus, panels, input backgrounds |
| `--color-surface-hover` | `#2B2E35` | Hovered controls and rows |
| `--color-border` | `#343740` | Subtle dividers and outlines |
| `--color-text` | `#E6E7EB` | Primary text |
| `--color-text-muted` | `#A0A3AD` | Secondary text and descriptions |
| `--color-text-subtle` | `#747985` | Hints, metadata, placeholders |
| `--color-accent` | `#E2B714` | Active state, focus accent, primary highlight |
| `--color-accent-hover` | `#F0C928` | Accent hover |
| `--color-success` | `#79B88A` | Successful upload/status |
| `--color-warning` | `#D9A85B` | Pending or caution state |
| `--color-danger` | `#D97979` | Errors and destructive actions |
| `--color-pdf-canvas` | `#30323A` | Viewer workspace behind the PDF |
| `--color-pdf-page` | `#FFFFFF` | Actual rendered PDF page |

### Color rules

- The accent is for interaction and emphasis, not large decorative backgrounds.
- Use danger red only for destructive actions and errors.
- Do not use colored status text without an accompanying label or icon.
- PDF pages must retain their original document colors; never apply a dark filter to the page itself.
- Maintain readable contrast for all text and controls.

---

## 3. Typography

Use a clean sans-serif stack. Prefer **Inter** if already available locally; otherwise use a system sans-serif stack. Do not add a remote font dependency unless the project already uses one.

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| Page title | 24–28px | 600 | Main route heading |
| Section title | 16–18px | 600 | Panel/section heading |
| Body | 14–16px | 400 | General interface text |
| Control label | 13–14px | 500 | Buttons, fields, tabs |
| Metadata | 12px | 400 | File size, date, page count |
| Small hint | 11–12px | 400 | Keyboard hints and helper text |

Typography rules:
- Use sentence case for labels and headings.
- Avoid oversized marketing-style hero typography.
- Keep line-height comfortable: 1.45–1.6 for body text.
- Use tabular numerals for page counts, file sizes, and numeric metadata where supported.
- Do not use more than three font weights on one screen.

---

## 4. Layout and responsive grid

### Global application frame

- Full viewport height: `min-height: 100dvh`.
- Desktop content maximum width: `1200px`.
- Center all standard page content with `margin-inline: auto`.
- Horizontal page padding: `24px` desktop, `20px` tablet, `16px` mobile.
- Keep the same left and right alignment across dashboard, document list, upload, and settings pages.
- Avoid negative margins and horizontal overflow.
- The reading workspace may use the available viewport width, but its toolbar and surrounding controls must align consistently.

```css
.app-container {
  width: min(100% - 48px, 1200px);
  margin-inline: auto;
}

@media (max-width: 768px) {
  .app-container {
    width: min(100% - 32px, 1200px);
  }
}
```

### Spacing scale

Use an 8px-based system. Allowed values:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`

- Tight control spacing: 8px.
- Related content spacing: 12–16px.
- Section spacing: 24–32px.
- Major page separation: 40–48px.
- Do not use arbitrary spacing values unless required by the PDF renderer.

### Responsive breakpoints

| Breakpoint | Width | Behavior |
|---|---:|---|
| Mobile | `< 640px` | Single column; compact toolbar; stacked actions |
| Tablet | `640–1023px` | Flexible content; reduced gaps |
| Desktop | `1024–1439px` | Standard 1200px container |
| Wide | `>= 1440px` | Keep content capped; do not stretch text/list rows excessively |

At every breakpoint:
- No clipped buttons or headings.
- No horizontal page scrolling.
- Tables become readable stacked rows or use a deliberate horizontal scroll region.
- Toolbar controls may wrap or move into a clearly labeled overflow menu.
- Touch targets should be at least 44×44px on touch devices.

---

## 5. Shared shell and navigation

### Header

A compact header inspired by Monkeytype's minimal navigation.

**Desktop**
- Height: 64–72px.
- Brand/product name on the left.
- Primary navigation in the middle or beside the brand.
- Account/admin controls on the right.
- Bottom border: `1px solid var(--color-border)`.
- Background: `var(--color-bg)` or a subtly elevated surface.

**Mobile**
- Height: 60px.
- Brand on the left.
- Menu trigger on the right.
- Navigation opens in a simple panel; do not squeeze all links into the header.

### Navigation behavior

- Active route uses the accent color or a restrained underline.
- Hover changes surface/text subtly.
- Every route uses the same header height, alignment, and active-state behavior.
- Do not create a separate header design for the admin pages.

### Footer

- Keep the footer minimal.
- Use muted text, subtle top border, and the same container width.
- Include only useful links and product information.
- Hide or simplify the footer in the full-screen PDF reader when it would reduce reading space.

---

## 6. Page specifications

### 6.1 Admin dashboard

**Purpose:** Give admins a quick overview and direct access to document management.

Layout:
1. Shared header.
2. Main container, maximum width 1200px.
3. Page title and concise supporting text.
4. Small summary row for document count and recent activity, only if the data exists.
5. Primary action: **Upload PDF**.
6. Recent documents list/table.

Visual treatment:
- No oversized dashboard cards.
- Use subtle separators and restrained surface changes.
- Summary values should be clear but not visually louder than the page title.
- Keep the primary action easy to find.

### 6.2 Document management/list page

**Purpose:** Allow admins to find, inspect, and manage uploaded PDFs.

Required elements:
- Page title: `Documents`.
- Search input with placeholder `Search documents...`.
- Upload PDF action.
- Document list with title, upload date, file size, status, and permitted admin actions.
- Empty state when no documents exist.
- Loading skeleton while data is loading.
- Error state with retry where appropriate.

Desktop list:
- Use a clean table or aligned rows.
- Column labels are small, muted, and consistent.
- Each row has a subtle divider.
- Row hover uses `--color-surface-hover`.
- Keep action buttons aligned in one column.

Mobile list:
- Convert each row into a compact stacked document item.
- Put title first, metadata below, actions in a clearly accessible menu or row.
- Do not shrink table text to unreadable sizes.

Admin actions may include preview, edit metadata, and delete, according to the existing backend capabilities. Do not add unsupported actions.

### 6.3 Upload PDF page/modal

**Purpose:** Make uploading a PDF obvious and low-friction.

Visual structure:
- A focused upload panel, not a full-screen marketing card.
- Dashed border drop zone with a restrained accent on drag-over.
- Upload icon, `Upload a PDF`, and concise instructions.
- File picker button.
- Selected file row with name, size, and remove/replace control.
- Upload progress only when the backend provides progress information.
- Clear success and failure feedback.

Validation:
- Accept PDF files only.
- Validate file type and size on the client for usability, and enforce validation on the server.
- Do not trust the filename or browser MIME type as the only security check.
- Prevent duplicate submissions while upload is in progress.
- Preserve the selected file when a recoverable upload error occurs.

Suggested copy:
- Title: `Upload a PDF`
- Helper: `Choose a PDF file to make it available in the viewer.`
- Drop hint: `Drag and drop a PDF here, or browse files.`
- Restriction: `PDF files only. Maximum size is determined by the server upload limit.`

### 6.4 User document library

**Purpose:** Let users browse available PDFs and open one for reading.

Layout:
- Shared header.
- Main container at 1200px maximum width.
- Heading: `Library`.
- Optional search field if document count justifies it.
- Simple document rows or a restrained grid.
- Each item shows document title and useful metadata.
- Primary action: `Read PDF` or `Open document`.

Rules:
- Do not show a Download button, download icon, or download menu.
- Do not expose direct storage URLs in the UI.
- Do not display admin-only controls to regular users.
- Empty, loading, and error states must be designed.

### 6.5 PDF reader — primary experience

**This is the most important screen.** It should feel like a quiet reading tool, not a dashboard.

Desktop structure:

```text
┌──────────────────────────────────────────────────────────────────┐
│ Header: Brand   Library / Document title                 Account │
├──────────────────────────────────────────────────────────────────┤
│ Document title                         Page 1 of 24   Fit / Zoom  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                     PDF READING WORKSPACE                        │
│                                                                  │
│                  ┌──────────────────────────┐                    │
│                  │                          │                    │
│                  │       PDF PAGE            │                    │
│                  │                          │                    │
│                  └──────────────────────────┘                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Reader visual rules:
- Workspace background: `--color-pdf-canvas`.
- PDF page: white, with a subtle shadow to separate it from the workspace.
- Center pages horizontally when practical.
- Preserve the PDF's aspect ratio.
- Do not crop, stretch, recolor, or distort PDF pages.
- Use a comfortable maximum page width; allow zoom to enlarge.
- Keep controls compact and visually secondary to the document.
- On mobile, prioritize page visibility and touch-friendly navigation.

Reader toolbar controls:
- Back to library.
- Document title (truncate safely if long).
- Previous page and next page.
- Current page / total pages.
- Zoom out and zoom in.
- Fit-to-width or fit-to-page option if supported by the chosen PDF renderer.
- Full-screen toggle if supported.
- A clearly labeled exit/back action.

**Prohibited in the user reader:**
- Download button or download menu.
- Print button or print menu.
- Export/save-a-copy action.
- Direct link to the PDF storage file.
- Any UI that implies the user can save a local copy.

Keyboard support:
- `←` / `→` may navigate pages when focus is not inside an input.
- `+` / `-` may zoom when supported.
- `Esc` exits full-screen mode when supported.
- Always provide visible controls; keyboard shortcuts are optional enhancements, not the only way to operate the viewer.

### 6.6 Access denied / unavailable document

Use a quiet, centered message with:
- Clear heading.
- One sentence explaining the document is unavailable or access is not permitted.
- A `Back to Library` action.
- No raw server error, stack trace, filesystem path, or storage URL.

---

## 7. Component design rules

### Buttons

| Type | Appearance | Usage |
|---|---|---|
| Primary | Accent background, dark text | Main action such as Upload PDF |
| Secondary | Surface background, subtle border | Back, Cancel, secondary actions |
| Ghost | Transparent, muted text | Toolbar and low-priority actions |
| Danger | Restrained danger treatment | Delete and destructive confirmation |

Button rules:
- Height: 40px standard; 44px minimum touch target.
- Horizontal padding: 14–16px.
- Radius: 6–8px.
- Hover, active, disabled, and focus states must be defined.
- Use verbs that describe the action.
- Do not use icon-only buttons without accessible names/tooltips.

### Inputs

- Height: 42–44px.
- Background: `--color-surface`.
- Border: `1px solid var(--color-border)`.
- Text: `--color-text`.
- Placeholder: `--color-text-subtle`.
- Focus: visible accent outline or border.
- Labels must remain visible; do not rely on placeholders as labels.
- Error messages appear directly below the related field.

### Panels and cards

- Use panels only when they clarify grouping.
- Background: `--color-bg-elevated` or `--color-surface`.
- Border: subtle.
- Radius: 8–10px.
- Avoid large shadows and nested cards.
- Never wrap every individual piece of text in a card.

### Icons

- Use one consistent icon family and stroke weight.
- Prefer simple outline icons.
- Keep standard icons around 16–20px.
- Pair unfamiliar icons with text labels.
- Do not use emoji as interface icons.

### Status labels

Use concise text labels such as `Available`, `Processing`, `Failed`, or `Uploaded`, only where those states exist in the actual application. Color must not be the only status indicator.

---

## 8. Motion and interaction

Motion should be subtle and functional.

- Standard transition: 120–180ms.
- Use opacity and small color changes for hover/focus.
- Avoid large entrance animations, parallax, bouncing, and decorative motion.
- Do not animate the PDF page itself during normal page navigation.
- Respect `prefers-reduced-motion: reduce`.
- Loading indicators should communicate real ongoing work.
- Disable repeated submissions while a request is pending.

---

## 9. PDF viewing and access-control requirements

The product requirement is **view-only access for regular users**. The UI must not offer downloading. However, hiding a download button alone does not make a PDF impossible to download.

Implementation requirements:
1. Serve documents through an authenticated, authorization-checked viewer endpoint.
2. Check user permissions on every document/page request.
3. Keep original files in private storage; never use a public storage URL.
4. Do not expose the original file path or permanent public URL in frontend data.
5. Use short-lived authorized delivery where appropriate.
6. Disable viewer download/print UI and avoid exposing download controls in the application.
7. Apply suitable response headers and server-side access controls.
8. Do not claim that browser-based PDF viewing can prevent screenshots, browser inspection, or all forms of copying. A browser must receive document data to render it.
9. Log administrative upload/delete actions if audit logging exists or is required.
10. Validate file type, size, and access on the server.

**Important:** Treat view-only as an application access policy, not an absolute guarantee against copying. Do not implement deceptive security claims.

---

## 10. Accessibility

- Use semantic headings in logical order.
- All interactive controls must be keyboard reachable.
- Show a clear focus indicator.
- Provide accessible names for icon-only controls.
- Maintain sufficient text/background contrast.
- Associate form labels and validation messages with inputs.
- Announce upload success/failure and relevant loading changes to assistive technology.
- Do not communicate status through color alone.
- Ensure mobile controls have comfortable touch targets.
- Do not trap keyboard focus except in a correctly implemented modal.

---

## 11. Required UI states

Every data-driven page must account for these states:

| State | Expected behavior |
|---|---|
| Initial loading | Stable skeleton or restrained spinner |
| Empty | Helpful explanation and relevant next action |
| Success | Clear confirmation without unnecessary celebration |
| Validation error | Explain what needs to be corrected |
| Network/server error | Human-readable message and retry where safe |
| Unauthorized | Explain access is required; provide a safe route back |
| Not found | Explain the document/page is unavailable |
| Uploading | Show real progress or an indeterminate loading state |
| Disabled | Visually clear and not accidentally interactive |

Do not leave blank screens or show raw exception messages.

---

## 12. Frontend implementation guidance

Adapt these rules to the project's existing framework and architecture. Do not introduce a new framework or replace working infrastructure just to match this design.

Suggested CSS variables:

```css
:root {
  color-scheme: dark;
  --color-bg: #17181c;
  --color-bg-elevated: #1d1f24;
  --color-surface: #23252b;
  --color-surface-hover: #2b2e35;
  --color-border: #343740;
  --color-text: #e6e7eb;
  --color-text-muted: #a0a3ad;
  --color-text-subtle: #747985;
  --color-accent: #e2b714;
  --color-accent-hover: #f0c928;
  --color-success: #79b88a;
  --color-warning: #d9a85b;
  --color-danger: #d97979;
  --color-pdf-canvas: #30323a;
  --radius-control: 7px;
  --radius-panel: 9px;
  --container-width: 1200px;
}
```

Implementation expectations:
- Build shared components for header, page container, buttons, inputs, status labels, empty states, and loading states.
- Use one source of truth for design tokens.
- Keep route layouts consistent by composing shared components.
- Keep PDF rendering isolated in a reader component.
- Keep data fetching, permissions, and document state out of purely presentational components where practical.
- Use the project's existing PDF library if it is already working; do not replace it without a technical reason.
- Do not fake page count, upload progress, file size, or document status.
- Avoid unnecessary dependencies.
- Keep TypeScript types accurate if the project uses TypeScript.
- Ensure production build and existing tests still pass.

---

## 13. Do not do these things

- Do not copy Monkeytype's exact UI, logo, brand assets, or text.
- Do not use pure black as the entire interface background.
- Do not add random gradients, glassmorphism, neon glows, or colorful blobs.
- Do not use inconsistent border radii or spacing between routes.
- Do not make every section a card.
- Do not create oversized dashboard widgets.
- Do not add decorative animations.
- Do not use tiny mobile controls.
- Do not allow horizontal overflow.
- Do not expose download, print, export, or public-file actions to regular users.
- Do not change backend behavior, API contracts, authentication, or database structure as part of a visual-only task unless explicitly required.
- Do not remove existing working functionality.
- Do not rewrite unrelated files.

---

## 14. Definition of done

The design is complete only when all applicable checks pass:

### Visual consistency
- [ ] Every route uses the same color tokens and typography.
- [ ] Header, container width, and page gutters align across routes.
- [ ] Spacing and radii are consistent.
- [ ] Dark theme is readable and restrained.
- [ ] PDF pages remain clear, centered, and undistorted.

### Responsive behavior
- [ ] Mobile, tablet, laptop, and desktop layouts work.
- [ ] No unintended horizontal scrolling.
- [ ] Toolbar remains usable on narrow screens.
- [ ] Touch targets are comfortably sized.
- [ ] Long document titles and metadata do not break layouts.

### Functionality
- [ ] Admin can upload valid PDFs using the existing backend flow.
- [ ] Invalid files produce clear validation feedback.
- [ ] Admin can see and manage documents according to existing permissions.
- [ ] Authorized users can open and read PDFs.
- [ ] Page navigation and zoom work if supported by the viewer.
- [ ] Loading, empty, error, and unauthorized states are implemented.
- [ ] Regular users are not shown download/print/export controls.
- [ ] Existing authentication and API behavior remain intact.

### Quality
- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] No console errors introduced.
- [ ] No broken images or missing icons.
- [ ] Lint/type checks and production build pass.
- [ ] No unrelated functionality or design was changed.

---

## 15. OpenCode execution instructions

When OpenCode receives this file, it must follow these instructions:

1. First inspect the existing repository structure, routes, components, styles, PDF renderer, API calls, and current functionality.
2. Identify the actual framework, styling system, and existing design conventions before editing.
3. Treat this document as the single design source of truth for the PDF Viewer UI.
4. Create or update shared design tokens and reusable components before styling individual pages.
5. Implement the design consistently across all existing relevant routes.
6. Preserve all working features, API contracts, authentication, database behavior, and project architecture.
7. Do not invent endpoints, data, statuses, or backend capabilities.
8. Do not modify unrelated modules or files.
9. Test the app at mobile, tablet, laptop, and desktop widths.
10. Run the available lint, type-check, test, and production-build commands.
11. Fix issues caused by the implementation before finishing.
12. At the end, report:
    - Files changed.
    - Shared components/tokens created or updated.
    - Routes updated.
    - Tests/build commands run and their results.
    - Any remaining limitation.

### Mandatory OpenCode rule

**Do not stop after creating a visual mockup. Implement the design in the existing application, connect it to the existing working functionality, verify responsive behavior, and preserve unrelated functionality. If a requirement conflicts with the current architecture, explain the conflict and choose the smallest safe change.**

---

## Final design target

A premium, minimal, dark PDF reading product with Monkeytype-inspired restraint: calm charcoal surfaces, warm yellow accent, excellent typography, consistent 1200px alignment, precise spacing, and a distraction-free document viewer. The PDF itself is always the hero. Admin tools are clear and efficient; user reading remains simple and view-only.
