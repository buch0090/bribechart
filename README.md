# 💰 Bribe Tracker

A fun, kid-friendly chore tracking app powered by a public Google Spreadsheet!

## Setup

### 1. Create the Google Spreadsheet

Create a new Google Spreadsheet with three sheet tabs:

#### Sheet: `Kids`
| name | avatar | pin |
|------|--------|-----|
| Emma | 🦄 | 1234 |
| Jack | 🦊 | 5678 |

#### Sheet: `Chores`
| id | title | description | frequency | streak_goal | bribe_amount | emoji | assigned_to |
|----|-------|-------------|-----------|-------------|--------------|-------|-------------|
| chore-1 | Make Your Bed | Neatly make bed before school | daily | 7 | 5.00 | 🛏️ | all |
| chore-2 | Clean Your Room | Pick up toys and vacuum | weekly | 4 | 10.00 | 🧹 | all |
| chore-3 | Clean Bathroom | Scrub sink, toilet, mirror | weekly | 4 | 8.00 | 🚿 | Emma |
| chore-4 | 30 Pushups | Do 30 pushups | daily | 7 | 5.00 | 💪 | Jack |

#### Sheet: `Log`
| timestamp | kid_name | chore_id | date | status |
|-----------|----------|----------|------|--------|

(Leave the Log sheet with just the header row — it's not used but keeps the structure consistent.)

### 2. Publish the Spreadsheet

1. In your spreadsheet, go to **File → Share → Publish to web**
2. Select **Entire Document** and **CSV** format
3. Click **Publish**
4. Also make sure the sheet is shared as **"Anyone with the link"** (Viewer)

### 3. Configure

Copy the spreadsheet ID from the URL:
```
https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
```

Edit `.env`:
```
GOOGLE_SHEET_ID=your-spreadsheet-id-here
PORT=3001
```

### 4. Install & Run

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

Open **http://localhost:5173** 🎉

## How It Works

- **Parents** add/edit kids and chores directly in the Google Spreadsheet — changes show up in the app immediately
- **Kids** open the app, tap their name, enter their PIN, and check off completed chores
- **Check-ins** are saved locally in `data/log.json` on the server
- **Streaks** are tracked automatically — complete a daily chore 7 days straight (or however many the `streak_goal` says) to earn the bribe!
- **Bribe Bank** shows total earnings per kid
- **Leaderboard** shows who's crushing it

## Tech Stack

- **Backend:** Node.js + Express (reads public Google Sheet as CSV, stores check-ins in local JSON)
- **Frontend:** React + Vite + Framer Motion + canvas-confetti
- **Database:** A Google Spreadsheet for config + a JSON file for check-ins
