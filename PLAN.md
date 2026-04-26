# 🎉 Bribe Tracker — Chores & Rewards App

## Overview
A fun, kid-friendly web app where parents define chores and bribes (rewards) in a Google Spreadsheet, and kids check in daily/weekly to mark tasks complete. The app shows progress bars, streaks, animations, and a running total of what each kid has earned.

---

## Architecture

```
Google Spreadsheet (data source)
        │
        ▼
  Google Sheets API (read/write via API key + service account)
        │
        ▼
  Node.js / Express Backend (thin API layer)
        │
        ▼
  React Frontend (fun, colorful, animated UI)
```

**Stack:** React + Vite frontend, Express backend, Google Sheets API v4

---

## Google Spreadsheet Layout

### Sheet 1: `Kids`
| Column | Description |
|--------|-------------|
| A — `name` | Child's name |
| B — `avatar` | Emoji avatar (🦊🐸🦄 etc.) |
| C — `pin` | Simple 4-digit PIN for check-in |

### Sheet 2: `Chores`
| Column | Description |
|--------|-------------|
| A — `id` | Unique chore ID (auto or manual, e.g. `chore-1`) |
| B — `title` | e.g. "Make Your Bed" |
| C — `description` | e.g. "Neatly make bed before school" |
| D — `frequency` | `daily` or `weekly` |
| E — `streak_goal` | Number of consecutive completions to earn bribe (e.g. `7` for a week) |
| F — `bribe_amount` | Dollar reward when streak goal met (e.g. `5.00`) |
| G — `emoji` | Fun emoji for the chore (🛏️🧹💪) |
| H — `assigned_to` | Comma-separated kid names, or `all` |

### Sheet 3: `Log`
| Column | Description |
|--------|-------------|
| A — `timestamp` | ISO datetime of check-in |
| B — `kid_name` | Who checked in |
| C — `chore_id` | Which chore |
| D — `date` | The calendar date this completion counts for (YYYY-MM-DD) |
| E — `status` | `done` (written by app on check-in) |

> The Log sheet is append-only. The app writes a row each time a kid checks off a chore.

---

## Backend API (Express)

### Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/kids` | List all kids (name + avatar, no PIN exposed) |
| POST | `/api/login` | Verify kid PIN → return kid name + token/session |
| GET | `/api/chores/:kid` | Get chores assigned to a kid |
| GET | `/api/progress/:kid` | Get current streaks, completion status, earnings |
| POST | `/api/checkin` | Kid marks a chore done for today |
| GET | `/api/leaderboard` | All kids' total earnings + streaks |

### Logic Details

- **Streak Calculation:** Read `Log` sheet, group by kid + chore, count consecutive dates (daily) or consecutive weeks (weekly) leading up to today. If a day/week is missed, streak resets.
- **Duplicate Prevention:** Before writing to Log, check if kid already checked in for that chore + date combo.
- **Earnings Calculation:** Each time a streak hits the `streak_goal`, that's one payout of `bribe_amount`. Streaks reset after payout and can be earned again.
- **Weekly Chores:** For `weekly` frequency, only one check-in per calendar week (Mon–Sun) counts. Streak = consecutive weeks completed.

---

## Frontend Pages & Components

### 1. **Home / Kid Select Screen**
- Big colorful cards for each kid showing their emoji avatar and name
- Tap a kid → PIN entry screen
- Fun background (confetti particles, pastel gradient)

### 2. **PIN Entry**
- Large number pad, kid-friendly
- Shake animation on wrong PIN
- Celebration animation on correct entry

### 3. **Dashboard (per kid)**
- **Today's Chores** — cards for each assigned chore with:
  - Chore emoji + title
  - ✅ Check-in button (big, satisfying tap target)
  - Already-done state with checkmark + "Nice job!" 
- **Streak Progress** — for each chore:
  - Visual progress bar or ring showing `current_streak / streak_goal`
  - Fire 🔥 emoji on active streaks
  - Star burst animation when streak goal is hit
- **Bribe Bank 💰** — running total of earned money
  - Animated coin counter
  - Breakdown: which chores earned what

### 4. **Leaderboard**
- All kids ranked by total earnings
- Fun trophy emojis (🥇🥈🥉)
- Streak highlights

### 5. **Celebration Overlays**
- Confetti explosion when checking in a chore
- Bigger confetti + coin rain when a streak goal is completed
- Sound effects (optional toggle)

---

## UI / Design Vibes

- **Color palette:** Bright pastels — coral, mint, sunny yellow, lavender
- **Font:** Rounded/bubbly (e.g. Nunito or Fredoka One from Google Fonts)
- **Animations:** Framer Motion for page transitions, check-in celebrations, progress bar fills
- **Confetti:** `canvas-confetti` library for celebrations
- **Responsive:** Works on phones/tablets (kids will use iPad or parent's phone)
- **Dark mode?** Nah — keep it bright and fun

---

## File Structure

```
bribetracker/
├── PLAN.md
├── package.json
├── server/
│   ├── index.js              # Express server entry
│   ├── sheets.js             # Google Sheets API wrapper
│   ├── routes/
│   │   ├── kids.js
│   │   ├── chores.js
│   │   ├── checkin.js
│   │   └── leaderboard.js
│   └── utils/
│       └── streaks.js         # Streak calculation logic
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api.js             # Fetch wrapper for backend
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Kid select
│   │   │   ├── PinEntry.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── components/
│   │   │   ├── ChoreCard.jsx
│   │   │   ├── StreakRing.jsx
│   │   │   ├── BribeBank.jsx
│   │   │   ├── NumberPad.jsx
│   │   │   ├── Confetti.jsx
│   │   │   └── KidAvatar.jsx
│   │   └── styles/
│   │       └── global.css
│   └── public/
│       └── favicon.ico
├── .env                       # GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_KEY
└── README.md
```

---

## Google Sheets Setup Steps

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a Service Account → download JSON key
4. Share the spreadsheet with the service account email (Editor access)
5. Store the Sheet ID and key path in `.env`

---

## Implementation Order

### Phase 1 — Foundation
1. [ ] Set up project scaffolding (package.json, Vite, Express)
2. [ ] Google Sheets API connection + read Kids/Chores sheets
3. [ ] Backend endpoints: `/api/kids`, `/api/chores/:kid`
4. [ ] Frontend: Home screen with kid cards

### Phase 2 — Core Flow
5. [ ] PIN entry + login flow
6. [ ] Backend: `/api/checkin` (write to Log sheet)
7. [ ] Backend: `/api/progress/:kid` (streak calculation)
8. [ ] Frontend: Dashboard with chore cards + check-in buttons
9. [ ] Duplicate check-in prevention

### Phase 3 — Progress & Rewards
10. [ ] Streak progress rings/bars on dashboard
11. [ ] Bribe Bank earnings display
12. [ ] Streak-goal-met detection + payout tracking
13. [ ] Celebration animations (confetti, coin rain)

### Phase 4 — Polish
14. [ ] Leaderboard page
15. [ ] Page transitions + micro-animations
16. [ ] Mobile responsive tuning
17. [ ] Error handling + loading states
18. [ ] README with setup instructions

---

## Example Spreadsheet Data

**Kids:**
| name | avatar | pin |
|------|--------|-----|
| Emma | 🦄 | 1234 |
| Jack | 🦊 | 5678 |

**Chores:**
| id | title | description | frequency | streak_goal | bribe_amount | emoji | assigned_to |
|----|-------|-------------|-----------|-------------|--------------|-------|-------------|
| chore-1 | Make Your Bed | Neatly make bed before school | daily | 7 | 5.00 | 🛏️ | all |
| chore-2 | Clean Your Room | Pick up toys, vacuum | weekly | 4 | 10.00 | 🧹 | all |
| chore-3 | Clean Bathroom | Scrub sink, toilet, mirror | weekly | 4 | 8.00 | 🚿 | Emma |
| chore-4 | 30 Pushups | Do 30 pushups | daily | 7 | 5.00 | 💪 | Jack |
| chore-5 | Take Out Trash | Take bins to curb | weekly | 4 | 3.00 | 🗑️ | Jack |

---

## Key Design Decisions

- **Google Sheets as DB:** Simple, parent-friendly, no database to manage. Parent edits chores right in the spreadsheet and the app picks them up immediately.
- **PIN not password:** Kids need something simple. 4 digits is enough since this isn't sensitive data.
- **Streak resets on miss:** Keeps kids motivated to be consistent. Missing a day means starting over toward the bribe.
- **Repeatable streaks:** After earning a bribe, the streak resets and they can earn it again. Ongoing motivation.
- **Append-only log:** Simple, auditable. Parent can see every check-in in the spreadsheet.
