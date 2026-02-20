const API_BASE = "http://localhost:5000/api";

async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

async function fetchActivities() {
  const res = await fetch(`${API_BASE}/activity`);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

async function fetchSuggestions() {
  const res = await fetch(`${API_BASE}/suggestions`);
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
}

async function fetchGamification() {
  const res = await fetch(`${API_BASE}/gamification`);
  if (!res.ok) throw new Error("Failed to fetch gamification data");
  return res.json();
}

async function logActivity(data) {
  const res = await fetch(`${API_BASE}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to log activity");
  return res.json();
}
