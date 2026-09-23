# Admin Login + Management Dashboard — Design

Date: 2026-09-16

## Purpose

Add a `/login` page and a `/dashboard` subsystem to DriveTime for internal
staff to manage inventory, leads, contact submissions, and team users. No
backend/DB exists in this project (Next.js App Router, purely client-side
mock data throughout the homepage) — this subsystem follows the same
approach: everything is mocked and persisted only in the browser.

## Access model

- No real authentication backend. `/login` accepts any non-empty
  email + password.
- On submit, `lib/auth.ts`'s `login(email)` writes a session flag and the
  email to `localStorage` (key: `dt_admin_session`), then the page routes
  to `/dashboard`.
- `app/dashboard/layout.tsx` is a client component. On mount it checks the
  session flag; if absent, `router.replace("/login")`. While checking, it
  renders nothing (avoids a flash of dashboard content).
- A `logout()` helper clears the flag; a Logout icon button lives in the
  sidebar footer next to Settings.
- `Settings` is a static, non-navigating button with hover feedback only —
  no settings page in this pass.

## Visual system

The dashboard is a **self-contained light theme**, independent of the
homepage's `ThemeProvider`/`data-theme` toggle. It uses literal Tailwind
slate utilities directly rather than the homepage's CSS-variable tokens:

- Background: `bg-slate-50`, card surfaces `bg-white`.
- Borders: `border-slate-200`.
- Text: `text-slate-900` primary, `text-slate-500` secondary.
- Cards: `rounded-2xl border border-slate-200 bg-white shadow-sm
  hover:shadow-md transition-shadow`.
- Accent: a single accent color (indigo/blue, e.g. `indigo-600`) for active
  nav state, primary buttons, and focus rings.
- Typography: existing Geist font stack (already loaded app-wide).
- Icons: `lucide-react` (already a dependency).
- Motion: `framer-motion` fade/slide on page mount and card entry,
  consistent with the homepage's `fadeUp`/`staggerContainer` variants
  (reused from `lib/motion.ts` — those are theme-agnostic).

## Routes

```
app/login/page.tsx                  — split-screen login (client component)
app/dashboard/layout.tsx            — auth gate + sidebar shell (client)
app/dashboard/page.tsx              — Control Panel (overview)
app/dashboard/inventory/page.tsx    — Inventory table
app/dashboard/leads/page.tsx        — Leads table
app/dashboard/contact/page.tsx      — Contact Us inbox
app/dashboard/users/page.tsx        — Users/team directory
```

## Shared infrastructure

- `lib/auth.ts` — `login(email)`, `logout()`, `isAuthenticated()`,
  `getCurrentUser()` (reads/writes `localStorage`).
- `lib/dashboard-data.ts` — seed arrays and TypeScript types:
  - `InventoryItem` — extends the shape of `data/cars.ts` entries with an
    added `status: "Available" | "Reserved" | "Sold"`. Seed reuses the 9
    existing cars, assigning plausible statuses.
  - `Lead` — `{ id, name, email, phone, interestedIn, source, status:
    "New" | "Contacted" | "Negotiating" | "Won", createdAt }`.
  - `ContactMessage` — `{ id, name, email, subject, message, receivedAt,
    read: boolean }`.
  - `TeamUser` — `{ id, name, email, role: "Admin" | "Sales" | "Manager",
    status: "Active" | "Invited" }`.
- `lib/use-local-storage.ts` — generic `useLocalStorage<T>(key, seed)`
  hook. Initializes state to `seed` (matches SSR output, avoids hydration
  mismatch), then in a `useEffect` reads `localStorage` and updates state
  if a saved value exists. Every mutation writes back to `localStorage`.
- `components/dashboard/sidebar.tsx` — 5 nav links with `lucide-react`
  icons, active state via `usePathname()`, footer with avatar (initials),
  name/role from `getCurrentUser()`, Settings + Logout buttons.
- `components/dashboard/stat-card.tsx` — KPI card (icon, label, value,
  optional trend text).
- `components/dashboard/status-pill.tsx` — colored pill, takes a status
  string + a color-mapping prop per page (inventory vs. leads use
  different status vocab/colors).
- `components/dashboard/modal.tsx` — Framer Motion backdrop-fade +
  panel-slide dialog, reused for: inventory add/edit form and contact
  message detail view.

## Pages

1. **Control Panel** (`/dashboard`) — 4 `StatCard`s (Total Inventory,
   Active Leads, Monthly Revenue, Pending Inquiries) computed from the
   mock data; a recent-activity feed (merged, sorted leads + messages,
   latest ~6); a "recently added vehicles" strip (thumbnail, name, price,
   status pill).
2. **Inventory** (`/dashboard/inventory`) — search input + status filter;
   table (desktop) with image thumbnail, make/model/trim, year, price,
   status pill, edit/delete icon buttons; "Add Vehicle" button opens the
   modal form (create or edit, shared).
3. **Leads** (`/dashboard/leads`) — status-filter tabs with live counts
   (All/New/Contacted/Negotiating/Won); table with contact info, interest,
   source, status pill, inline status `<select>`, delete.
4. **Contact Us** (`/dashboard/contact`) — list of messages (unread dot,
   sender, subject snippet, relative timestamp); clicking opens the shared
   modal with the full message and marks it read; delete action.
5. **Users** (`/dashboard/users`) — team table (avatar initials, name,
   email, role, status); inline role `<select>`; "Invite User" button
   opens a modal (name/email/role) that appends a new `Active` user;
   remove action.

## Error handling

- Login form: client-side required-field validation only (inline error
  text under each field); no failure path since any input succeeds.
- Add/Invite modals: required-field validation before allowing submit;
  submit button disabled until valid.
- Delete actions use a lightweight inline confirm (button turns into a
  "Confirm delete?" state on first click) rather than a blocking
  `window.confirm`, consistent with the rest of the app avoiding native
  dialogs.

## Testing

No test framework exists in this repo (consistent with the rest of the
project). Verification is manual: run the dev server, exercise
login/logout, and confirm add/edit/delete in each page persists across a
reload (localStorage) and clears on logout only if explicitly reset (data
persistence is independent of the session flag — logging out does not
wipe mock data).

## Out of scope

- Any real backend, database, or authentication provider.
- Password reset flow ("Forgot my password?" is a static link).
- A working Settings page.
- Automated tests (none exist elsewhere in the repo).
