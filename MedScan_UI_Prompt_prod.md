# MedScan UI Replication Prompt — `prod` Branch

> **Purpose:** This document provides a complete, developer-ready prompt to replicate the MedScan UI design system in the `prod` branch. It covers design tokens, typography, component patterns, animations, and per-page implementation specs extracted from the reference source.

---

## 1. Design System & Tokens

### 1.1 CSS Custom Properties (`index.css`)

Replace or merge the existing `:root` block with the following token definitions. These are the canonical values all components must reference via Tailwind's `hsl(var(--token))` syntax.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

:root {
  /* Base */
  --background: 150 20% 99%;
  --foreground: 200 25% 10%;

  /* Cards / Surfaces */
  --card: 0 0% 100%;
  --card-foreground: 200 25% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 200 25% 10%;

  /* Brand Primary (Teal-Green) */
  --primary: 168 60% 38%;
  --primary-foreground: 0 0% 100%;

  /* Secondary (Soft Teal Tint) */
  --secondary: 168 30% 95%;
  --secondary-foreground: 168 60% 28%;

  /* Muted */
  --muted: 200 15% 96%;
  --muted-foreground: 200 10% 45%;

  /* Accent */
  --accent: 168 40% 92%;
  --accent-foreground: 168 60% 28%;

  /* Semantic Status Colors */
  --destructive: 0 72% 55%;
  --destructive-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --success: 152 60% 42%;
  --success-foreground: 0 0% 100%;
  --critical: 0 84% 60%;
  --critical-foreground: 0 0% 100%;
  --info: 210 80% 55%;
  --info-foreground: 0 0% 100%;

  /* Borders & Inputs */
  --border: 200 15% 91%;
  --input: 200 15% 91%;
  --ring: 168 60% 38%;
  --radius: 0.75rem;

  /* Sidebar */
  --sidebar-background: 168 20% 98%;
  --sidebar-foreground: 200 15% 30%;
  --sidebar-primary: 168 60% 38%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 168 30% 94%;
  --sidebar-accent-foreground: 168 60% 28%;
  --sidebar-border: 200 15% 91%;
  --sidebar-ring: 168 60% 38%;

  /* Chart Colors */
  --chart-normal: 152 60% 42%;
  --chart-high: 38 92% 50%;
  --chart-low: 210 80% 55%;
  --chart-critical: 0 84% 60%;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(168 60% 38%), hsl(168 70% 45%));
  --gradient-hero: linear-gradient(135deg, hsl(168 60% 38%), hsl(190 60% 42%));
  --gradient-subtle: linear-gradient(180deg, hsl(150 20% 99%), hsl(168 20% 97%));

  /* Shadows */
  --shadow-soft: 0 1px 3px hsl(200 15% 10% / 0.06), 0 4px 12px hsl(200 15% 10% / 0.04);
  --shadow-medium: 0 4px 16px hsl(200 15% 10% / 0.08), 0 1px 4px hsl(200 15% 10% / 0.04);
  --shadow-elevated: 0 8px 32px hsl(200 15% 10% / 0.1), 0 2px 8px hsl(200 15% 10% / 0.05);
}

.dark {
  --background: 200 25% 6%;
  --foreground: 150 10% 92%;
  --card: 200 20% 9%;
  --card-foreground: 150 10% 92%;
  --popover: 200 20% 9%;
  --popover-foreground: 150 10% 92%;
  --primary: 168 60% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 200 15% 14%;
  --secondary-foreground: 168 40% 70%;
  --muted: 200 15% 14%;
  --muted-foreground: 200 10% 55%;
  --accent: 200 15% 14%;
  --accent-foreground: 168 40% 70%;
  --destructive: 0 62% 45%;
  --destructive-foreground: 0 0% 100%;
  --border: 200 15% 16%;
  --input: 200 15% 16%;
  --ring: 168 60% 45%;
  --sidebar-background: 200 20% 8%;
  --sidebar-foreground: 150 10% 85%;
  --sidebar-primary: 168 60% 45%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 200 15% 14%;
  --sidebar-accent-foreground: 168 40% 70%;
  --sidebar-border: 200 15% 16%;
  --sidebar-ring: 168 60% 45%;
}
```

### 1.2 Tailwind Utility Classes to Add

Add the following custom utilities to `@layer utilities` in `index.css`:

```css
@layer utilities {
  .shadow-soft    { box-shadow: var(--shadow-soft); }
  .shadow-medium  { box-shadow: var(--shadow-medium); }
  .shadow-elevated { box-shadow: var(--shadow-elevated); }
  .gradient-primary { background: var(--gradient-primary); }
  .gradient-hero    { background: var(--gradient-hero); }
  .gradient-subtle  { background: var(--gradient-subtle); }
}
```

### 1.3 Typography

- **Body font:** `Inter` (weights: 300, 400, 500, 600, 700, 800)
- **Heading font:** `Plus Jakarta Sans` (weights: 500, 600, 700, 800)
- Apply in `@layer base`:
  ```css
  body { font-family: 'Inter', system-ui, sans-serif; @apply antialiased; }
  h1,h2,h3,h4,h5,h6 { font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; }
  ```

---

## 2. Shared Components

### 2.1 `MedScanLogo`

**File:** `src/components/MedScanLogo.tsx`

- Flex row, `gap-2`
- Icon container: `gradient-primary rounded-lg p-1.5` — uses `Activity` icon from `lucide-react`
- Icon color: `text-primary-foreground`
- Brand name: `"Med"` in `text-foreground`, `"Scan"` in `text-primary`
- Font: `font-bold tracking-tight`
- Three size variants: `sm` (icon 18, `text-lg`), `md` (icon 24, `text-xl`), `lg` (icon 32, `text-3xl`)

### 2.2 `DashboardHeader`

**File:** `src/components/DashboardHeader.tsx`

- `sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md`
- Inner div: `flex h-16 items-center justify-between px-6`
- Left: `<MedScanLogo size="sm" />`
- Right: role badge + username + dark mode toggle + logout
  - Role badge: `rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground`
  - Username: `text-sm font-medium text-foreground`
  - Icon buttons: `variant="ghost" size="icon"`, icons `Moon`/`Sun` and `LogOut` at size 18, colored `text-muted-foreground`
- Dark mode: toggle `document.documentElement.classList.toggle("dark")` on click

### 2.3 `MetricCard`

**File:** `src/components/MetricCard.tsx`

- Wrapper: `motion.div` with `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`
- Card: `rounded-xl border bg-card p-5 shadow-soft`
- Layout: `flex items-start justify-between`
- Left: title (`text-sm text-muted-foreground`) + value (`mt-1 text-2xl font-bold text-card-foreground`) + optional trend (`mt-1 text-xs text-muted-foreground`)
- Right: icon container with accent color — `rounded-lg p-2.5`
- **Accent color map** (apply as `bg-{color}/10 text-{color}`):
  - `primary` → `bg-primary/10 text-primary`
  - `warning` → `bg-warning/10 text-warning`
  - `critical` → `bg-critical/10 text-critical`
  - `success` → `bg-success/10 text-success`
  - `info` → `bg-info/10 text-info`
- Icon size: 20px

### 2.4 `NavLink`

**File:** `src/components/NavLink.tsx`

- Wrapper around `react-router-dom`'s `NavLink` using `forwardRef`
- Supports `className`, `activeClassName`, `pendingClassName` props
- Uses `cn()` to compose class names based on active/pending state

---

## 3. Page Implementations

### 3.1 Login Page (`src/pages/Login.tsx`)

**Layout:** Full-screen split (`flex min-h-screen`)

#### Left Panel (hidden on mobile, 50% on lg+)
- Class: `hidden w-1/2 lg:flex items-center justify-center gradient-hero relative overflow-hidden`
- Animated background: 6 pulsing circles using `motion.div`, positioned absolutely, `bg-primary-foreground/20`, `opacity-10` container, `scale + opacity` loop animation with staggered duration (4–10s)
- Hero text: `text-4xl font-bold text-primary-foreground` heading + `text-primary-foreground/80 text-lg` subtext
- Fade-in animation: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}`

#### Right Panel (full width on mobile, 50% on lg+)
- Slide-in animation: `initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}`
- Logo: `<MedScanLogo size="lg" />` + subtitle `text-muted-foreground`
- **Role selector:** `<Tabs>` with 4 triggers: Patient, Doctor, Admin, Dev — `grid w-full grid-cols-4`
- **Email input:** icon `Mail` at `left-3`, `h-12`, `pl-10`
- **Password input:** icon `Lock` at `left-3`, toggle `Eye`/`EyeOff` at `right-3`, `h-12`, `pl-10 pr-10`
- **Submit button:** `w-full h-12 text-base`; loading state shows spinning `motion.div` with `border-2 border-primary-foreground/30 border-t-primary-foreground`
- **Error state:** animated `bg-destructive/10 p-3 text-sm text-destructive` block
- **Demo notice:** `rounded-lg border border-info/30 bg-info/5 p-3 text-center text-xs text-muted-foreground`

---

### 3.2 Patient Dashboard (`src/pages/PatientDashboard.tsx`)

#### Metric Row
4-column grid (1 col mobile, 2 sm, 4 lg):
| Title | Value | Icon | Accent |
|---|---|---|---|
| Total Reports | 5 | `FileText` | `primary` |
| Analyzed | 3 | `CheckCircle` | `success` |
| Processing | 1 | `Clock` | `info` |
| Flagged Markers | 2 | `AlertTriangle` | `warning` |

#### Upload + Trend Row
- 3-column grid (`lg:grid-cols-3`)
- **Upload zone** (`lg:col-span-2`):
  - `rounded-xl border-2 border-dashed p-8 text-center`
  - Active drag state: `border-primary bg-primary/5`; default: `border-border bg-card`
  - Icon: `Upload` size 36, `text-muted-foreground`
  - `<Progress>` bar during upload with percentage text
- **Trend card**:
  - `flex flex-col items-center justify-center rounded-xl border bg-card p-6 text-center shadow-soft`
  - `TrendingUp` icon size 32, `text-primary`
  - Button triggers `<TrendViewerModal>`

#### Reports Table
- Wrapper: `rounded-xl border bg-card shadow-soft overflow-hidden`
- Header section: `border-b px-5 py-4` with `text-lg font-semibold text-card-foreground`
- Table header row: `border-b bg-muted/30`, cells `px-5 py-3 text-left font-medium text-muted-foreground`
- Table body rows: `border-b last:border-0 hover:bg-muted/20 transition-colors` with staggered `motion.tr` fade-in
- **Status badge variants:** `info` (Uploaded), `processing` (Processing), `success` (Analyzed), `destructive` (Failed) — each with icon + label
- **Action buttons** (ghost, `h-8 w-8`) shown conditionally:
  - ANALYZED: `Eye` → opens `ReportAnalysisDrawer`, `Share2` → opens `ShareModal`, `MessageCircle` → opens `ChatbotModal`
  - FAILED: `RotateCcw` icon in `text-destructive`

---

### 3.3 Doctor Dashboard (`src/pages/DoctorDashboard.tsx`)

#### Metric Row
4-column grid (1 col, 2 sm, 4 lg):
| Title | Value | Icon | Accent |
|---|---|---|---|
| Assigned Patients | 3 | `Users` | `primary` |
| Shared Reports | 12 | `FileText` | `info` |
| Critical | 1 | `AlertTriangle` | `critical` |
| Pending Review | 3 | `Clock` | `warning` |

#### Tabs
- Two tabs: **Assigned Patients** and **Shared Reports**
- Both use `motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}` wrapping a `rounded-xl border bg-card shadow-soft overflow-hidden` table
- **Patients table columns:** Name, Email, Assigned Date, Reports
- **Reports table columns:** Patient, Type, Date Shared, Markers (badge), Status (badge), Action (View button)
  - Urgency badge variants: `critical`, `warning`, `success`
  - Review status: `muted` (Reviewed) or `warning` (Pending)
  - Action: `<Button variant="ghost" size="sm">` with `Eye` icon — opens `ReportAnalysisDrawer`

---

### 3.4 Admin Dashboard (`src/pages/AdminDashboard.tsx`)

#### Metric Row
3-column grid (1 col, 3 sm):
| Title | Icon | Accent |
|---|---|---|
| Total Patients | `Users` | `primary` |
| Total Doctors | `Stethoscope` | `info` |
| Active Assignments | `Link2` | `success` |

#### Action Bar
- Flex row `gap-2`: "Add Patient" button, "Add Doctor" button, "Assign Patient" `variant="outline"` button
- All open a shared modal with `addModalType` state (`"patient" | "doctor" | "assign" | null`)

#### Tabs
- **Patients tab columns:** ID (mono `text-xs`), Name, Email, Assigned Doctors (badge array or "Unassigned" text), Actions (trash icon)
- **Doctors tab columns:** ID (mono), Name, Email, Hospital ID (mono), Patients count, Actions (trash icon)

#### Add Modal
- `motion.div` overlay: `fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm`
- Panel: `fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-elevated`
- Scale animation: `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}`
- **Assign mode:** two `<Select>` dropdowns (patient, then doctor)
- **Add mode:** name + email inputs; Add Doctor also shows Hospital ID input
- Footer: `flex gap-2 justify-end` with Cancel (outline) + action button

---

### 3.5 Dev Dashboard (`src/pages/DevDashboard.tsx`)

#### Metric Row
4-column grid with live-updating mock stats:
| Title | Icon | Accent |
|---|---|---|
| Pipeline Jobs | `Server` | `primary` |
| Avg Latency | `Clock` | `info` |
| Success Rate | `Activity` | `success` |
| Failed (24h) | `XCircle` | `critical` |

#### Feature flags
- Toggle list with `Switch` components per agent/pipeline flag
- Labeled with agent name and description

#### AI Job Logs Table
- Columns: Job ID (mono), Report ID (mono), Agent, Duration, Status badge, Timestamp, Trace toggle
- **Status badge:** `success` variant with `CheckCircle` icon / `destructive` with `XCircle`
- **Expandable trace row:** clicking "Trace" button expands a `<pre>` block with JSON payload
  - Trace pre: `text-xs text-muted-foreground overflow-x-auto rounded-lg bg-background p-3 border`
  - Collapse row: `bg-muted/30`

---

## 4. Modal & Drawer Components

### 4.1 Modal Pattern (shared by ShareModal, TrendViewerModal, Admin modals)

All centered modals follow this structure:

```
<AnimatePresence>
  {open && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md
                   -translate-x-1/2 -translate-y-1/2
                   rounded-xl border bg-card p-6 shadow-elevated"
      >
        {/* Header: title + X ghost icon button */}
        {/* Content */}
        {/* Footer: Cancel (outline) + Primary action */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 4.2 `ReportAnalysisDrawer`

- **Slide-in from right:** `initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}` with `transition={{ type: "spring", damping: 30, stiffness: 300 }}`
- Panel class: `fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l bg-card shadow-elevated`
- **Sticky header:** `sticky top-0 z-10 flex items-center justify-between border-b bg-card p-4` — filename (`font-semibold`), type + date (`text-sm text-muted-foreground`), Download PDF button, X button
- **Two tabs:** Summary and Raw Data
  - **Summary tab:**
    - AI Summary box: `rounded-lg bg-secondary/50 p-4`
    - Clinical Insights list: each item is `motion.li` with staggered `delay: i * 0.1`, styled `flex items-start gap-2 rounded-lg border p-3 text-sm` with teal dot bullet (`h-2 w-2 rounded-full bg-primary`)
    - Detailed Explanation: plain `text-sm leading-relaxed text-muted-foreground`
  - **Raw Data tab:**
    - Biomarkers table: columns Marker, Value, Reference, Status
    - Status badge variants: `success` (NORMAL), `warning` (HIGH), `info` (LOW), `critical` (CRITICAL)

### 4.3 `ShareModal`

- Max width: `max-w-md`
- Header: title + filename subtitle + X button
- **Doctor search:** relative input with `Search` icon at `left-3`, `pl-9`
- **Search results dropdown:** `max-h-32 overflow-y-auto rounded-lg border`; each result is a button with avatar initials circle (`h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold`), name, and hospital
- **Currently shared list:** each entry `flex items-center justify-between rounded-lg border p-3` with `UserCheck` (success color) and trash icon ghost button

### 4.4 `TrendViewerModal`

- Max width: `max-w-2xl`
- **Controls row:** `<Select>` for biomarker (w-52) + timeframe pill buttons (3M / 6M / 1Y / All)
  - Active pill: `variant="default"`; inactive: `variant="outline" size="sm" className="text-xs"`
- **Chart:** `ResponsiveContainer` 100% × 264px `LineChart` from recharts
  - `CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"`
  - Axes: `tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}`
  - Tooltip: `backgroundColor: "hsl(var(--card))"`, `border: "1px solid hsl(var(--border))"`, `borderRadius: 8`
  - `ReferenceArea` for normal range: `fill="hsl(var(--success))" fillOpacity={0.08}`
  - Line: `stroke="hsl(var(--primary))" strokeWidth={2.5}`
  - Custom dot: radius 5 + `fill="hsl(var(--critical))"` for out-of-range; radius 3.5 + `fill="hsl(var(--primary))"` for in-range; `stroke="hsl(var(--card))" strokeWidth={2}` on all
- **Stats row:** 3-column grid of cards (`rounded-lg border p-3 text-center`)
  - Highest: `TrendingUp` in `text-warning`
  - Lowest: `TrendingDown` in `text-info`
  - Latest: `Minus` in `text-foreground`
  - Value: `text-lg font-bold text-card-foreground`; label: `text-xs text-muted-foreground`

### 4.5 `ChatbotModal`

- **Position:** `fixed bottom-4 right-4` (sm: `bottom-8 right-8`)
- Panel: `flex h-[70vh] w-full max-w-md flex-col rounded-xl border bg-card shadow-elevated`
- **Slide-up animation:** `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}`
- **Header:** Bot avatar (`h-8 w-8 rounded-full bg-primary/10` with `Bot` icon `text-primary`), "MedScan AI" title + "Contextual Q&A" subtitle, X button
- **Context banner:** `rounded-md bg-info/5 border-b border-info/20 px-4 py-2 text-xs` with `Sparkles` icon
- **Message area:** `flex-1 overflow-y-auto p-4 space-y-3`
  - AI messages: `bg-muted text-card-foreground`, left-aligned, Bot avatar on left
  - User messages: `bg-primary text-primary-foreground`, right-aligned, User avatar on right
  - Bubble: `max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed`
  - **Typing indicator:** 3 bouncing dots (`h-2 w-2 rounded-full bg-muted-foreground/40`) with staggered `y: [0, -4, 0]` animation, `delay: i * 0.15`
  - All messages use `motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}`
- **Footer:** `border-t p-3`
  - Suggested questions: pill buttons `rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent`
  - Input + Send button row: `flex gap-2`; Send is `size="icon"`, disabled when input empty

---

## 5. Animation Reference

All animations use `framer-motion`. Import `motion` and `AnimatePresence` from `"framer-motion"`.

| Context | Animation |
|---|---|
| Page / section entry | `opacity: 0→1, y: 12→0` |
| Staggered list items | `opacity: 0→1, x: -10→0`, delay `i * 0.1` |
| Staggered table rows | `opacity: 0→1`, delay `0.05 * i` |
| Modals (center) | `opacity + scale: 0.95→1` |
| Drawer (side) | `x: 100%→0`, spring `damping 30, stiffness 300` |
| Chatbot (bottom) | `opacity + y: 20→0` |
| Login left panel | `opacity + y: 20→0`, delay 0.2 |
| Login right panel | `opacity + x: 20→0` |
| Pulsing hero circles | `scale: [1,1.1,1], opacity: [0.1,0.2,0.1]`, infinite, duration 4–10s staggered |
| Loading spinner | `rotate: 360`, infinite, linear, 1s duration |
| Typing dots | `y: [0,-4,0]`, infinite, 0.6s, delay `i * 0.15` |

---

## 6. Badge Variant Reference

The following badge `variant` values must be supported. Add them to your `badge.tsx` `cva` config:

| Variant | Use Case | Colors |
|---|---|---|
| `default` | Standard | primary bg |
| `secondary` | Assigned doctor tags | `bg-secondary text-secondary-foreground` |
| `success` | NORMAL biomarker, Analyzed status | `bg-success/15 text-success` |
| `warning` | HIGH biomarker, Pending review, flagged | `bg-warning/15 text-warning` |
| `critical` | CRITICAL biomarker, critical urgency | `bg-critical/15 text-critical` |
| `info` | LOW biomarker, Uploaded status | `bg-info/15 text-info` |
| `destructive` | Failed status | `bg-destructive/15 text-destructive` |
| `muted` | Reviewed status | `bg-muted text-muted-foreground` |
| `processing` | Processing status | use info with animated pulse |

---

## 7. Routing (`App.tsx`)

Ensure the following routes exist:

```tsx
<Routes>
  <Route path="/"        element={<Login />} />
  <Route path="/patient" element={<PatientDashboard />} />
  <Route path="/doctor"  element={<DoctorDashboard />} />
  <Route path="/admin"   element={<AdminDashboard />} />
  <Route path="/dev"     element={<DevDashboard />} />
  <Route path="*"        element={<NotFound />} />
</Routes>
```

Wrap with `QueryClientProvider`, `TooltipProvider`, `<Toaster />` (shadcn), and `<Sonner />`.

---

## 8. Dependencies Required

```json
{
  "framer-motion": "latest",
  "@tanstack/react-query": "latest",
  "react-router-dom": "latest",
  "recharts": "latest",
  "lucide-react": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-select": "latest",
  "@radix-ui/react-tooltip": "latest"
}
```

shadcn/ui components needed: `Button`, `Badge`, `Input`, `Tabs`, `Select`, `Progress`, `Switch`, `Toaster`, `Sonner`

---

## 9. File Structure

```
src/
├── components/
│   ├── MedScanLogo.tsx
│   ├── DashboardHeader.tsx
│   ├── MetricCard.tsx
│   ├── NavLink.tsx
│   └── patient/
│       ├── ReportAnalysisDrawer.tsx
│       ├── ShareModal.tsx
│       ├── TrendViewerModal.tsx
│       └── ChatbotModal.tsx
├── pages/
│   ├── Login.tsx
│   ├── PatientDashboard.tsx
│   ├── DoctorDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── DevDashboard.tsx
│   └── NotFound.tsx
├── index.css          ← Token definitions here
├── app.css            ← Keep minimal; max-width + logo styles
└── App.tsx            ← Router + providers
```

---

## 10. Implementation Checklist for `prod` Branch

- [ ] Create branch from main: `git checkout -b prod`
- [ ] Update `index.css` with all CSS tokens from Section 1
- [ ] Add Google Fonts import (Inter + Plus Jakarta Sans)
- [ ] Create/update `MedScanLogo` component (Section 2.1)
- [ ] Create/update `DashboardHeader` (Section 2.2)
- [ ] Create/update `MetricCard` (Section 2.3)
- [ ] Update `badge.tsx` to add all variant values (Section 6)
- [ ] Implement `Login.tsx` with split layout, animated hero, role tabs (Section 3.1)
- [ ] Implement `PatientDashboard.tsx` with upload zone, reports table, 4 modals (Section 3.2)
- [ ] Implement `DoctorDashboard.tsx` with patients + shared reports tabs (Section 3.3)
- [ ] Implement `AdminDashboard.tsx` with add/assign modals (Section 3.4)
- [ ] Implement `DevDashboard.tsx` with job logs + expandable traces (Section 3.5)
- [ ] Implement `ReportAnalysisDrawer` with spring slide-in, Summary + Raw Data tabs (Section 4.2)
- [ ] Implement `ShareModal` with doctor search + shared list (Section 4.3)
- [ ] Implement `TrendViewerModal` with recharts line chart, custom dots, stats (Section 4.4)
- [ ] Implement `ChatbotModal` with bottom-right position, typing indicator (Section 4.5)
- [ ] Verify dark mode toggle in `DashboardHeader` works across all pages
- [ ] Verify all `motion` animations match the reference table (Section 5)
- [ ] Test routing for all 5 role paths
