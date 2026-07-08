# MATUR.ai — Design System Reference

> **Purpose:** This file captures every design decision already applied across the Dashboard, Sidebar, Assessment Pages, Modals, and Cards. Use it as the single source of truth when styling **any other page** in the app. Every pattern described below is live in the codebase today.

---

## 1. Color Palette

The entire app uses **Google's brand palette** expressed in oklch for perceptual uniformity. Every semantic color has a light-mode and dark-mode value defined in `globals.css`.

### 1.1 Brand Colors (Primary Palette)

| Role | Light Mode | Dark Mode | CSS Variable |
|---|---|---|---|
| **Primary (Blue)** | `oklch(56% 0.21 254)` | `oklch(73% 0.14 250)` | `--primary` |
| **Primary Dark** | `oklch(42% 0.18 254)` | `oklch(56% 0.21 254)` | `--primary-dark` |
| **Primary Light** | `oklch(73% 0.12 254)` | `oklch(78% 0.12 250)` | `--primary-light` |
| **Destructive (Red)** | `oklch(57% 0.23 27)` | `oklch(65% 0.18 20)` | `--destructive` |
| **Warning (Yellow)** | `oklch(79% 0.21 82)` | `oklch(86% 0.18 80)` | `--warning` |
| **Success (Green)** | `oklch(64% 0.19 145)` | `oklch(82% 0.18 140)` | `--success` |
| **Purple (Accent)** | `oklch(52% 0.2 300)` | `oklch(69% 0.18 300)` | `--chart-5` |

### 1.2 Sidebar Section Colors

Each sidebar section has its own accent color used for icons, active borders, and hover tints. These are defined as CSS custom properties and referenced via `color-mix()` for opacity control.

| Section | Color | Light | Dark | CSS Variable |
|---|---|---|---|---|
| **Free (AIMA)** | 🟢 Green | `oklch(60% 0.18 142)` | `oklch(72% 0.18 140)` | `--section-free` |
| **Premium (CRC/Vuln/Inv/Fair)** | 🟡 Yellow | `oklch(79% 0.21 82)` | `oklch(86% 0.18 80)` | `--section-premium` |
| **Settings** | 🔵 Blue | Same as `--primary` | Same as `--primary` | `--section-settings` |
| **Admin** | 🟣 Purple | `oklch(50% 0.25 295)` | `oklch(58% 0.25 295)` | `--section-admin` |

### 1.3 Surface & Neutral Colors

| Surface | Light | Dark | CSS Variable |
|---|---|---|---|
| Background | `oklch(98% 0.003 240)` | `oklch(12% 0.015 260)` | `--background` |
| Card | `oklch(100% 0 0)` | `oklch(20% 0.012 255)` | `--card` |
| Muted | `oklch(95% 0.005 240)` | `oklch(21% 0.012 255)` | `--muted` |
| Muted Text | `oklch(55% 0.01 240)` | `oklch(69% 0.015 250)` | `--muted-foreground` |
| Border | `oklch(91% 0.005 240)` | `oklch(28% 0.015 255)` | `--border` |
| Sidebar BG | `oklch(100% 0 0)` | `oklch(18% 0.015 260)` | `--sidebar` |
| Secondary | `oklch(96% 0.02 250)` | `oklch(24% 0.02 255)` | `--secondary` |
| Accent | `oklch(94% 0.02 250)` | `oklch(22% 0.03 260)` | `--accent` |

### 1.4 Difficulty Indicator Colors

| Level | Light | Dark | CSS Variable |
|---|---|---|---|
| Easy | `oklch(64% 0.19 145)` | `oklch(82% 0.18 140)` | `--difficulty-easy` |
| Medium | `oklch(79% 0.21 82)` | `oklch(86% 0.18 80)` | `--difficulty-medium` |
| Hard | `oklch(57% 0.23 27)` | `oklch(65% 0.18 20)` | `--difficulty-hard` |
| Completed | `oklch(60% 0.2 250)` | `oklch(73% 0.14 250)` | `--difficulty-completed` |

---

## 2. Typography

**Font:** Satoshi (imported from Fontshare) with system fallbacks.

| Element | Classes | Usage |
|---|---|---|
| Page heading | `text-2xl font-bold text-foreground` | Section titles ("Your Projects") |
| Card title | `text-lg font-bold text-foreground` | Project card names |
| Card description | `text-sm text-muted-foreground/90 line-clamp-3` | Project descriptions |
| Metadata badge text | `text-[10px] font-semibold` | AI System Type, Created date |
| Button label | `text-xs font-bold` | Primary CTA buttons |
| Sidebar parent label | `text-sm font-medium` (inactive) / `font-semibold` (active) | Section names |
| Sidebar child label | `text-[13px]` (inactive `text-foreground/80`) / `font-semibold` (active) | Sub-items (AIMA, CRC, etc.) |
| Sidebar deep child | `text-[12px]` (inactive `text-foreground/70`) / `font-medium` (active) | Deepest items (Dashboard, Controls) |
| Sidebar control items | `text-[11px]` (inactive `text-muted-foreground`) / `font-medium` (active) | CRC control IDs |
| Modal section header | `text-xs font-bold uppercase tracking-wider text-muted-foreground` | "Sort By", "Filter By Status" |
| Assessment question | `text-xl font-semibold text-foreground leading-relaxed` | Question text |
| Assessment page header title | `text-sm font-bold text-foreground truncate` | Practice name in sticky header |
| Breadcrumb current page | `font-semibold text-primary` | Active breadcrumb item |

---

## 3. Sidebar — Structure & Behavior

The sidebar uses a **unified navigation model** with collapsible sections, drag-to-resize, and CSS class-based color coding.

### 3.1 Sidebar Header

The sidebar header uses **logo images** (not text):

```tsx
<SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
  <div className="flex items-center justify-between w-full gap-2 group-data-[collapsible=icon]:justify-center">
    {state === "expanded" && (
      <>
        <img src="/matur-logo-slogan.png" alt="MATUR.ai" className="h-7 dark:hidden" />
        <img src="/matur-dark.png" alt="MATUR.ai" className="h-7 hidden dark:block" />
      </>
    )}
    <SidebarTrigger className="size-7 text-muted-foreground hover:text-foreground" />
  </div>
</SidebarHeader>
```

Key details:
- Light mode: `/matur-logo-slogan.png`, Dark mode: `/matur-dark.png`
- Height: `h-7` for both logos
- `SidebarTrigger` always visible (acts as collapse/expand toggle)
- When collapsed, only `SidebarTrigger` is shown, centered via `mx-auto`

### 3.2 Sidebar Navigation Hierarchy

The sidebar has **four main top-level sections** plus an Admin section:

```text
Dashboard                      (sidebar-btn-dashboard, always blue)
├── Free                       (sidebar-btn-free, green, collapsible)
│   └── AIMA Assessment        (sidebar-btn-free, nested collapsible)
│       └── [Domain Tree]      (domains → practices → questions)
├── Premium Features           (sidebar-btn-premium, yellow, collapsible)
│   ├── AI Vulnerability Assessment
│   ├── CRC                    (nested collapsible with categories/controls)
│   │   ├── Readiness Dashboard
│   │   ├── AI Risk Register
│   │   └── [CRC Categories → Controls]
│   ├── AI Component Inventory
│   └── Bias & Fairness Testing  (nested collapsible)
│       ├── Manual Prompt Testing
│       ├── API Automated Testing
│       └── Dataset Testing
├── Project Settings           (sidebar-btn-settings, blue, collapsible)
│   ├── Project Information
│   └── Teams
─── Admin (only for admin role) (sidebar-btn-admin, purple)
    ├── Manage AIMA Data
    ├── CRC Controls
    └── Chatbot Settings
```

### 3.3 State Definitions

| State | Text Opacity | Icon Opacity | Background | Border |
|---|---|---|---|---|
| **Inactive (default)** | 75% of section color | 70% of section color | `transparent` | None |
| **Hover** | 100% of section color | 100% of section color | 8% tint of section color | None |
| **Active** | 100% of section color | 100% of section color | 12% tint of section color | 4px left border in section color |

### 3.4 CSS Class → Section Mapping

```text
sidebar-btn-dashboard  →  --primary (Blue)
sidebar-btn-free       →  --section-free (Green)
sidebar-btn-premium    →  --section-premium (Yellow)
sidebar-btn-settings   →  --section-settings (Blue)
sidebar-btn-admin      →  --section-admin (Purple)
```

### 3.5 Active State Pattern (applied via `[data-active="true"]`)

```css
.sidebar-btn-{section}[data-active="true"] {
  border-left: 4px solid var(--section-{color}) !important;
  background-color: color-mix(in oklch, var(--section-{color}) 12%, transparent) !important;
  color: var(--section-{color}) !important;
  font-weight: 700 !important;
  padding-left: 0.5rem !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}
```

**Dashboard active state** differs slightly — uses `8%` tint instead of `12%` and uses `--primary` directly.

### 3.6 Icon Color Rules

| Context | Approach | Example |
|---|---|---|
| Parent section icon (active) | CSS `[data-active] svg` rule handles it | Automatic via `sidebar-btn-*` class |
| Child sub-menu icons (always) | **Inline style** (Tailwind class gets overridden by parent) | `style={{ color: "var(--section-premium)" }}` |
| Dashboard icon (always blue) | Hardcoded `text-primary` class | Never grays out |
| Lock icons (non-premium items) | `text-muted-foreground/50` | Shows `IconLock` after label |

### 3.7 Collapsed (Icon-Only) Mode

When sidebar is `collapsible="icon"`:
- Icons scale up: `group-data-[collapsible=icon]:[&>svg]:!size-[22px]`
- Content hides, only icon centered: `group-data-[collapsible=icon]:justify-center`
- Active border removed: `group-data-[collapsible=icon]:border-0`
- Tooltips appear on hover via `tooltip={item.label}`

### 3.8 Collapsible Sub-Sections (Animated)

All collapsible sections expand/collapse with Framer Motion:

```tsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.2 }}
/>
```

Chevron rotates 90° when expanded: `cn("rotate-90")`.

### 3.9 Drag-to-Resize Sidebar

The sidebar supports **drag resizing** via a custom resize handle:
- Handle position: absolute right edge (`-right-2`), full height
- Width: `w-4` hit-target, with a visible `w-[1px]` line (grows to `w-[3px]` on hover/drag)
- Drag line: `bg-border/80` → `bg-primary/60` on hover → `bg-primary` when active
- Min/Max enforced via `MIN_WIDTH` / `MAX_WIDTH_RATIO` from `sidebarStore`
- CSS variable `--sidebar-width` set inline on `<Sidebar>`
- During resize, all transitions disabled via `.sidebar-resizing, .sidebar-resizing * { transition: none !important; }`
- Keyboard support: `ArrowLeft/Right` for step adjustments (10px, or 40px with Shift)

### 3.10 Sidebar Footer — User Profile Card

```text
┌────────────────────────────────────────┐
│ ─── Separator ────                     │
│ ┌──────────────────────────┐ ┌──────┐ │
│ │ [Avatar] Username    [▼] │ │ ⚙ ️  │ │
│ └──────────────────────────┘ └──────┘ │
└────────────────────────────────────────┘
```

- **Expanded state**: User card with `Avatar` (initials, `bg-primary` rounded-lg), name, and `IconSelector` chevron. Beside it, a standalone settings icon button links to `/settings`.
- **Collapsed state**: Just the avatar circle (rounded-full), centered
- **Dropdown menu** on click with: Notifications sub-menu (pending invitations), Theme toggle (inline switch), Profile Settings link, Sign Out
- Card styling: `border-border/40 bg-slate-50 dark:bg-sidebar-accent/30`
- Settings button: `border-border/40 bg-slate-50 dark:bg-sidebar-accent/30`
- Notification badge: `bg-primary text-primary-foreground text-[10px] rounded-full`

### 3.11 Project Selection Modal

When a user clicks a navigation item that requires a project context but isn't inside a project, a `ProjectSelectionModal` opens to let them choose a project first. This is triggered by the `handleProjectAction()` function.

### 3.12 Auto-Expansion Behavior

- Premium users: AIMA collapsed by default, Premium Features + CRC expanded
- Free users: AIMA expanded by default, Premium Features collapsed
- Route-based auto-expansion: sidebar sections expand when their routes are active
- Domain expansion synced to `currentDomainId`
- Active question auto-scrolls into view after 250ms

---

## 4. Assessment Page (Assess)

### 4.1 Page Layout

The assess page (`/assess/[projectId]`) uses a layout with:
- **No separate top navigation bar** — all navigation lives in the unified left sidebar
- **Breadcrumb** rendered at the layout level for sub-pages (CRC, Inventory, etc.)
- **Main assessment page** embeds its own sticky header + breadcrumb inside `QuestionView`

Layout breadcrumb is **hidden** for:
- Main assessment page (`/assess/[projectId]`)
- Individual practice pages (URL pattern: `/assess/[projectId]/[domain]/[practice]`)

### 4.2 Assessment Sticky Page Header

The assess page has a **sticky header** at the top of the content area:

```text
┌─────────────────────────────────────────────────────────────────┐
│ bg-background border-b border-border px-8 py-3 sticky top-0    │
│ z-20 shadow-xs                                                  │
│                                                                 │
│ 🏠 > ProjectName > AI Maturity Assessment (AIMA)    Saving...  │
│                                                                 │
│ [← Back] | 🔗 Practice Name | Domain Name                     │
│           [Q1 of 12]           [View Only] [View Report] [Submit]│
└─────────────────────────────────────────────────────────────────┘
```

**Top row**: Breadcrumb (Home → Project → AIMA) + Saving indicator (animated pulse)
**Bottom row**: Back button + Practice title + Domain name + Question badge + Action buttons

Key styles:
- Back button: `bg-white dark:bg-zinc-900 border border-border/60 text-xs shadow-2xs rounded-lg`
- Separator: `h-5 w-px bg-border`
- Domain icon: `w-4 h-4 text-primary` (dynamically selected based on domain title)
- Question badge: `text-[9px] bg-primary/10 text-primary border-primary/20 rounded-full`
- View Only badge: `bg-muted border-border text-muted-foreground text-[10px] rounded-full`
- View Report button: `border-success/30 text-success hover:bg-success/10 rounded-lg`
- Submit button: `bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-xs`

### 4.3 Question Content Area

```text
┌──────────────────────────────────────────────────────────────┐
│ px-8 py-6, max-w-4xl mx-auto                                │
│                                                              │
│ ─── Progress Bar ──────────────────────────────────────────  │
│ Question 1 of 12                                  75% Done   │
│ [████████████████████████░░░░░░░░]                           │
│                                                              │
│ ┌── Question Card (motion.div with slide-in) ────────────┐  │
│ │ bg-card rounded-2xl shadow-lg border-border/80 p-8      │  │
│ │                                                          │  │
│ │ [Level 1] [Stream A]    ← colored badges                │  │
│ │                                                          │  │
│ │ Question text (text-xl font-semibold)                    │  │
│ │                                                          │  │
│ │ ┌── Description Guide ────────────────────────────────┐ │  │
│ │ │ border-l-4 border-l-primary/60 bg-muted/20 p-5      │ │  │
│ │ │ Formatted HTML with bullets, bold markers, etc.      │ │  │
│ │ └─────────────────────────────────────────────────────┘ │  │
│ │                                                          │  │
│ │ ─── Answer Options ──────────────────────────────────── │  │
│ │ [ ○ No      — Not implemented or not applicable      ]  │  │
│ │ [ ○ Partially — Partially implemented or in progress ]  │  │
│ │ [ ○ Yes     — Fully implemented and operational      ]  │  │
│ │                                                          │  │
│ │ ─── Notes Section ──────────────────────────────────── │  │
│ │ Your Notes  (Auto-saves)                                │  │
│ │ [SecureTextarea]                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [← Previous]                                       [Next →]  │
└──────────────────────────────────────────────────────────────┘
```

### 4.4 Level & Stream Badge Colors

Badges use semantic color classes with explicit light/dark mode handling:

| Badge | Light | Dark |
|---|---|---|
| **Level 1** | `bg-blue-50/50 text-blue-700 border-blue-200/50` | `bg-blue-950/20 text-blue-400 border-blue-800/30` |
| **Level 2** | `bg-purple-50/50 text-purple-700 border-purple-200/50` | `bg-purple-950/20 text-purple-400 border-purple-800/30` |
| **Level 3+** | `bg-amber-50/50 text-amber-700 border-amber-200/50` | `bg-amber-950/20 text-amber-400 border-amber-800/30` |
| **Stream A** | `bg-teal-50/50 text-teal-700 border-teal-200/50` | `bg-teal-950/20 text-teal-400 border-teal-800/30` |
| **Stream B** | `bg-rose-50/50 text-rose-700 border-rose-200/50` | `bg-rose-950/20 text-rose-400 border-rose-800/30` |

### 4.5 Answer Option Styling (Color-Coded Radio Buttons)

Each answer option is a `<label>` with a hidden radio input and a custom circle indicator. Colors depend on value and selection state:

| Answer | Selected Border/BG | Unselected Hover | Radio Selected |
|---|---|---|---|
| **No (0)** | `border-destructive bg-destructive/5` (dark: `/10`) | `hover:border-destructive/40` | `border-destructive bg-destructive` |
| **Partially (1.5)** | `border-warning bg-warning/5` (dark: `/10`) | `hover:border-warning/40` | `border-warning bg-warning` |
| **Yes (3)** | `border-success bg-success/5` (dark: `/10`) | `hover:border-success/40` | `border-success bg-success` |

Selected radio shows a `w-2 h-2 rounded-full bg-white` inner dot with `motion.div scale` animation.

Interactive states: `hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.995]`

### 4.6 Question Card Animation

Questions animate in from the right on navigation:

```tsx
<motion.div
  key={questionKey}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
/>
```

### 4.7 Description Guide Box

The description section uses a distinctive left-border card pattern:

```text
border-l-4 border-l-primary/60 border-y border-r border-border
bg-muted/20 p-5 rounded-xl shadow-2xs
```

Custom CSS overrides for rich HTML content:
- `[&_strong]:text-foreground [&_strong]:font-bold`
- `[&_ul]:mt-3 [&_ul]:space-y-2`
- `[&_li]:pl-5 [&_li:before]:content-['•'] [&_li:before]:text-primary`
- `[&_p]:mb-3 [&_p:last-child]:mb-0`

### 4.8 Navigation Buttons

| Button | Style |
|---|---|
| **Previous** | `border border-border/60 text-foreground/80 bg-card hover:bg-muted/50 shadow-2xs rounded-xl px-6 py-3` |
| **Next** | `bg-primary text-primary-foreground shadow-xs hover:shadow-sm hover:-translate-y-0.5 rounded-xl px-6 py-3` |
| **Submit (final question)** | `bg-success text-white` (or `bg-primary` if viewing completed + no changes) |

### 4.9 Project Notes & Collaboration Section

Below the QuestionView, a collaboration section is rendered:

```tsx
<div className="border border-border/80 p-6 bg-card rounded-2xl shadow-sm mt-6 max-w-4xl mx-auto">
  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4 px-2">
    <IconMessages className="w-4 h-4 text-primary shrink-0" />
    Project Notes & Collaboration
  </h3>
  <CommentsPanel ... />
</div>
```

### 4.10 Assess Layout Breadcrumb

For sub-pages (CRC, Inventory, Fairness, etc.), the layout renders a `<Breadcrumb>` component:

```tsx
<div className="px-8 py-6 max-w-7xl w-full mx-auto">
  <Breadcrumb
    projectName={projectName}
    projectHref={projectBreadcrumbHref}
    items={[{ label: getBreadcrumbLabel(pathname) }]}
  />
  <div className="mt-2 flex-1">{children}</div>
</div>
```

Premium users' project breadcrumb links to `/assess/[projectId]/crc/dashboard`.
Free users' project breadcrumb links to `/assess/[projectId]`.

### 4.11 Breadcrumb Component Pattern

```text
🏠 > ProjectName > Current Page
```

- Home icon: `IconHome w-4 h-4` linking to `/dashboard`
- Project name: `font-medium truncate max-w-[200px]` (link if `projectHref` provided)
- Current page: `font-semibold text-primary` (non-clickable, displayed as `BreadcrumbPage`)
- Separator: shadcn `BreadcrumbSeparator` (default `/`)

---

## 5. Dashboard Project Cards

### 5.1 Card Background Tints

Each card gets a subtle tinted background via CSS classes in `globals.css`. These provide a **4% tint** in light mode and **5–6% tint** in dark mode:

```text
card-google-indigo   →  oklch(56% 0.15 275 / 4%)    [dark: 6%]
card-google-red      →  oklch(57% 0.23 27  / 4%)    [dark: 6%]
card-google-green    →  oklch(64% 0.19 145 / 4%)    [dark: 6%]
card-google-yellow   →  oklch(79% 0.21 82  / 4%)    [dark: 5%]
card-google-purple   →  oklch(52% 0.2  300 / 4%)    [dark: 6%]
```

Cards also get a matching border: `oklch(... / 15%)` in light mode, `oklch(... / 20%)` in dark mode.

Cards cycle through these with `index % 5`.

### 5.2 Theme Configuration Object

Each card also gets a `CARD_THEMES[index % 5]` object with coordinated classes:

| Key | Purpose | Dark Mode Handling |
|---|---|---|
| `border` | Card border tint (e.g., `border-indigo-500/25`) | Opacity-based, works in both modes |
| `shadow` | Hover shadow tint | Opacity-based |
| `btnPrimary` | Filled button style (not currently used on cards) | `dark:text-*` overrides |
| `btnSecondary` | Outline button style for primary CTAs | `dark:text-*` overrides |
| `badge` | Metadata pill background + text | `dark:text-*` overrides |
| `badgeRole` | Role pill (bolder) | `dark:text-*` overrides |

**Critical dark mode rule:** Every `text-*` in the theme MUST have a `dark:text-*` counterpart. Example:

```text
text-warning-foreground dark:text-warning   ← Yellow badge visible in both modes
text-success dark:text-success              ← Green badge visible in both modes
```

### 5.3 Card Hover Animation

Cards lift on hover via Framer Motion:

```tsx
<motion.div whileHover={{ y: -5 }}>
```

### 5.4 Card Layout Structure

```text
┌──────────────────────────────────────────┐
│ CardHeader (pb-3)                        │
│  ┌─ Title row ──────────────── ⋮ menu ─┐│
│  │ 📁 Project Name       [Shared badge] ││
│  └──────────────────────────────────────┘│
│  ┌─ Badges row (flex-nowrap) ───────────┐│
│  │ [🤖 AI Type] [📅 Created: MM/DD]    ││
│  └──────────────────────────────────────┘│
│  Description text (line-clamp-3)         │
├───── border-t border-border/55 ──────────┤
│ CardFooter (pt-3 pb-5, bg-muted/5)      │
│                    [Edit Details] [CTA →]│
└──────────────────────────────────────────┘
```

### 5.5 Metadata Badges (Custom `<span>` Elements)

**Do NOT use shadcn `<Badge>`. The Badge component has hover color-change side effects. Use plain `<span>` tags instead:

```tsx
<span className={`text-[10px] py-1 px-2.5 rounded-full font-semibold
  flex items-center gap-1 ${theme.badge}`}>
  <IconCpu className="w-3.5 h-3.5 shrink-0" />
  <span className="truncate">{project.ai_system_type}</span>
</span>
```

Key rules:
- Container: `flex items-center gap-1.5 flex-nowrap w-full min-w-0`
- AI System Type badge: `shrink min-w-0` (allows truncation)
- Date badge: `shrink-0` (never truncates)

---

## 6. Button Hierarchy

### 6.1 Card Action Buttons

| Button | Variant | Style | When |
|---|---|---|---|
| **View Report** | `outline` | `theme.btnSecondary` + `shadow-xs` | Completed projects |
| **Continue Assessment** | `outline` | `theme.btnSecondary` + `shadow-xs` | In-progress projects |
| **Start Assessment** | `outline` | `theme.btnSecondary` + `shadow-xs` | Not-started projects |
| **Edit Details** | `ghost` | `bg-transparent shadow-none border-0 text-foreground/80` | Completed projects (secondary action) |

### 6.2 Page-Level Buttons

| Button | Style | When |
|---|---|---|
| **Create New Project** | `btn-primary` (filled blue, rounded-full) | Empty state / top bar |
| **Filter & Sort** | `variant="outline"` + `border-border/60 shadow-2xs` | Projects section header |

### 6.3 Assessment Page Buttons

| Button | Style | When |
|---|---|---|
| **Back** | `bg-white dark:bg-zinc-900 border-border/60 text-xs shadow-2xs rounded-lg` | Sticky header |
| **Submit Project** | `bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-xs` | Sticky header (non-completed) |
| **Resubmit Changes** | Same as Submit | Sticky header (completed with changes) |
| **View Report** | `border-success/30 text-success rounded-lg text-xs font-semibold shadow-xs` | Sticky header (completed) |
| **Previous** | `border-border/60 bg-card text-foreground/80 rounded-xl px-6 py-3 font-semibold shadow-2xs` | Bottom nav |
| **Next** | `bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold shadow-xs` | Bottom nav |
| **Submit (last Q)** | `bg-success text-white rounded-xl px-6 py-3 font-semibold shadow-xs` | Bottom nav, last question |

### 6.4 Modal Buttons

| Button | Style | When |
|---|---|---|
| **Apply / Save** | `bg-primary text-primary-foreground font-bold shadow-sm` | Modal footer right |
| **Reset / Cancel** | `variant="ghost" text-muted-foreground` | Modal footer left |
| **Sort/Filter option (selected)** | `bg-primary text-primary-foreground shadow-sm` | Active toggle |
| **Sort/Filter option (unselected)** | `variant="outline" border-border/60` | Inactive toggle |

---

## 7. Modals & Dialogs

### 7.1 Standard Dialog Structure

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <span>Title Text</span>
      </DialogTitle>
      <DialogDescription>
        Subtitle / helper text.
      </DialogDescription>
    </DialogHeader>
    {/* Body */}
    <div className="flex flex-col gap-5 py-4">
      {/* Section with label */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Section Label
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {/* Toggle buttons */}
        </div>
      </div>
    </div>
    {/* Footer */}
    <div className="flex justify-between items-center border-t border-border/20 pt-4 mt-2">
      <Button variant="ghost">Reset</Button>
      <Button>Apply</Button>
    </div>
  </DialogContent>
</Dialog>
```

### 7.2 Missing Answers Dialog

The assessment page has a `MissingAnswersDialog` that warns users about unanswered questions before submission. It lists missing questions and provides a "Go to first missing" action.

### 7.3 Pointer-Events Bugfix

Radix UI Dialog can lock `pointer-events: none` on `<body>`. Every modal state must be included in the cleanup effect:

```tsx
useEffect(() => {
  if (!modal1 && !modal2 && !modal3 /* ... */) {
    const timer = setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 100);
    return () => clearTimeout(timer);
  }
}, [modal1, modal2, modal3 /* ... */]);
```

---

## 8. Animations & Transitions

| Element | Animation | Implementation |
|---|---|---|
| Card entrance | Fade up | `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` |
| Card hover | Lift | `whileHover={{ y: -5 }}` |
| Question slide-in | Fade from right | `initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}` |
| Answer select dot | Scale-in | `initial={{ scale: 0 }} animate={{ scale: 1 }}` |
| Answer hover | Lift + shadow | `hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:scale-[0.995]` |
| Sidebar transitions | All 200ms ease | `transition: all 0.2s ease-in-out` via CSS |
| Sidebar icon color | Color 200ms ease | `transition: color 0.2s ease-in-out` via CSS |
| Collapsible expand | Height + opacity | Framer `AnimatePresence` with `height: 0→auto` |
| Chevron rotation | Rotate 90° | `cn("rotate-90")` with `transition-transform` |
| Section stagger | Delayed entrance | `transition={{ duration: 0.8, delay: 0.2 }}` incrementing |
| Saving indicator | Pulse | `animate-pulse` on saving state |
| Submit spinner | Spin | `w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin` |
| Progress bar width | Smooth transition | `transition-all duration-300` on width |

---

## 9. Spacing & Layout Tokens

### 9.1 Page Container

```tsx
// Dashboard and sub-pages
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">

// Assess layout sub-pages
<div className="px-8 py-6 max-w-7xl w-full mx-auto">

// Assess question content
<div className="flex-1 px-8 py-6">
  <div className="max-w-4xl mx-auto">
```

### 9.2 Grid

```tsx
// Project cards
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

// Modal toggle buttons
<div className="grid grid-cols-2 gap-2">
```

### 9.3 Section Header Pattern

```tsx
<div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
    <Icon className="w-6 h-6 text-primary shrink-0" />
    <span>Section Title</span>
  </h2>
  {/* Action button on right */}
  <Button variant="outline" size="sm" className="...">
    <IconFilter /> Filter & Sort
  </Button>
</div>
```

---

## 10. Empty States

### 10.1 No Projects (First-Time User)

```tsx
<div className="text-center py-12">
  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
    <IconPlus className="w-12 h-12 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
  <p className="text-muted-foreground mb-6">Helper text</p>
  <Button className="btn-primary">Create Your First Project</Button>
</div>
```

### 10.2 No Filter Results

```tsx
<div className="text-center py-12 border border-dashed border-border/60 rounded-xl bg-muted/10">
  <IconFilter className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
  <h3 className="text-sm font-semibold mb-1">No matching projects</h3>
  <p className="text-xs text-muted-foreground mb-4">Explanation text</p>
  <Button variant="outline" size="sm">Clear Filters</Button>
</div>
```

### 10.3 Select a Practice (Assessment Landing)

When a user is on the assessment page but hasn't selected a practice:

```tsx
<div className="flex flex-1 h-full flex-col items-center justify-center p-8 text-center bg-background/50 backdrop-blur-sm">
  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
    <IconBrain className="w-8 h-8 text-primary" />
  </div>
  <h3 className="text-xl font-semibold mb-2 text-foreground">Select a Practice</h3>
  <p className="text-muted-foreground max-w-sm">
    Navigate through the domains and practices in the sidebar to start answering questions.
  </p>
</div>
```

---

## 11. Error States

### 11.1 Project Not Found

```tsx
<div className="bg-card border border-border rounded-2xl p-8 max-w-lg text-center">
  <IconAlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
  <h2 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h2>
  <p className="text-muted-foreground mb-6">Explanation</p>
  <div className="flex gap-3 justify-center">
    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Go to Dashboard</button>
    <button className="px-4 py-2 rounded-lg border border-border text-foreground">Go Back</button>
  </div>
</div>
```

### 11.2 Unable to Load Assessment

Same visual pattern as Project Not Found, with a "Retry" primary action.

---

## 12. Dropdown Menus (Card Context Menu)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="h-8 w-8 p-0">
      <IconDotsVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>
      <IconPencil className="mr-2 h-4 w-4" /> Edit
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      <IconTrash className="mr-2 h-4 w-4" /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 13. Component Utilities

### 13.1 CSS Component Classes (from `globals.css`)

| Class | Purpose | Definition |
|---|---|---|
| `btn` | Base button style | `px-6 py-2.5 rounded-full font-medium inline-flex items-center justify-center` |
| `btn-primary` | Primary CTA | `bg-primary text-primary-foreground hover:shadow-md hover:brightness-95` |
| `btn-secondary` | Secondary action | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `btn-text` | Text-only button | `bg-transparent text-primary hover:bg-primary/8` |
| `btn-outlined` | Outlined button | `bg-transparent border border-border text-foreground hover:bg-muted` |
| `card` | Standard card | `p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md` |
| `card-elevated` | Elevated card | `p-6 rounded-2xl bg-card shadow-md hover:shadow-lg` |
| `gradient-text` | Gradient text | `background: linear-gradient(135deg, var(--primary), var(--primary-dark))` |

### 13.2 Elevation System

| Class | Shadow |
|---|---|
| `elevation-1` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `elevation-2` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `elevation-3` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `elevation-4` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |
| `elevation-5` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` |

### 13.3 Scrollbar Customization

- Width: `8px` both horizontal and vertical
- Track: transparent
- Thumb: `rgba(156, 163, 175, 0.3)` rounded, with `2px` transparent border for content-box clipping
- Thumb hover: `var(--color-primary)` (blue)
- Dark mode thumb: `rgba(156, 163, 175, 0.25)`
- Scrollbar buttons: `display: none`

---

## 14. Checklist — Applying to a New Page

When building any new page, verify:

- [ ] Uses `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` container (or `px-8 py-6` for assess sub-pages)
- [ ] Section headers use icon + title + optional right-side action button
- [ ] Cards use `CARD_THEMES[index % 5]` with matching `card-google-*` background class
- [ ] Badges use `<span>` not `<Badge>` inside interactive containers
- [ ] Every `text-*` color has a `dark:text-*` counterpart
- [ ] Primary CTAs are outline buttons with `theme.btnSecondary` + `shadow-xs`
- [ ] Secondary actions are ghost buttons
- [ ] Card footers have `border-t border-border/55`
- [ ] Modals follow the Dialog template with proper `DialogDescription`
- [ ] All modal states are included in pointer-events cleanup effect
- [ ] Entry animations use Framer Motion `initial/animate` with staggered delays
- [ ] Sidebar items use the correct `sidebar-btn-*` CSS class for their section
- [ ] Sub-menu icons use `style={{ color: "var(--section-*)" }}` inline
- [ ] Breadcrumbs use the shared `<Breadcrumb>` component (Home → Project → Page)
- [ ] Sticky headers use `sticky top-0 z-20 bg-background border-b border-border shadow-xs`
- [ ] Error states follow the centered card pattern with `IconAlertTriangle`
- [ ] Assessment answer options use the tri-color system (destructive/warning/success)
- [ ] Logo images are separate for light/dark mode (`dark:hidden` / `hidden dark:block`)
