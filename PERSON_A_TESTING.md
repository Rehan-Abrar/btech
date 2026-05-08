# Person A — Testing Checklist
# AXON · Web Nexus Day 1 Sprint
# Run this checklist top-to-bottom before Checkpoint 1, 2, and 3.
# Every item must pass (green) for Person A's deliverable to be complete.

---

## Setup Verification (run once after `npm run dev`)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| S1 | `npm run dev` starts without errors | Vite reports `ready in Xms` on `localhost:5173` | [ ] |
| S2 | No red console errors on initial load | Browser DevTools console is clean | [ ] |
| S3 | Page background is `#1A1A1A` Rich Black | Dark background fills the viewport | [ ] |
| S4 | Inter font renders for body text | Text is crisp, not system default | [ ] |
| S5 | Sidebar visible with AXON logo in gold | Left rail shows gold mark + "AXON" wordmark | [ ] |

---

## Checkpoint 1 — Shell (target: 1:50)

### Routing
| # | Test | How to test | Expected |
|---|------|-------------|----------|
| R1 | `/` renders Dashboard | Visit `localhost:5173/` | Dashboard with stat cards visible |
| R2 | `/board` renders KanbanBoard | Click "My Tasks" in sidebar | 4 kanban columns visible |
| R3 | `/calendar` renders CalendarView | Click "Calendar" nav (Manager role) or direct URL | Month grid visible |
| R4 | `/ai` renders AIChat | Click "AI Chat" in sidebar | Chat panel with message bubble visible |
| R5 | `/login` renders Login page | Visit `/login` directly | AXON login card visible |
| R6 | `/register` renders Register page | Visit `/register` directly | Registration form with role selector visible |
| R7 | `/*` (unknown route) redirects to `/` | Visit `/anything` | Dashboard renders |

### Sidebar
| # | Test | Expected |
|---|------|----------|
| SB1 | Student role shows: Dashboard, My Tasks, AI Chat | 3 nav links visible |
| SB2 | Active nav link has gold accent | Current route link is gold/highlighted |
| SB3 | "New Task" button is gold, pill-shaped | Button fires `onAddTask` → modal opens |
| SB4 | Collapse toggle hides labels | Sidebar shrinks to icon-only (64px) |
| SB5 | User avatar shows "DU" initials | Bottom section shows gold avatar + name + role |

### Dashboard
| # | Test | Expected |
|---|------|----------|
| D1 | "Total Tasks" card shows 8 | Matches mockTasks.js count |
| D2 | "Completed" card shows 2 | Tasks with status "Done" (ids 3, 8) |
| D3 | "In Progress" card shows 2 | Tasks with status "In Progress" (ids 1, 5) |
| D4 | "Overdue" card — any overdue count | All mockTasks.js due dates are in 2025, so overdue > 0 |
| D5 | Status bar chart renders for all 4 statuses | To Do / In Progress / Review / Done bars visible |
| D6 | Priority donut renders in SVG | 3 coloured segments (red/amber/green) |
| D7 | Recent activity lists 5 entries | Last 5 tasks by id, descending |
| D8 | "+ New Task" button on Dashboard opens modal | Click → TaskModal appears with empty form |

---

## Checkpoint 2 — Full Features (target: 2:50)

### KanbanBoard
| # | Test | Expected |
|---|------|----------|
| K1 | All 4 columns render: To Do, In Progress, Review, Done | Column headers with correct accent colours |
| K2 | Task cards appear in correct columns | e.g., task "Fix auth bug" is in Done column |
| K3 | Column count badge is accurate | "In Progress" badge shows 2 |
| K4 | Column progress bar fills proportionally | Done bar > In Progress bar |
| K5 | "+ New Task" button opens modal | Modal appears with blank form |

### TaskCard
| # | Test | Expected |
|---|------|----------|
| TC1 | Priority badge colour: High=red, Medium=amber, Low=green | Correct colour per card |
| TC2 | Tags render as monospace chips | e.g., "Design", "UI" chips in skyblue |
| TC3 | Overdue tasks show "overdue" in red | All 2025 tasks will show this |
| TC4 | Move dropdown changes card column | Select "Done" → card moves to Done column instantly |
| TC5 | Edit button opens modal pre-filled | `task.title` appears in modal input |
| TC6 | Delete button removes card | Card disappears from column, count decreases |

### CRUD Operations (End-to-End)
| # | Test | Steps | Expected |
|---|------|-------|----------|
| CR1 | Create task | Click New Task → fill Title: "Test task", Priority: High, Due: 2025-12-31, Assignee: Alex → Create Task | Card appears in "To Do" column; Dashboard total increases by 1 |
| CR2 | Edit task | Click Edit on any card → change title → Save changes | Card shows updated title |
| CR3 | Delete task | Click Delete (trash icon) on any card | Card removed; count decreases |
| CR4 | Move task | Change move dropdown on a card | Card moves to selected column instantly |
| CR5 | Modal cancel | Open modal → click Cancel | Modal closes, no changes saved |
| CR6 | Modal validation — no title | Open modal → clear title → Create Task | Alert "Title is required" fires |
| CR7 | Modal validation — no due date | Fill title, leave due blank → Create Task | Alert "Due date is required" fires |

### Filtering
| # | Test | Expected |
|---|------|----------|
| F1 | Filter by "High" priority | Only High tasks across all columns |
| F2 | Filter by "Low" priority | Only Low tasks (ids 4, 7) visible |
| F3 | Columns with 0 tasks after filter show EmptyState | Small empty state message appears in column |
| F4 | Reset to "All priorities" | All tasks reappear |

### TaskModal (integration)
| # | Test | Expected |
|---|------|----------|
| M1 | Create mode: form is blank | All fields empty when `task=null` |
| M2 | Edit mode: form is pre-filled | All fields match the edited task |
| M3 | Click backdrop → modal closes | Clicking outside the card closes modal |
| M4 | Priority dropdown defaults to "Medium" | On create, Medium pre-selected |

---

## Checkpoint 3 — Polish (target: 3:20)

### AI Chat
| # | Test | Expected |
|---|------|----------|
| AI1 | Initial message from assistant visible | "Hi there! I'm your AI assistant..." |
| AI2 | "Generate my schedule for today" suggestion fires | Gold dots loading → schedule response |
| AI3 | "What's overdue?" suggestion fires | Overdue response appears |
| AI4 | "Show high priority tasks" suggestion fires | Priority list response |
| AI5 | Type custom message + Enter | User bubble (gold) appears, AI replies |
| AI6 | Send button clickable | Same as Enter key |
| AI7 | Typing indicator (3 gold bouncing dots) shows during 800ms wait | Visible animation before AI reply |
| AI8 | `/ai/schedule` route auto-fires schedule prompt | Chat loads with schedule response pre-populated |
| AI9 | AI "schedule" action creates calendar event | Check `/calendar` — new event dot appears for today |

### CalendarView
| # | Test | Expected |
|---|------|----------|
| CAL1 | Month grid renders current month | Correct month name + year |
| CAL2 | Event dots appear on days with events | Coloured dots on Jun 8, 10, 11, 15 (2025 months) |
| CAL3 | Click date with events → right panel updates | Event title + time range shown |
| CAL4 | Click date with no events → EmptyState | "No events for this date" |
| CAL5 | Prev/next month navigation works | Month changes, grid re-renders |

### EmptyState
| # | Test | Expected |
|---|------|----------|
| ES1 | EmptyState appears in kanban column after all tasks filtered | Small version with AXON mark |
| ES2 | EmptyState appears on calendar with no events | Small version |
| ES3 | EmptyState appears on Dashboard recent activity if tasks=[] | Large version with helper text |

### Visual / Brand Compliance
| # | Test | Expected |
|---|------|----------|
| V1 | No emojis anywhere in the app | Zero emoji characters visible |
| V2 | All buttons are pill-shaped (border-radius: 9999px) | Rounded pill buttons throughout |
| V3 | All cards have 16px border-radius | Rounded card corners |
| V4 | Gold (#D4AF37) used for all CTAs and active states | Consistent gold throughout |
| V5 | Page background is Rich Black (#1A1A1A) | Dark canvas, no white sections |
| V6 | Body text is Sky Blue (#87CEEB) on dark backgrounds | Readable descriptive text |
| V7 | Hover states work on all interactive elements | Cards highlight, nav darkens |
| V8 | Custom scrollbar (gold thumb) visible on overflow content | Gold scroll thumb |

### Responsiveness
| # | Test | Expected |
|---|------|----------|
| RESP1 | Dashboard stat cards stack 2×2 on tablet | `md:grid-cols-4` collapses to 2 cols |
| RESP2 | Kanban board stacks to 1-2 cols on mobile | Grid collapses, no horizontal overflow |
| RESP3 | Sidebar collapses to icon-only at any time | Collapse button works |
| RESP4 | No horizontal scrollbar on 768px viewport | `overflow-x-hidden` on root |

---

## Common Failures Watchlist (from plan.md)

| # | Failure Mode | Quick Fix |
|---|-------------|-----------|
| FM1 | FilterBar causes state to live in itself | Check: state is in KanbanBoard.jsx, FilterBar only calls `onFilterChange` |
| FM2 | Modal doesn't pre-fill on edit | Check: `useEffect` has `[task]` as dep array |
| FM3 | Calendar wrong dates | Check: comparing dateStr strings, not `new Date()` objects |
| FM4 | Dashboard stat cards show 0 | Check: field names match mockTasks.js exactly — `status`, `priority`, `due` |
| FM5 | Task disappears after edit | Check: handleSave uses `{ ...task }` spread copy, not mutation |
| FM6 | Mobile layout breaks | Check: `overflow-x-hidden` on root div, `min-w-0` on flex children |
| FM7 | Empty states not showing | Check: every `.length === 0` branch returns `<EmptyState />`, not null |

---

## Integration Gate — Before Merging Person B + C Components

Person A must confirm these before accepting PRs from teammates:

- [ ] `FilterBar` prop `onFilterChange` is a state setter function — not an object
- [ ] `TaskModal` receives `task` (null or object), `onSave`, `onClose` — nothing else
- [ ] `CalendarView` receives `tasks` and `events` arrays — both from App.jsx state
- [ ] `AIChat` receives `tasks`, `onEventCreate`, optional `initialPrompt` string
- [ ] `EmptyState` accepts `message` (string) and `small` (bool) — no other props required

---

## Final Sign-off Criteria

All of the following must be true before Checkpoint 3:

1. App loads at `/` with no console errors
2. All 4 main routes navigate without blank screens
3. Create → Edit → Delete task cycle works end-to-end
4. Priority filter shows/hides cards correctly
5. All 4 AI suggestion buttons return a response
6. Calendar date click updates the event panel
7. TaskModal opens in create mode and edit mode correctly
8. No emojis, no white backgrounds anywhere in the shell
