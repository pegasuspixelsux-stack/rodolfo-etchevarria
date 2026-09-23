# Admin Login + Management Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/login` page and a full `/dashboard` admin subsystem (Control Panel, Inventory, Leads, Contact Us, Users) to the DriveTime Next.js app, entirely client-side/mock.

**Architecture:** A tiny `lib/auth.ts` (localStorage session flag) gates a client `app/dashboard/layout.tsx`, which renders a shared sidebar and one route per nav item. All dashboard state (inventory/leads/messages/users) is seeded from `lib/dashboard-data.ts` and persisted via a generic `useLocalStorage` hook, so edits survive reloads. The dashboard is visually self-contained (literal Tailwind `slate-*`/`indigo-*` classes), independent of the homepage's dark/light `ThemeProvider`. The login page reuses the homepage's existing CSS-variable theme and `.glass` utility.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, lucide-react (all already installed — no new dependencies).

**Spec:** `docs/superpowers/specs/2026-09-16-admin-dashboard-design.md`

## Global Constraints

- No backend, database, or real authentication — any non-empty email/password logs in. `/login` and the dashboard's data layer are 100% client-side mock/localStorage.
- The dashboard uses literal Tailwind slate/indigo utility classes (`bg-slate-50`, `bg-white`, `border-slate-200`, `text-slate-900`, `rounded-2xl`, `shadow-sm hover:shadow-md`) — it must NOT use the homepage's `var(--background)`-style CSS-variable tokens or the `ThemeProvider`/`ThemeToggle`.
- The login page DOES reuse the homepage's existing CSS-variable theme (`bg-background`, `text-foreground`, `.glass`, etc.) and `lib/motion.ts` variants, matching the homepage aesthetic per the original spec.
- No new npm packages. Icons from `lucide-react`, motion from `framer-motion`, both already dependencies.
- No test framework exists in this repo and none is being added. Every task's verification step is: (a) `npx tsc --noEmit` for pure-logic files with no consumer yet, or (b) the dev server's compiled output + a `curl` status check for routes, plus (c) a concrete manual browser checklist for interactive behavior.
- Dev server: `npm run dev` (Next.js + Turbopack). If a task doesn't specify a port, check the terminal output for the actual port (3000 may be occupied, in which case Next.js picks the next free port, e.g. 3002) and substitute it in the `curl` commands.

---

### Task 1: `lib/auth.ts` — mock session helpers

**Files:**
- Create: `lib/auth.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `CurrentUser` type (`{ email: string; name: string; role: string }`), `login(email: string): void`, `logout(): void`, `isAuthenticated(): boolean`, `getCurrentUser(): CurrentUser`. Used by Task 9 (login page), Task 8 (Sidebar), Task 10 (dashboard layout).

- [ ] **Step 1: Create the file**

```typescript
export interface CurrentUser {
  email: string;
  name: string;
  role: string;
}

const SESSION_KEY = "dt_admin_session";
const USER_KEY = "dt_admin_user";
const FALLBACK_USER: CurrentUser = { email: "", name: "Admin", role: "Admin" };

function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[.\-_]/).filter(Boolean);
  if (parts.length === 0) return "Admin";
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function login(email: string): void {
  if (typeof window === "undefined") return;
  const user: CurrentUser = {
    email,
    name: deriveNameFromEmail(email),
    role: "Admin",
  };
  window.localStorage.setItem(SESSION_KEY, "true");
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_KEY) === "true";
}

export function getCurrentUser(): CurrentUser {
  if (typeof window === "undefined") return FALLBACK_USER;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return FALLBACK_USER;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return FALLBACK_USER;
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/auth.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add mock session auth helpers"
```

---

### Task 2: `lib/use-local-storage.ts` — persisted state hook

**Files:**
- Create: `lib/use-local-storage.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `useLocalStorage<T>(key: string, seed: T): readonly [T, (next: T | ((prev: T) => T)) => void]`. Used by Tasks 11–15 (all dashboard pages).

- [ ] **Step 1: Create the file**

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, seed: T) {
  const [value, setValueState] = useState<T>(seed);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setValueState(JSON.parse(raw) as T);
      }
    } catch {
      // malformed or unavailable storage — keep the seed value
    }
    // Only re-hydrate if the key itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage unavailable — state still updates in memory
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setValue] as const;
}
```

Note: writes only happen when the consumer explicitly calls `setValue` — the hydration effect never triggers a write, so a fresh page load can never clobber existing `localStorage` data with the seed.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/use-local-storage.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/use-local-storage.ts
git commit -m "feat: add generic localStorage-persisted state hook"
```

---

### Task 3: `lib/dashboard-data.ts` — mock data + types

**Files:**
- Create: `lib/dashboard-data.ts`

**Interfaces:**
- Consumes: `Car` type and `cars` array from `@/data/cars` (existing file).
- Produces: `InventoryStatus`, `InventoryItem`, `seedInventory`; `LeadStatus`, `Lead`, `seedLeads`; `ContactMessage`, `seedMessages`; `TeamRole`, `TeamStatus`, `TeamUser`, `seedUsers`. Used by Tasks 11–15.

- [ ] **Step 1: Create the file**

```typescript
import { cars, type Car } from "@/data/cars";

export type InventoryStatus = "Available" | "Reserved" | "Sold";

export interface InventoryItem extends Car {
  status: InventoryStatus;
}

const INVENTORY_STATUS_BY_ID: Record<string, InventoryStatus> = {
  "range-rover-sport-2023": "Available",
  "bmw-m5-2023": "Available",
  "porsche-panamera-2024": "Reserved",
  "tesla-roadster-2024": "Available",
  "honda-crv-2022": "Sold",
  "nissan-gtr-2023": "Available",
  "ford-expedition-2023": "Reserved",
  "mercedes-amg-gtr-2023": "Available",
  "lamborghini-aventador-2023": "Sold",
};

export const seedInventory: InventoryItem[] = cars.map((car) => ({
  ...car,
  status: INVENTORY_STATUS_BY_ID[car.id] ?? "Available",
}));

export type LeadStatus = "New" | "Contacted" | "Negotiating" | "Won";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestedIn: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
}

export const seedLeads: Lead[] = [
  { id: "lead-1", name: "Jordan Avery", email: "jordan.avery@email.com", phone: "(415) 555-0148", interestedIn: "BMW M5 Competition", source: "Website", status: "New", createdAt: "2026-09-14" },
  { id: "lead-2", name: "Priya Nair", email: "priya.nair@email.com", phone: "(650) 555-0122", interestedIn: "Porsche Panamera 4S", source: "Phone", status: "Contacted", createdAt: "2026-09-12" },
  { id: "lead-3", name: "Marcus Webb", email: "marcus.webb@email.com", phone: "(510) 555-0177", interestedIn: "Tesla Roadster", source: "Walk-in", status: "Negotiating", createdAt: "2026-09-10" },
  { id: "lead-4", name: "Elena Castillo", email: "elena.castillo@email.com", phone: "(408) 555-0193", interestedIn: "Range Rover Sport", source: "Website", status: "Won", createdAt: "2026-09-05" },
  { id: "lead-5", name: "Sam Okafor", email: "sam.okafor@email.com", phone: "(925) 555-0164", interestedIn: "Nissan GT-R", source: "Referral", status: "New", createdAt: "2026-09-15" },
  { id: "lead-6", name: "Grace Lin", email: "grace.lin@email.com", phone: "(707) 555-0159", interestedIn: "Honda CR-V", source: "Website", status: "Contacted", createdAt: "2026-09-11" },
  { id: "lead-7", name: "Devon Price", email: "devon.price@email.com", phone: "(831) 555-0141", interestedIn: "Ford Expedition", source: "Phone", status: "New", createdAt: "2026-09-13" },
  { id: "lead-8", name: "Nina Torres", email: "nina.torres@email.com", phone: "(628) 555-0136", interestedIn: "Mercedes-AMG GT R", source: "Website", status: "Negotiating", createdAt: "2026-09-09" },
];

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
  read: boolean;
}

export const seedMessages: ContactMessage[] = [
  { id: "msg-1", name: "Alicia Roman", email: "alicia.roman@email.com", subject: "Question about extended warranty", message: "Hi, I'm interested in the Porsche Panamera 4S you have listed. Does it come with an extended warranty option, and if so, how much does it add to the price?", receivedAt: "2026-09-15T09:20:00", read: false },
  { id: "msg-2", name: "Tom Baird", email: "tom.baird@email.com", subject: "Trade-in for my 2019 Audi", message: "I'd like to trade in my 2019 Audi A6 toward one of your SUVs. Can someone give me a rough estimate before I bring it in?", receivedAt: "2026-09-14T15:42:00", read: false },
  { id: "msg-3", name: "Keisha Brown", email: "keisha.brown@email.com", subject: "Test drive availability", message: "Is the Tesla Roadster available for a test drive this weekend? Saturday afternoon would work best for me.", receivedAt: "2026-09-13T11:05:00", read: true },
  { id: "msg-4", name: "Victor Huang", email: "victor.huang@email.com", subject: "Financing pre-approval", message: "I used your financing calculator and want to get pre-approved before visiting. What documents do I need to bring?", receivedAt: "2026-09-12T08:30:00", read: false },
  { id: "msg-5", name: "Sophie Marsh", email: "sophie.marsh@email.com", subject: "Vehicle history report", message: "Could you send over the vehicle history report for the Nissan GT-R Premium listed on your site?", receivedAt: "2026-09-10T17:15:00", read: true },
];

export type TeamRole = "Admin" | "Manager" | "Sales";
export type TeamStatus = "Active" | "Invited";

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
}

export const seedUsers: TeamUser[] = [
  { id: "user-1", name: "Alejandro Gonzalez", email: "alejandro@drivetime.com", role: "Admin", status: "Active" },
  { id: "user-2", name: "Maria Chen", email: "maria.chen@drivetime.com", role: "Manager", status: "Active" },
  { id: "user-3", name: "Robert Kim", email: "robert.kim@drivetime.com", role: "Sales", status: "Active" },
  { id: "user-4", name: "Jasmine Patel", email: "jasmine.patel@drivetime.com", role: "Sales", status: "Invited" },
];
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/dashboard-data.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/dashboard-data.ts
git commit -m "feat: add dashboard mock data and types"
```

---

### Task 4: `components/dashboard/status-pill.tsx`

**Files:**
- Create: `components/dashboard/status-pill.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `StatusPill({ label: string; tone: "slate" | "blue" | "amber" | "purple" | "green" | "red" })`. Used by Tasks 11, 12, 13, 15.

- [ ] **Step 1: Create the file**

```tsx
type PillTone = "slate" | "blue" | "amber" | "purple" | "green" | "red";

const TONE_CLASSES: Record<PillTone, string> = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
};

export function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/dashboard/status-pill.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/status-pill.tsx
git commit -m "feat: add dashboard status pill component"
```

---

### Task 5: `components/dashboard/stat-card.tsx`

**Files:**
- Create: `components/dashboard/stat-card.tsx`

**Interfaces:**
- Consumes: `fadeUp` from `@/lib/motion` (existing).
- Produces: `StatCard({ icon: LucideIcon; label: string; value: string; trend?: string })`. Used by Task 11.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/motion";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      {trend && <p className="mt-1 text-xs text-emerald-600">{trend}</p>}
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/dashboard/stat-card.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/stat-card.tsx
git commit -m "feat: add dashboard KPI stat card component"
```

---

### Task 6: `components/dashboard/modal.tsx`

**Files:**
- Create: `components/dashboard/modal.tsx`

**Interfaces:**
- Consumes: nothing beyond `framer-motion`/`lucide-react`.
- Produces: `Modal({ open: boolean; onClose: () => void; title: string; children: ReactNode })`. Used by Tasks 12, 14, 15.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/dashboard/modal.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/modal.tsx
git commit -m "feat: add reusable dashboard modal component"
```

---

### Task 7: `components/dashboard/form-field.tsx`

**Files:**
- Create: `components/dashboard/form-field.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `DashboardField({ label: string; children: ReactNode })`, `dashboardInputClass: string`. Used by Tasks 12, 15 (and 11's search bar via `dashboardInputClass`).

- [ ] **Step 1: Create the file**

```tsx
import type { ReactNode } from "react";

export const dashboardInputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100";

export function DashboardField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/dashboard/form-field.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/form-field.tsx
git commit -m "feat: add shared dashboard form field styling"
```

---

### Task 8: `components/dashboard/sidebar.tsx`

**Files:**
- Create: `components/dashboard/sidebar.tsx`

**Interfaces:**
- Consumes: `getCurrentUser`, `logout` from `@/lib/auth` (Task 1).
- Produces: `Sidebar()` — no props. Used by Task 9 (`app/dashboard/layout.tsx`).

- [ ] **Step 1: Create the file**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Target,
  Mail,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Control Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/dashboard/inventory", icon: Car },
  { label: "Leads", href: "/dashboard/leads", icon: Target },
  { label: "Contact Us", href: "/dashboard/contact", icon: Mail },
  { label: "Users", href: "/dashboard/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-900">
          DriveTime
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_LINKS.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.role}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            aria-label="Settings"
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            type="button"
            aria-label="Log out"
            onClick={handleLogout}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/dashboard/sidebar.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/sidebar.tsx
git commit -m "feat: add dashboard sidebar navigation"
```

---

### Task 9: `app/dashboard/layout.tsx` — auth gate + shell

**Files:**
- Create: `app/dashboard/layout.tsx`

**Interfaces:**
- Consumes: `isAuthenticated` from `@/lib/auth` (Task 1), `Sidebar` from `@/components/dashboard/sidebar` (Task 8).
- Produces: default export layout wrapping every `/dashboard/*` route.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
```

Note on the hydration-safety of this pattern: `ready` starts `false` on both the server render and the client's pre-effect render, so the gated content (and `Sidebar`'s `getCurrentUser()` call) never renders during SSR or before the auth check runs — no hydration mismatch.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `app/dashboard/layout.tsx`. (Next route resolution errors about a missing `page.tsx` under `app/dashboard/` are expected until Task 11 — ignore those for this step.)

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat: add dashboard auth-gated layout shell"
```

---

### Task 10: `app/login/page.tsx`

**Files:**
- Create: `app/login/page.tsx`

**Interfaces:**
- Consumes: `login` from `@/lib/auth` (Task 1), `fadeUp`/`staggerContainer` from `@/lib/motion` (existing).
- Produces: the `/login` route. On successful submit, calls `login(email)` then `router.push("/dashboard")`.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { login } from "@/lib/auth";
import { fadeUp, staggerContainer } from "@/lib/motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!password.trim()) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login(email.trim());
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <Image
        src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=2400&q=80"
        alt="A luxury performance sedan in low, dramatic studio light"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-background/80" />

      <div className="relative z-10 hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="glass w-fit rounded-full px-4 py-1.5 text-[0.8rem] font-medium text-foreground"
        >
          Sales Platform
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          className="text-6xl font-semibold tracking-tight text-foreground"
        >
          DriveTime
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[0.85rem] text-muted-2"
        >
          DriveTime v1.0
        </motion.p>
      </div>

      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-1/2 lg:bg-surface/40 lg:backdrop-blur-2xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          <motion.div variants={fadeUp} className="mb-8 text-center lg:text-left">
            <p className="text-[1.2rem] font-semibold tracking-tight text-foreground">
              DriveTime
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-[0.9rem] text-muted">
              Enter your credentials to access the management dashboard.
            </p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[0.8rem] font-medium text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@drivetime.com"
                className="h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[0.9rem] text-foreground placeholder:text-muted-2 transition-colors duration-200 hover:border-foreground/30 focus-visible:border-foreground/50 focus-visible:outline-none"
              />
              {errors.email && <p className="text-[0.78rem] text-red-400">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[0.8rem] font-medium text-muted">Password</label>
                <Link
                  href="#"
                  className="text-[0.78rem] text-muted underline decoration-border-strong underline-offset-4 hover:text-foreground"
                >
                  Forgot my password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[0.9rem] text-foreground placeholder:text-muted-2 transition-colors duration-200 hover:border-foreground/30 focus-visible:border-foreground/50 focus-visible:outline-none"
              />
              {errors.password && <p className="text-[0.78rem] text-red-400">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mt-2 flex h-12 items-center justify-center rounded-xl bg-foreground text-[0.9rem] font-medium text-accent-foreground"
            >
              Sign In
            </motion.button>
          </motion.form>

          <motion.div variants={fadeUp} className="mt-8 text-center">
            <Link
              href="/"
              className="text-[0.85rem] font-medium text-muted underline decoration-border-strong underline-offset-4 hover:text-foreground"
            >
              Volver al sitio
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `app/login/page.tsx`.

- [ ] **Step 3: Verify in the dev server**

Run: `curl -s http://localhost:PORT/login -o /dev/null -w "%{http_code}\n"` (substitute the actual dev server port)
Expected: `200`

Manual check in a browser: open `/login`, submit with both fields empty (expect two inline error messages, no navigation), fill both fields with anything and submit (expect redirect to `/dashboard` — this will show the empty gate `<div>` from Task 9 until Task 11 exists, since `app/dashboard/page.tsx` doesn't exist yet; that's expected at this point in the plan).

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add split-screen admin login page"
```

---

### Task 11: `app/dashboard/page.tsx` — Control Panel

**Files:**
- Create: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `useLocalStorage` (Task 2), `seedInventory`/`seedLeads`/`seedMessages`/`InventoryStatus` (Task 3), `StatCard` (Task 5), `StatusPill` (Task 4), `fadeUp`/`staggerContainer` from `@/lib/motion`.
- Produces: the `/dashboard` index route.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Car, Target, DollarSign, Mail } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPill } from "@/components/dashboard/status-pill";
import { useLocalStorage } from "@/lib/use-local-storage";
import { seedInventory, seedLeads, seedMessages, type InventoryStatus } from "@/lib/dashboard-data";
import { fadeUp, staggerContainer } from "@/lib/motion";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const INVENTORY_TONE: Record<InventoryStatus, "green" | "amber" | "slate"> = {
  Available: "green",
  Reserved: "amber",
  Sold: "slate",
};

export default function ControlPanelPage() {
  const [inventory] = useLocalStorage("dt_inventory", seedInventory);
  const [leads] = useLocalStorage("dt_leads", seedLeads);
  const [messages] = useLocalStorage("dt_messages", seedMessages);

  const activeLeads = leads.filter((lead) => lead.status !== "Won").length;
  const monthlyRevenue = inventory
    .filter((item) => item.status === "Sold")
    .reduce((sum, item) => sum + item.price, 0);
  const pendingInquiries = messages.filter((message) => !message.read).length;

  const activity = [
    ...leads.map((lead) => ({
      id: `lead-${lead.id}`,
      title: `${lead.name} — new lead`,
      subtitle: `Interested in ${lead.interestedIn}`,
      timestamp: lead.createdAt,
    })),
    ...messages.map((message) => ({
      id: `msg-${message.id}`,
      title: `${message.name} sent a message`,
      subtitle: message.subject,
      timestamp: message.receivedAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const recentVehicles = inventory.slice(0, 4);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Control Panel</h1>
        <p className="mt-1 text-sm text-slate-500">A snapshot of inventory, leads, and inbound activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Car} label="Total Inventory" value={String(inventory.length)} />
        <StatCard icon={Target} label="Active Leads" value={String(activeLeads)} />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={currency.format(monthlyRevenue)} />
        <StatCard icon={Mail} label="Pending Inquiries" value={String(pendingInquiries)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Recent Activity</h2>
          <ul className="flex flex-col divide-y divide-slate-100">
            {activity.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-slate-400">{item.timestamp}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Recently Added Vehicles</h2>
          <ul className="flex flex-col gap-3">
            {recentVehicles.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <Image src={item.image} alt={`${item.make} ${item.model}`} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.make} {item.model}</p>
                  <p className="text-xs text-slate-500">{currency.format(item.price)}</p>
                </div>
                <StatusPill label={item.status} tone={INVENTORY_TONE[item.status]} />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify in the dev server**

Manual check: log in at `/login`, confirm you land on `/dashboard` and see 4 KPI cards, a Recent Activity list, and a Recently Added Vehicles list with images and status pills. Reload the page — you should stay on `/dashboard` (not bounce to `/login`), confirming the session flag persisted.

Run: `curl -s http://localhost:PORT/dashboard -o /dev/null -w "%{http_code}\n"`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: add dashboard control panel page"
```

---

### Task 12: `app/dashboard/inventory/page.tsx`

**Files:**
- Create: `app/dashboard/inventory/page.tsx`

**Interfaces:**
- Consumes: `useLocalStorage` (Task 2), `seedInventory`/`InventoryItem`/`InventoryStatus` (Task 3), `Modal` (Task 6), `StatusPill` (Task 4), `DashboardField`/`dashboardInputClass` (Task 7).
- Produces: the `/dashboard/inventory` route.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Modal } from "@/components/dashboard/modal";
import { StatusPill } from "@/components/dashboard/status-pill";
import { DashboardField, dashboardInputClass } from "@/components/dashboard/form-field";
import { useLocalStorage } from "@/lib/use-local-storage";
import { seedInventory, type InventoryItem, type InventoryStatus } from "@/lib/dashboard-data";
import { fadeUp, staggerContainer } from "@/lib/motion";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const STATUS_OPTIONS: InventoryStatus[] = ["Available", "Reserved", "Sold"];

const STATUS_TONE: Record<InventoryStatus, "green" | "amber" | "slate"> = {
  Available: "green",
  Reserved: "amber",
  Sold: "slate",
};

type DraftVehicle = {
  make: string;
  model: string;
  trim: string;
  year: string;
  price: string;
  mileage: string;
  status: InventoryStatus;
  image: string;
};

const EMPTY_DRAFT: DraftVehicle = {
  make: "",
  model: "",
  trim: "",
  year: String(new Date().getFullYear()),
  price: "",
  mileage: "",
  status: "Available",
  image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
};

function toDraft(item: InventoryItem): DraftVehicle {
  return {
    make: item.make,
    model: item.model,
    trim: item.trim,
    year: String(item.year),
    price: String(item.price),
    mileage: String(item.mileage),
    status: item.status,
    image: item.image,
  };
}

export default function InventoryPage() {
  const [inventory, setInventory] = useLocalStorage("dt_inventory", seedInventory);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftVehicle>(EMPTY_DRAFT);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = `${item.make} ${item.model} ${item.trim}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingId(item.id);
    setDraft(toDraft(item));
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!draft.make.trim() || !draft.model.trim() || !draft.price.trim()) return;

    if (editingId) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                make: draft.make.trim(),
                model: draft.model.trim(),
                trim: draft.trim.trim(),
                year: Number(draft.year) || item.year,
                price: Number(draft.price) || item.price,
                mileage: Number(draft.mileage) || item.mileage,
                status: draft.status,
                image: draft.image.trim() || item.image,
              }
            : item,
        ),
      );
    } else {
      const newItem: InventoryItem = {
        id: `vehicle-${Date.now()}`,
        make: draft.make.trim(),
        model: draft.model.trim(),
        trim: draft.trim.trim() || "Base",
        year: Number(draft.year) || new Date().getFullYear(),
        price: Number(draft.price) || 0,
        mileage: Number(draft.mileage) || 0,
        transmission: "Automatic",
        fuelType: "Gasoline",
        bodyType: "Sedan",
        color: "Jet Black",
        colorHex: "#0a0a0b",
        status: draft.status,
        image: draft.image.trim() || EMPTY_DRAFT.image,
      };
      setInventory((prev) => [newItem, ...prev]);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setInventory((prev) => prev.filter((item) => item.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">{inventory.length} vehicles on the lot.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search make, model, or trim"
            className={`${dashboardInputClass} pl-10`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as InventoryStatus | "All")}
          className={`${dashboardInputClass} sm:w-48`}
        >
          <option value="All">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </motion.div>

      <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3">Year</th>
              <th className="px-5 py-3">Mileage</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image src={item.image} alt={`${item.make} ${item.model}`} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.make} {item.model}</p>
                      <p className="text-xs text-slate-500">{item.trim}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{item.year}</td>
                <td className="px-5 py-3 text-slate-600">{item.mileage.toLocaleString()} km</td>
                <td className="px-5 py-3 text-slate-600">{currency.format(item.price)}</td>
                <td className="px-5 py-3">
                  <StatusPill label={item.status} tone={STATUS_TONE[item.status]} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      aria-label="Edit vehicle"
                      onClick={() => openEditModal(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete vehicle"
                      onClick={() => handleDelete(item.id)}
                      className={`flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                        confirmDeleteId === item.id
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "text-slate-500 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      {confirmDeleteId === item.id ? "Confirm?" : <Trash2 size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Vehicle" : "Add Vehicle"}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <DashboardField label="Make">
              <input value={draft.make} onChange={(e) => setDraft((d) => ({ ...d, make: e.target.value }))} className={dashboardInputClass} />
            </DashboardField>
            <DashboardField label="Model">
              <input value={draft.model} onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))} className={dashboardInputClass} />
            </DashboardField>
          </div>
          <DashboardField label="Trim">
            <input value={draft.trim} onChange={(e) => setDraft((d) => ({ ...d, trim: e.target.value }))} className={dashboardInputClass} />
          </DashboardField>
          <div className="grid grid-cols-3 gap-4">
            <DashboardField label="Year">
              <input type="number" value={draft.year} onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))} className={dashboardInputClass} />
            </DashboardField>
            <DashboardField label="Price">
              <input type="number" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} className={dashboardInputClass} />
            </DashboardField>
            <DashboardField label="Mileage">
              <input type="number" value={draft.mileage} onChange={(e) => setDraft((d) => ({ ...d, mileage: e.target.value }))} className={dashboardInputClass} />
            </DashboardField>
          </div>
          <DashboardField label="Status">
            <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as InventoryStatus }))} className={dashboardInputClass}>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </DashboardField>
          <DashboardField label="Image URL">
            <input value={draft.image} onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))} className={dashboardInputClass} />
          </DashboardField>
          <button
            type="button"
            onClick={handleSave}
            className="mt-2 flex h-11 items-center justify-center rounded-xl bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            {editingId ? "Save Changes" : "Add Vehicle"}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify in the dev server**

Manual check at `/dashboard/inventory`:
- Search filters the table by make/model/trim; status dropdown filters by status.
- "Add Vehicle" opens the modal; leaving Make/Model/Price empty and clicking "Add Vehicle" does nothing (required-field guard); filling them in adds a new row at the top of the table and closes the modal.
- Clicking the pencil icon on a row opens the modal pre-filled; changing a field and clicking "Save Changes" updates that row.
- Clicking the trash icon once turns it into a "Confirm?" button; clicking again removes the row.
- Reload the page — all changes (added/edited/deleted rows) are still there.

Run: `curl -s http://localhost:PORT/dashboard/inventory -o /dev/null -w "%{http_code}\n"`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/inventory/page.tsx
git commit -m "feat: add dashboard inventory management page"
```

---

### Task 13: `app/dashboard/leads/page.tsx`

**Files:**
- Create: `app/dashboard/leads/page.tsx`

**Interfaces:**
- Consumes: `useLocalStorage` (Task 2), `seedLeads`/`Lead`/`LeadStatus` (Task 3), `StatusPill` (Task 4).
- Produces: the `/dashboard/leads` route.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { StatusPill } from "@/components/dashboard/status-pill";
import { useLocalStorage } from "@/lib/use-local-storage";
import { seedLeads, type LeadStatus } from "@/lib/dashboard-data";
import { fadeUp, staggerContainer } from "@/lib/motion";

const STATUS_FILTERS: Array<LeadStatus | "All"> = ["All", "New", "Contacted", "Negotiating", "Won"];
const STATUS_OPTIONS: LeadStatus[] = ["New", "Contacted", "Negotiating", "Won"];

const STATUS_TONE: Record<LeadStatus, "blue" | "amber" | "purple" | "green"> = {
  New: "blue",
  Contacted: "amber",
  Negotiating: "purple",
  Won: "green",
};

export default function LeadsPage() {
  const [leads, setLeads] = useLocalStorage("dt_leads", seedLeads);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const base: Record<LeadStatus | "All", number> = {
      All: leads.length,
      New: 0,
      Contacted: 0,
      Negotiating: 0,
      Won: 0,
    };
    leads.forEach((lead) => {
      base[lead.status] += 1;
    });
    return base;
  }, [leads]);

  const filtered = statusFilter === "All" ? leads : leads.filter((lead) => lead.status === statusFilter);

  const updateStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Leads</h1>
        <p className="mt-1 text-sm text-slate-500">{leads.length} inquiries in the pipeline.</p>
      </div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {status} <span className="ml-1 text-xs opacity-70">{counts[status]}</span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Interested In</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.email} · {lead.phone}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{lead.interestedIn}</td>
                <td className="px-5 py-3 text-slate-600">{lead.source}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <StatusPill label={lead.status} tone={STATUS_TONE[lead.status]} />
                    <select
                      value={lead.status}
                      onChange={(event) => updateStatus(lead.id, event.target.value as LeadStatus)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus-visible:outline-none"
                      aria-label={`Change status for ${lead.name}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500">{lead.createdAt}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    aria-label="Delete lead"
                    onClick={() => handleDelete(lead.id)}
                    className={`inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                      confirmDeleteId === lead.id
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-slate-500 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    {confirmDeleteId === lead.id ? "Confirm?" : <Trash2 size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify in the dev server**

Manual check at `/dashboard/leads`: status filter pills show correct counts and filter the table; changing a row's status `<select>` updates its pill immediately; delete follows the same confirm-then-remove pattern as Inventory; reload persists all changes.

Run: `curl -s http://localhost:PORT/dashboard/leads -o /dev/null -w "%{http_code}\n"`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/leads/page.tsx
git commit -m "feat: add dashboard leads pipeline page"
```

---

### Task 14: `app/dashboard/contact/page.tsx`

**Files:**
- Create: `app/dashboard/contact/page.tsx`

**Interfaces:**
- Consumes: `useLocalStorage` (Task 2), `seedMessages`/`ContactMessage` (Task 3), `Modal` (Task 6).
- Produces: the `/dashboard/contact` route.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/dashboard/modal";
import { useLocalStorage } from "@/lib/use-local-storage";
import { seedMessages, type ContactMessage } from "@/lib/dashboard-data";
import { fadeUp, staggerContainer } from "@/lib/motion";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ContactPage() {
  const [messages, setMessages] = useLocalStorage("dt_messages", seedMessages);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const active = messages.find((message) => message.id === activeId) ?? null;

  const openMessage = (message: ContactMessage) => {
    setActiveId(message.id);
    if (!message.read) {
      setMessages((prev) => prev.map((item) => (item.id === message.id ? { ...item, read: true } : item)));
    }
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setMessages((prev) => prev.filter((item) => item.id !== id));
    setConfirmDeleteId(null);
    setActiveId(null);
  };

  const unreadCount = messages.filter((message) => !message.read).length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Contact Us</h1>
        <p className="mt-1 text-sm text-slate-500">{unreadCount} unread of {messages.length} messages.</p>
      </div>

      <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {messages.map((message) => (
            <li key={message.id}>
              <button
                type="button"
                onClick={() => openMessage(message)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${message.read ? "bg-transparent" : "bg-indigo-600"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`truncate text-sm ${message.read ? "font-normal text-slate-700" : "font-semibold text-slate-900"}`}>
                      {message.name}
                    </p>
                    <span className="flex-shrink-0 text-xs text-slate-400">{formatTimestamp(message.receivedAt)}</span>
                  </div>
                  <p className="truncate text-sm text-slate-600">{message.subject}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </motion.div>

      <Modal open={active !== null} onClose={() => setActiveId(null)} title={active?.subject ?? ""}>
        {active && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">{active.name}</p>
              <p className="text-xs text-slate-500">{active.email} · {formatTimestamp(active.receivedAt)}</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{active.message}</p>
            <button
              type="button"
              onClick={() => handleDelete(active.id)}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors ${
                confirmDeleteId === active.id
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <Trash2 size={15} />
              {confirmDeleteId === active.id ? "Confirm delete" : "Delete message"}
            </button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify in the dev server**

Manual check at `/dashboard/contact`: unread messages show a bold name + indigo dot; clicking one opens the modal with the full message, marks it read (dot disappears, name un-bolds after closing/reopening the list); "Delete message" follows the confirm-then-remove pattern and closes the modal. Reload persists read/deleted state.

Run: `curl -s http://localhost:PORT/dashboard/contact -o /dev/null -w "%{http_code}\n"`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/contact/page.tsx
git commit -m "feat: add dashboard contact inbox page"
```

---

### Task 15: `app/dashboard/users/page.tsx`

**Files:**
- Create: `app/dashboard/users/page.tsx`

**Interfaces:**
- Consumes: `useLocalStorage` (Task 2), `seedUsers`/`TeamRole`/`TeamUser` (Task 3), `Modal` (Task 6), `StatusPill` (Task 4), `DashboardField`/`dashboardInputClass` (Task 7).
- Produces: the `/dashboard/users` route.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/dashboard/modal";
import { StatusPill } from "@/components/dashboard/status-pill";
import { DashboardField, dashboardInputClass } from "@/components/dashboard/form-field";
import { useLocalStorage } from "@/lib/use-local-storage";
import { seedUsers, type TeamRole, type TeamUser } from "@/lib/dashboard-data";
import { fadeUp, staggerContainer } from "@/lib/motion";

const ROLES: TeamRole[] = ["Admin", "Manager", "Sales"];

export default function UsersPage() {
  const [users, setUsers] = useLocalStorage("dt_users", seedUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", role: "Sales" as TeamRole });

  const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const updateRole = (id: string, role: TeamRole) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)));
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setConfirmDeleteId(null);
  };

  const handleInvite = () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    const newUser: TeamUser = {
      id: `user-${Date.now()}`,
      name: draft.name.trim(),
      email: draft.email.trim(),
      role: draft.role,
      status: "Invited",
    };
    setUsers((prev) => [...prev, newUser]);
    setDraft({ name: "", email: "", role: "Sales" });
    setModalOpen(false);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">{users.length} team members.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Invite User
        </button>
      </div>

      <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {initials(user.name)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={user.role}
                    onChange={(event) => updateRole(user.id, event.target.value as TeamRole)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus-visible:outline-none"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <StatusPill label={user.status} tone={user.status === "Active" ? "green" : "slate"} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    aria-label="Remove user"
                    onClick={() => handleDelete(user.id)}
                    className={`inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                      confirmDeleteId === user.id
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-slate-500 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    {confirmDeleteId === user.id ? "Confirm?" : <Trash2 size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite User">
        <div className="flex flex-col gap-4">
          <DashboardField label="Full Name">
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={dashboardInputClass} />
          </DashboardField>
          <DashboardField label="Email">
            <input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} className={dashboardInputClass} />
          </DashboardField>
          <DashboardField label="Role">
            <select value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as TeamRole }))} className={dashboardInputClass}>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </DashboardField>
          <button
            type="button"
            onClick={handleInvite}
            className="mt-2 flex h-11 items-center justify-center rounded-xl bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Send Invite
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify in the dev server**

Manual check at `/dashboard/users`: role `<select>` per row updates immediately; "Invite User" with empty fields does nothing, filled in appends a new row with an "Invited" status pill; delete follows the confirm-then-remove pattern. Reload persists all changes. Also re-verify the full flow end-to-end: log out from the sidebar (redirects to `/login`), then try navigating directly to `/dashboard` — it should bounce back to `/login`.

Run: `curl -s http://localhost:PORT/dashboard/users -o /dev/null -w "%{http_code}\n"`
Expected: `200`

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/users/page.tsx
git commit -m "feat: add dashboard users team management page"
```

---

## Final check (after Task 15)

- [ ] Run `npx tsc --noEmit` once more against the whole project — expect zero errors.
- [ ] Run through the manual checklist end-to-end once more: `/` → footer "Login" link → `/login` → sign in → `/dashboard` → visit all 5 nav items → make one edit on each page → reload → confirm all 5 edits persisted → log out → confirm `/dashboard` redirects to `/login`.
