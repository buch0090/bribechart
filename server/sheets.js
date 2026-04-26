const fs = require('fs');
const path = require('path');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const LOG_FILE = path.join(__dirname, '..', 'data', 'log.json');

/**
 * Fetch a public Google Sheet tab as parsed rows.
 * Uses the CSV export URL — no API key or credentials needed.
 */
async function getRows(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet "${sheetName}": ${res.status}`);
  const csv = await res.text();
  return parseCsv(csv);
}

function parseCsv(csv) {
  const lines = [];
  let current = '';
  let inQuotes = false;

  // Split into lines, respecting quoted newlines
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

// --- Local log file for check-ins ---

function ensureLogFile() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]');
}

function getLogs() {
  ensureLogFile();
  const raw = fs.readFileSync(LOG_FILE, 'utf-8');
  return JSON.parse(raw);
}

function appendLog(entry) {
  const logs = getLogs();
  logs.push(entry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

module.exports = { getRows, getLogs, appendLog };
