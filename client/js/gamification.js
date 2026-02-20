// gamification.js

const BADGE_CONFIG = {
  'Green Starter':  { icon: '🌱', desc: 'Logged your first activity' },
  'Eco Warrior':    { icon: '⚔️',  desc: 'Low emissions 5 days in a row' },
  'Carbon Crusher': { icon: '💪',  desc: 'Reduced emissions by 50%' },
  'Plant Parent':   { icon: '🌿',  desc: 'Chose vegetarian meals all week' },
  'Solar Saver':    { icon: '☀️',  desc: 'Minimal electricity usage' },
  'Bike Champion':  { icon: '🚴',  desc: 'Zero car travel for a week' },
  'Recycler':       { icon: '♻️',  desc: 'Recycled waste consistently' },
  'Eco Master':     { icon: '🏆',  desc: 'Achieved eco score above 80' },
  // Fallback for unknown badges
  default:          { icon: '🎖️',  desc: 'Achievement unlocked' },
};

// All possible badges for the locked display
const ALL_BADGES = Object.keys(BADGE_CONFIG).filter(k => k !== 'default');

async function loadGamification() {
  const container = document.getElementById('badgesContainer');
  const coinsEl   = document.getElementById('coinsNumber');
  const daysEl    = document.getElementById('gamDays');

  try {
    const data = await fetchGamification();

    // Coins
    if (coinsEl) {
      animateCounter(coinsEl, 0, data.totalCoins || 0, 800);
    }

    // Days
    if (daysEl) {
      daysEl.textContent = data.totalDays || 0;
    }

    // Badges
    if (container) {
      renderBadges(container, data.badges || []);
    }
  } catch (err) {
    console.error('Gamification error:', err);
    if (container) {
      container.innerHTML = `<div class="error-state">
        <span class="error-icon">⚠️</span>
        <span>Could not load achievements. Is the server running?</span>
      </div>`;
    }
  }
}

function renderBadges(container, earnedBadges) {
  if (earnedBadges.length === 0 && ALL_BADGES.length === 0) {
    container.innerHTML = `<div class="no-data">
      <span class="no-data-icon">🏆</span>
      Log activities to start earning badges!
    </div>`;
    return;
  }

  // Show earned badges first, then locked
  const html = ALL_BADGES.map((badgeName, i) => {
    const earned  = earnedBadges.includes(badgeName);
    const config  = BADGE_CONFIG[badgeName] || BADGE_CONFIG.default;
    return `
      <div class="badge-card ${earned ? '' : 'badge-locked'}" style="animation-delay:${i * 0.06}s">
        <span class="badge-icon">${config.icon}</span>
        <div class="badge-name">${badgeName}</div>
        <div class="text-sm text-muted" style="margin-top:4px; font-size:11px;">${config.desc}</div>
        ${earned ? '<div style="margin-top:8px; font-size:11px; color:var(--leaf); font-weight:600;">✓ Earned</div>' : '<div style="margin-top:8px; font-size:11px; color:var(--text-light);">🔒 Locked</div>'}
      </div>
    `;
  }).join('');

  // Also show any custom badges not in config
  const customBadges = earnedBadges.filter(b => !ALL_BADGES.includes(b));
  const customHtml = customBadges.map((badgeName, i) => {
    const config = BADGE_CONFIG.default;
    return `
      <div class="badge-card" style="animation-delay:${(ALL_BADGES.length + i) * 0.06}s">
        <span class="badge-icon">${config.icon}</span>
        <div class="badge-name">${badgeName}</div>
        <div style="margin-top:8px; font-size:11px; color:var(--leaf); font-weight:600;">✓ Earned</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="badges-grid">${html}${customHtml}</div>`;
}

function animateCounter(el, from, to, duration) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
