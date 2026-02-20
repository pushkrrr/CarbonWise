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
  default:          { icon: '🎖️',  desc: 'Achievement unlocked' },
};

const ALL_BADGES = Object.keys(BADGE_CONFIG).filter(k => k !== 'default');

async function loadGamification() {
  const container = document.getElementById('badgesContainer');
  const coinsEl   = document.getElementById('coinsNumber');
  const daysEl    = document.getElementById('gamDays');

  try {
    const data = await fetchGamification();

    if (coinsEl) animateCounter(coinsEl, 0, data.totalCoins || 0, 1000);
    if (daysEl)  daysEl.textContent = data.totalDays || 0;
    if (container) renderBadges(container, data.badges || []);

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
  // Build the grid HTML (all badges, earned + locked)
  const allItems = ALL_BADGES.map((badgeName) => {
    const earned = earnedBadges.includes(badgeName);
    const config = BADGE_CONFIG[badgeName] || BADGE_CONFIG.default;
    return { badgeName, earned, config };
  });

  // Append any custom earned badges not in our config
  earnedBadges.forEach(b => {
    if (!ALL_BADGES.includes(b)) {
      allItems.push({ badgeName: b, earned: true, config: BADGE_CONFIG.default });
    }
  });

  // Sort: earned first
  allItems.sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0));

  container.innerHTML = `<div class="badges-grid" id="badgesGrid"></div>`;
  const grid = container.querySelector('#badgesGrid');

  allItems.forEach(({ badgeName, earned, config }, i) => {
    const card = document.createElement('div');
    card.className = `badge-card ${earned ? '' : 'badge-locked'}`;
    card.dataset.badge = badgeName;
    card.innerHTML = `
      <span class="badge-icon">${config.icon}</span>
      <div class="badge-name">${badgeName}</div>
      <div class="text-sm text-muted" style="margin-top:4px; font-size:11px;">${config.desc}</div>
      ${earned
        ? '<div class="badge-status-earned">✓ Earned</div>'
        : '<div class="badge-status-locked">🔒 Locked</div>'
      }
    `;

    // Add style for status labels
    const style = document.createElement('style');
    if (!document.querySelector('#badgeStatusStyles')) {
      style.id = 'badgeStatusStyles';
      style.textContent = `
        .badge-status-earned { margin-top:8px; font-size:11px; color:var(--leaf); font-weight:600; }
        .badge-status-locked { margin-top:8px; font-size:11px; color:var(--text-light); }
      `;
      document.head.appendChild(style);
    }

    grid.appendChild(card);

    // Animate earned cards with 3D flip; locked cards fade-slide in
    if (earned) {
      if (typeof animateEarnedBadgeCard === 'function') {
        animateEarnedBadgeCard(card, i * 80);
      }
    } else {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(12px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      }, i * 55 + 100);
    }
  });
}

function animateCounter(el, from, to, duration) {
  const start = performance.now();
  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
    else el.classList.add('coin-earn-pulse');
  }
  requestAnimationFrame(update);
}
