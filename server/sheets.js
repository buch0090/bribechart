const fs = require('fs');
const path = require('path');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const LOG_FILE = path.join(__dirname, '..', 'data', 'log.json');

/**
 * Fetch a public Google Sheet tab as parsed rows via CSV export.
 */
async function getRows(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet "${sheetName}": ${res.status}`);
  const csv = await res.text();
  return parseCsv(csv);
}

/**
 * Get all log entries — merges spreadsheet Log tab + local log file.
 * Spreadsheet is the source of truth, local file catches new check-ins
 * before they sync to the sheet.
 */
async function getLogs() {
  let sheetLogs = [];
  try {
    sheetLogs = await getRows('Log');
  } catch (e) {
    console.warn('Could not read Log sheet:', e.message);
  }

  const localLogs = getLocalLogs();

  // Merge: deduplicate by kid_name + chore_id + date
  const seen = new Set();
  const merged = [];

  for (const log of sheetLogs) {
    const key = `${log.kid_name}|${log.chore_id}|${log.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(log);
    }
  }

  for (const log of localLogs) {
    const key = `${log.kid_name}|${log.chore_id}|${log.date}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(log);
    }
  }

  return merged;
}

/**
 * Record a check-in: write to local log AND push to Google Sheet via Apps Script.
 */
async function appendLog(entry) {
  // Always save locally first (instant, reliable)
  const logs = getLocalLogs();
  logs.push(entry);
  saveLocalLogs(logs);

  // Then push to Google Sheet via Apps Script
  if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'your-apps-script-url-here') {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        redirect: 'follow',
      });
      if (res.ok) {
        // Successfully written to sheet — remove from local log to avoid duplicates
        const updated = getLocalLogs().filter(l =>
          !(l.kid_name === entry.kid_name && l.chore_id === entry.chore_id && l.date === entry.date)
        );
        saveLocalLogs(updated);
      }
    } catch (err) {
      console.warn('Apps Script write failed (saved locally):', err.message);
    }
  }
}

// --- CSV parsing ---

function parseCsv(csv) {
  const lines = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (ch === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current.length > 0) lines.push(current);
      current = '';
      if (ch === '\r' && csv[i + 1] === '\n') i++;
    } else {
      current += ch;
    }
  }
  if (current.length > 0) lines.push(current);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || '').trim();
    });
    return obj;
  });
}

function splitCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// --- Local log file (fallback + buffer) ---

function ensureLogFile() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]');
}

function getLocalLogs() {
  ensureLogFile();
  return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
}

function saveLocalLogs(logs) {
  ensureLogFile();
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

module.exports = { getRows, getLogs, appendLog };
