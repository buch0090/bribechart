const BASE = '/api';

export async function fetchKids() {
  const res = await fetch(`${BASE}/kids`);
  if (!res.ok) throw new Error('Failed to load kids');
  return res.json();
}

export async function login(name, pin) {
  const res = await fetch(`${BASE}/kids/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pin }),
  });
  if (res.status === 401) throw new Error('Wrong PIN!');
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function fetchChores(kidName) {
  const res = await fetch(`${BASE}/chores/${encodeURIComponent(kidName)}`);
  if (!res.ok) throw new Error('Failed to load chores');
  return res.json();
}

export async function checkin(kidName, choreId) {
  const res = await fetch(`${BASE}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kid_name: kidName, chore_id: choreId }),
  });
  if (res.status === 409) return { alreadyDone: true };
  if (!res.ok) throw new Error('Check-in failed');
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${BASE}/leaderboard`);
  if (!res.ok) throw new Error('Failed to load leaderboard');
  return res.json();
}
