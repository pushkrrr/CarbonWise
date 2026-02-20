// dashboard.js — Main controller for the CarbonWise Dashboard

// ─── Auth Gate ──────────────────────────────────────────────────
// Frontend-only mock auth. Redirect to login if no session exists.
(function checkAuth() {
  const session = localStorage.getItem('cw_session') || localStorage.getItem('carbonUser');
  if (!session) {
    window.location.href = 'login.html';
  }
})();

// Show logged-in user's name in sidebar & topbar
(function displayUser() {
  try {
    const session = JSON.parse(localStorage.getItem('cw_session'));
    if (!session) return;

    // Populate user info elements if present
    const nameEl  = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    if (nameEl)  nameEl.textContent  = session.name  || 'User';
    if (emailEl) emailEl.textContent = session.email || '';
  } catch {}
})();

window._dashboardLoaded = false;

// ─── Navigation ────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard:    'Dashboard',
  log:          'Log Activity',
  analytics:    'Analytics',
  gamification: 'Achievements',
  suggestions:  'AI Suggestions',
};

function navigateTo(page) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target section
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  // Highlight nav item
  const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Update title
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || page;

  // Close mobile sidebar
  closeSidebar();

  // Load page-specific data
  if (page === 'analytics') loadAnalyticsData();
  if (page === 'gamification') loadGamification();
  if (page === 'suggestions') loadSuggestions();

  // Scroll to top
  document.querySelector('.page-content')?.scrollTo(0, 0);
}

// Wire nav items
document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// ─── Toast Notifications ────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toastNotif');
  if (!toast) return;
  toast.textContent = '';
  const icon = type === 'success' ? '✅' : '⚠️';
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 4000);
}

// ─── Dashboard Data ─────────────────────────────────────────────
async function loadDashboardData() {
  try {
    const [analytics, activities, gamification] = await Promise.all([
      fetchAnalytics(),
      fetchActivities(),
      fetchGamification(),
    ]);

    // Stats
    setStatValue('statTotalEmission', `${analytics.totalEmission ?? 0}`, 'kg');
    setStatValue('statEcoScore', `${analytics.averageEmission ?? 0}`, 'avg');
    setStatValue('statCoins', `${analytics.totalCoins ?? gamification.totalCoins ?? 0}`, '🪙');
    setStatValue('statDays', `${analytics.daysTracked ?? gamification.totalDays ?? 0}`, 'days');

    // Eco ring (use averageEmission as 0–100 proxy, or clamp to 100)
    const avgEmission = analytics.averageEmission || 0;
    // Convert emission to eco score proxy: lower emission = higher eco score
    const ecoScoreFromEmission = Math.max(0, Math.min(100, 100 - (avgEmission * 2)));
    animateEcoRing(ecoScoreFromEmission);

    // Render emission trend chart
    if (activities && activities.length > 0) {
      renderEmissionTrendChart(activities);
    }

    // Recent activities table
    renderRecentActivities(activities);

    window._dashboardLoaded = true;
  } catch (err) {
    console.error('Dashboard load error:', err);
    showErrorInStats();
    showToast('Could not connect to server. Is it running on port 5000?', 'error');
  }
}

function setStatValue(id, value, unit) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `${value} <span>${unit}</span>`;
}

function showErrorInStats() {
  ['statTotalEmission', 'statEcoScore', 'statCoins', 'statDays'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<span style="font-size:14px; color:var(--danger);">Error</span>';
  });
  const tableEl = document.getElementById('recentActivitiesTable');
  if (tableEl) {
    tableEl.innerHTML = `<div class="error-state">
      <span class="error-icon">⚠️</span>
      <span>Server not reachable. Start your backend on <strong>port 5000</strong>.</span>
    </div>`;
  }
}

// ─── Recent Activities Table ────────────────────────────────────
function renderRecentActivities(activities) {
  const container = document.getElementById('recentActivitiesTable');
  if (!container) return;

  if (!activities || activities.length === 0) {
    container.innerHTML = `<div class="no-data">
      <span class="no-data-icon">📋</span>
      No activities logged yet. <button class="btn btn-ghost" style="font-size:13px;padding:8px 14px;border-color:rgba(45,122,79,0.3);color:var(--leaf);margin-left:8px;" onclick="navigateTo('log')">Log one now</button>
    </div>`;
    return;
  }

  const recent = [...activities].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 8);

  container.innerHTML = `
    <table class="activity-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>CO₂ Emissions</th>
          <th>Eco Score</th>
          <th>Coins</th>
          <th>Badge</th>
        </tr>
      </thead>
      <tbody>
        ${recent.map(a => {
          const emission = a.totalEmission || 0;
          const pillClass = emission > 20 ? 'emission-high' : emission > 10 ? 'emission-mid' : 'emission-low';
          const date = new Date(a.createdAt || a.date);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return `
            <tr>
              <td>${dateStr}</td>
              <td><span class="emission-pill ${pillClass}">${emission.toFixed(2)} kg</span></td>
              <td>${a.ecoScore || '—'}</td>
              <td>🪙 ${a.coins || 0}</td>
              <td>${a.badge || '—'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

// ─── Analytics Page ─────────────────────────────────────────────
async function loadAnalyticsData() {
  try {
    const [analytics, activities] = await Promise.all([
      fetchAnalytics(),
      fetchActivities(),
    ]);

    // Stat updates
    const anaTotal = document.getElementById('anaTotal');
    const anaAvg   = document.getElementById('anaAvg');
    const anaDays  = document.getElementById('anaDays');

    if (anaTotal) anaTotal.innerHTML = `${analytics.totalEmission ?? 0} <span>kg</span>`;
    if (anaAvg)   anaAvg.innerHTML   = `${analytics.averageEmission ?? 0} <span>kg</span>`;
    if (anaDays)  anaDays.innerHTML  = `${analytics.daysTracked ?? 0}`;

    // Charts
    renderAnalyticsBarChart(activities);
    renderBreakdownDonut(activities[activities.length - 1] || null);
    renderEcoScoreTrendChart(activities);

  } catch (err) {
    console.error('Analytics error:', err);
    showToast('Could not load analytics. Check server connection.', 'error');
  }
}

// ─── Suggestions ────────────────────────────────────────────────
async function loadSuggestions() {
  const container = document.getElementById('suggestionsContent');
  if (!container) return;

  container.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Generating AI suggestions…</span></div>';

  try {
    const data = await fetchSuggestions();
    renderSuggestions(container, data);
  } catch (err) {
    console.error('Suggestions error:', err);
    container.innerHTML = `<div class="error-state">
      <span class="error-icon">⚠️</span>
      <span>Could not load suggestions. Ensure Gemini API key is configured and server is running.</span>
    </div>`;
  }
}

function renderSuggestions(container, data) {
  if (!data || (!data.suggestions && !data.message)) {
    container.innerHTML = `<div class="no-data">
      <span class="no-data-icon">✨</span>
      Log some activities first to receive personalized AI suggestions!
    </div>`;
    return;
  }

  const raw = data.suggestions || data.message || '';

  // Parse suggestions into list items (split by newlines or numbered items)
  const lines = raw.split(/\n+/)
    .map(l => l.replace(/^[\d\.\-\*]+\s*/, '').trim())
    .filter(l => l.length > 15);

  if (lines.length === 0) {
    container.innerHTML = `<div style="padding:20px; color:var(--text-mid); line-height:1.8;">${raw}</div>`;
    return;
  }

  const icons = ['🌱', '⚡', '🚴', '🥗', '♻️', '☀️', '💧', '🌍', '🏡', '🚶'];

  container.innerHTML = lines.map((line, i) => `
    <div class="suggestion-item" style="animation-delay:${i * 0.07}s">
      <div class="suggestion-bullet">${icons[i % icons.length]}</div>
      <div class="suggestion-text">${line}</div>
    </div>
  `).join('');
}

// Refresh suggestions button
document.getElementById('refreshSuggestions')?.addEventListener('click', loadSuggestions);

// ─── Mobile Sidebar ─────────────────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('show');
}

document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

// ─── Logout ──────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('cw_session');
  localStorage.removeItem('carbonUser');
  window.location.href = 'login.html';
}
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});
