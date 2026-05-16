# Rehearsal — Frontend Specification

Complete UI requirements for **Member 2 (Product UI)**. Pair with [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) and `types/index.ts`.

**Mock-first:** Build with `lib/mocks/` until APIs are live. See [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md).

---

## Global layout

| Item | Spec |
|------|------|
| Sidebar width | 240px fixed |
| Max content width | 1280px |
| Default mode | Dark |
| Active nav | 3px amber left border |
| Icons | Lucide only, stroke 1.5px |

### Sidebar nav (role-aware)

**Always:** Dashboard, Targets, Documents, Scenarios, Library, Progress

| Mode / Role | Additional |
|-------------|------------|
| Solo | Settings only (footer) |
| Team learner | Assignments + Settings |
| Team coach/owner | Assignments + Admin + Settings |

**Footer:** User avatar, name, workspace switcher dropdown.

**Badge:** Assignments nav shows count when `status === 'pending'` for learner.

---

## F14 — Auth pages

### Sign-in `app/(auth)/signin/page.tsx`

- Centered card, max-width **420px**
- Logo + "Sign in to Rehearsal" (Fraunces)
- **Continue with Google** (primary)
- **Continue with email** → expands to email input + "Send magic link"
- Auth layout: no sidebar

### Onboarding `app/(auth)/onboarding/page.tsx`

Component: `components/shared/OnboardingFlow.tsx`

| Step | Content |
|------|---------|
| 1 | Intent: two equal cards — "Just for me" (solo) / "For my team" (team) |
| 2 | Workspace name (placeholder reflects intent) |
| 3 | Primary use case: **6 cards** (interview, pitch, sales, difficult, negotiation, other) |
| 4 | Optional starter target: 3 library suggestions or **Skip** |
| 5 | Team only: invite up to 5 emails + role selector; skippable |

On complete: create org + membership → redirect `/dashboard`.

---

## F9 — Dashboard `app/(app)/dashboard/page.tsx`

### Solo dashboard

1. **Greeting band** — Time-aware ("Good evening, {name}") in Fraunces  
2. **Stats subtitle** — "3 rehearsals this week — score up 12 points"  
3. **Primary actions** (3 cards in a row):
   - Start a rehearsal (amber primary)
   - Build a new target (ghost)
   - Add context (ghost)
4. **Continue where you left off** — horizontal scroll session cards (target, type, date, scores)
5. **Your targets** — grid mini-cards + quick-launch arrow
6. **Up next** — 3 recommended scenarios
7. **This week** — 7-day heatmap + streak counter

### Team coach dashboard

All solo sections **plus** `TeamPulseBand` on top:

- Sessions this week (org)
- Avg team score
- Most active member (avatar)
- Members needing attention (count + link)

### Empty state (new user)

- "Welcome, {name}." (Display 2)
- "Your first rehearsal is three steps away"
- 3 numbered step cards: Pick target → Add context → Run rehearsal
- Link: "Or try a demo with The Contrarian Seed VC"

---

## F1 — Targets

### List `app/(app)/targets/page.tsx`

- Grid of `TargetCard`
- Each card: category badge (mono caption), name (Fraunces H2), title/company, 3 pills (sessions, accuracy, last rehearsed)
- **New target** button (amber)

### Builder `app/(app)/targets/new/page.tsx`

`components/targets/TargetBuilder.tsx` — 4 steps:

| Step | Component | Fields / behavior |
|------|-----------|-------------------|
| 1 | `TargetBuilderStep1` | name, title, company, domain (segmented control) |
| 2 | `TargetBuilderStep2` + `SourceManager` | Tabs: URL / Document / Manual. URL list + status badges. File drop zone. Manual textarea |
| 3 | `TargetBuilderStep3` / `ReconstructionStatus` | Live status lines ("Reading profile · Done"). **Poll GET /api/targets/[id] every 3s** until `status` is `complete` or `failed` |
| 4 | `TargetBuilderStep4` | `PersonalityProfileCard`, allow edit, save |

### Profile `app/(app)/targets/[id]/page.tsx`

- Full `PersonalityProfileCard`
- Sources list, session history link
- Edit → `[id]/edit`

### PersonalityProfileCard sections

Each section: left **amber accent bar**

1. Communication style — 4 dimension chips  
2. What they value — bullets + source citations  
3. Typical questions — italic Fraunces quotes  
4. Known skepticisms — **terracotta** left border per item  
5. What impresses them — **sage** left border  
6. Source citations — collapsible  
7. Confidence calibration — visual per field  

---

## F2/F3 — Documents

### Personal `app/(app)/documents/page.tsx`

- Table: filename, type tag, date, size, embedding status, actions
- Search + filter top
- **Upload** opens `DocumentUploader` modal

### `DocumentUploader`

- Drag-and-drop dashed border
- Type selector: My Background / Opportunity / Company or Product / Prior Interactions / Other
- Progress: Uploading → Processing text → Embedding → **Ready**

### Company `app/(app)/company-documents/page.tsx`

- Same UI as documents
- **Hidden entirely** when `org.mode === 'solo'`
- **Upload/delete** only for `owner` role

---

## F4 — Scenarios

### List `app/(app)/scenarios/page.tsx`

- `ScenarioCard` grid
- New scenario button

### Configurator `app/(app)/scenarios/new/page.tsx`

`ScenarioConfigurator.tsx` sections:

1. **Conversation type** — 3×3 + 1 grid, 10 cards with icon + description  
2. **Target** — searchable dropdown + "Browse library" link  
3. **Duration** — slider 5–30 min, step 5; value shown large in Fraunces  
4. **Difficulty** — slider 1–5; gradient sage → amber → terracotta; labels: Patient / Conversational / Standard / Demanding / Intense  
5. **Session goal** — large textarea  
6. **Documents** — multi-select checkboxes; text: "The avatar will know about: {names}"  
7. **Preview avatar brief** — modal (`AvatarBriefPreview`)  
8. **Team coach only:** Assign to learners — multi-select + due date  

---

## F5 — Live session `app/(app)/sessions/[id]/page.tsx`

Three states in one page:

### State 1 — Pre-session (`PreSessionChecklist`)

- [ ] Microphone (`getUserMedia`)
- [ ] Camera (`getUserMedia`)
- [ ] Context summary: "The avatar knows about: {doc names}"
- [ ] "You'll be speaking with: {target name}"
- [ ] Consent checkbox (required): "I understand this is an AI avatar and my conversation will be transcribed for feedback."
- **Start Session** disabled until all pass → POST `/api/sessions` if not created, or transition to live

### State 2 — Live (`LiveSessionPanel`)

- **Top bar:** target name (Fraunces medium), timer (Fraunces large mono), **End Session**
- **Center:** `SessionEmbed` — iframe 16:9, max-width 960px, amber edge glow
- **Bottom:** Coaching Break (ghost) — pauses avatar, hint input
- Timer **pulses amber** in last 60 seconds
- Auto-end when duration reached

### State 3 — Generating (`GeneratingReportState`)

- "Reviewing your session..." (Fraunces)
- Animated status lines + subtle progress bar
- **Poll GET /api/sessions/[id] every 5s** until `status === 'report_ready'`
- Redirect to `/reports/{reportId}`

---

## F6 — Feedback report `app/(app)/reports/[id]/page.tsx` ⭐ Priority

`FeedbackReport.tsx` — top to bottom:

### Hero band (full-width, amber-tinted dark)

- Caption: "REHEARSAL COMPLETE" (mono)
- Target name — Display 1 Fraunces
- Conversation type subtitle
- Session date — mono small
- **Right:** Overall + Target Fit scores (Display 1) with `ScoreGauge` (animate 0→value, 800ms)
- Descriptors: Strong / Mixed / Needs work

### Sections

| Section | Caption | Component |
|---------|---------|-----------|
| Executive summary | EXECUTIVE SUMMARY | 2–4 sentences, Fraunces italic, max-width 680px |
| Best moments | WHAT WORKED | `KeyMomentCard` list, **sage** left border |
| Weak moments | WHAT TO IMPROVE | `KeyMomentCard`, **terracotta** border; expand → `SuggestedAnswer` |
| Missed signals | WHAT YOU MISSED | timestamp + signal + meaning |
| Delivery | DELIVERY | `CommunicationNotes` 2×2 grid |
| Transcript | FULL TRANSCRIPT | `TranscriptViewer` collapsed default; user off-white, avatar amber tint |
| Accuracy | HOW ACCURATE WAS THIS? | `AccuracyRater` 5 stars + optional comment |

### Floating actions (top-right)

- Export PDF → POST `/api/reports/[id]/pdf`
- Share → copy link to clipboard

### Team only

- `CoachCommentBox` inline on moments with coach comments

### Next steps band

- "Run this again" card
- "Try a different scenario" card

---

## F7 — Progress `app/(app)/progress/page.tsx`

`ProgressDashboard.tsx`:

1. **4 hero cards:** total sessions, avg overall (trend), avg target fit (trend), streak  
2. **ImprovementChart** — LineChart, overall (amber) + target fit (sage)  
3. **SkillRadar** — 6 axes: Structure, Specificity, Pressure Handling, Directness, Target Fit, Evidence Quality  
4. **SessionHistoryList** — paginated, filters  
5. **Per-target bar chart** — avg score (multi-session targets only)  
6. **Team coach tab:** "My Progress" | "Team Progress"

---

## F8 — Library

### Browser `app/(app)/library/page.tsx`

- Search input
- `LibraryFilterTabs`: All / Professional / Personal / Real Figures
- Sub-filters by domain
- Sort: Most used / Highest rated / Newest
- Featured: 3 horizontal scroll cards
- Grid: 3 col desktop, 2 tablet, 1 mobile
- `LibraryCard`: badge, name (Fraunces), title, 3 pills; hover → Preview + Clone (amber)

### Detail `app/(app)/library/[id]/page.tsx` or modal

- Read-only personality view
- **Clone to workspace** (prominent)
- Real figures: disclaimer banner
- Accuracy distribution chart (optional)

---

## F11/F12 — Team

### Assignments `app/(app)/assignments/page.tsx`

**Coach:** New Assignment button; sections Pending / Completed / Overdue; modal with scenario + learners + due date + message  

**Learner:** Inbox list; Start button per row

### Admin `app/(app)/admin/page.tsx`

- 4 hero stats
- `TeamMemberTable`: avatar, name, role, sessions, avg score, last active, sparkline, actions
- `SkillGapChart` — horizontal bars, weakest in terracotta
- Recent team reports list

**Hidden when solo mode.**

---

## F13 — Settings `app/(app)/settings/page.tsx`

**Solo:** General | Account | Data (single column)

**Team:** Tabs — General | Team | Data | Account

- Team tab: member list, invite email + role, pending invites
- Data: export, delete workspace (terracotta danger zone + confirm dialog)

---

## Shared components

| Component | Path | Notes |
|-----------|------|-------|
| `AppShell` | `components/shared/AppShell.tsx` | Wraps children + sidebar |
| `Sidebar` | `components/shared/Sidebar.tsx` | Role-aware links |
| `EmptyState` | `components/shared/EmptyState.tsx` | CTA + illustration optional |
| `LoadingSkeleton` | `components/shared/LoadingSkeleton.tsx` | Per-page variants |
| `ErrorBoundary` | `components/shared/ErrorBoundary.tsx` | Retry button |
| `ConfirmDialog` | `components/shared/ConfirmDialog.tsx` | Delete flows |

---

## Mobile

- Sidebar → drawer below `md` breakpoint
- Report scores stack vertically on small screens
- Target builder steps: single column
- Library grid → 1 column

---

## Data hooks (TanStack Query)

Suggested query keys:

```ts
["targets"], ["targets", id]
["documents"], ["scenarios"], ["scenarios", id]
["sessions"], ["sessions", id]
["reports", id]
["library", filters]
["assignments"]
["admin", "team-report"]
```

See [API_SPEC_FULL.md](./API_SPEC_FULL.md) for endpoints.
