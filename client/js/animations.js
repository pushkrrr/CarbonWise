// animations.js — Coin burst & badge unlock animations for CarbonWise

/* ═══════════════════════════════════════════════════════════════
   COIN BURST
   Physics-based emoji particles that explode from an origin point
   ═══════════════════════════════════════════════════════════════ */

function triggerCoinBurst(originEl, amount = 0) {
  const count = Math.min(6 + Math.floor(amount / 3), 28);
  const rect  = originEl
    ? originEl.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };

  const originX = rect.left + rect.width  / 2;
  const originY = rect.top  + rect.height / 2 + window.scrollY;

  for (let i = 0; i < count; i++) {
    spawnCoin(originX, originY, i, count);
  }
}

function spawnCoin(x, y, index, total) {
  const coin = document.createElement('div');
  coin.className = 'coin-particle';
  coin.textContent = '🪙';
  document.body.appendChild(coin);

  // Random spread angle — fan upward and out
  const spread     = (Math.PI * 2);
  const angle      = (index / total) * spread - Math.PI / 2 + (Math.random() - 0.5) * 1.2;
  const speed      = 220 + Math.random() * 260;
  const gravity    = 480;
  const lifetime   = 900 + Math.random() * 400;
  const rotSpeed   = (Math.random() - 0.5) * 800;
  const startScale = 0.6 + Math.random() * 0.8;

  let vx       = Math.cos(angle) * speed;
  let vy       = Math.sin(angle) * speed;
  let posX     = x;
  let posY     = y;
  let rotation = Math.random() * 360;
  let elapsed  = 0;
  let lastTime = null;

  // Initial burst placement
  coin.style.cssText = `
    position: fixed;
    left: 0; top: 0;
    font-size: ${18 + Math.random() * 14}px;
    pointer-events: none;
    z-index: 99999;
    transform-origin: center;
    user-select: none;
    will-change: transform, opacity;
  `;

  function step(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += dt * 1000;

    vy       += gravity * dt;
    posX     += vx * dt;
    posY     += vy * dt;
    rotation += rotSpeed * dt;

    const progress = elapsed / lifetime;
    const opacity  = progress < 0.6 ? 1 : 1 - ((progress - 0.6) / 0.4);
    const scale    = startScale * (progress < 0.1
      ? progress / 0.1                          // pop in
      : 1 - progress * 0.3);                    // shrink out

    coin.style.transform = `translate(${posX - window.innerWidth / 2}px, ${posY - window.innerHeight / 2}px) rotate(${rotation}deg) scale(${Math.max(scale, 0)})`;
    coin.style.opacity   = Math.max(opacity, 0);
    coin.style.left      = '50vw';
    coin.style.top       = '50vh';

    // Use simpler absolute positioning
    coin.style.position  = 'fixed';
    coin.style.left      = posX + 'px';
    coin.style.top       = posY + 'px';
    coin.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${Math.max(scale, 0)})`;

    if (elapsed < lifetime) {
      requestAnimationFrame(step);
    } else {
      coin.remove();
    }
  }

  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING +COINS INDICATOR
   Small "+N 🪙" that floats up from the earn point
   ═══════════════════════════════════════════════════════════════ */

function triggerCoinFloater(originEl, amount) {
  if (!amount || amount <= 0) return;

  const rect = originEl
    ? originEl.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 3, width: 0, height: 0 };

  const floater = document.createElement('div');
  floater.className = 'coin-floater';
  floater.textContent = `+${amount} 🪙`;
  floater.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2}px;
    top:  ${rect.top + window.scrollY}px;
    transform: translate(-50%, 0);
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 700;
    color: #c9a84c;
    text-shadow: 0 2px 12px rgba(201,168,76,0.6);
    pointer-events: none;
    z-index: 99998;
    white-space: nowrap;
    animation: coinFloat 1.4s cubic-bezier(0.22,1,0.36,1) forwards;
  `;
  document.body.appendChild(floater);
  setTimeout(() => floater.remove(), 1500);
}

/* ═══════════════════════════════════════════════════════════════
   BADGE UNLOCK MODAL
   Cinematic full-screen takeover with rays, glow, particles
   ═══════════════════════════════════════════════════════════════ */

const BADGE_CONFIG_ANIM = {
  'Green Starter':  { icon: '🌱', color: '#4caf78',  glow: 'rgba(76,175,120,0.6)'  },
  'Eco Warrior':    { icon: '⚔️',  color: '#81c784',  glow: 'rgba(129,199,132,0.6)' },
  'Carbon Crusher': { icon: '💪',  color: '#66bb6a',  glow: 'rgba(102,187,106,0.6)' },
  'Plant Parent':   { icon: '🌿',  color: '#4caf78',  glow: 'rgba(76,175,120,0.6)'  },
  'Solar Saver':    { icon: '☀️',  color: '#ffd54f',  glow: 'rgba(255,213,79,0.6)'  },
  'Bike Champion':  { icon: '🚴',  color: '#4dd0e1',  glow: 'rgba(77,208,225,0.6)'  },
  'Recycler':       { icon: '♻️',  color: '#a5d6a7',  glow: 'rgba(165,214,167,0.6)' },
  'Eco Master':     { icon: '🏆',  color: '#c9a84c',  glow: 'rgba(201,168,76,0.7)'  },
  default:          { icon: '🎖️',  color: '#c9a84c',  glow: 'rgba(201,168,76,0.6)'  },
};

function triggerBadgeUnlock(badgeName, badgeDesc) {
  const cfg  = BADGE_CONFIG_ANIM[badgeName] || BADGE_CONFIG_ANIM.default;
  const desc = badgeDesc || 'Achievement unlocked!';

  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = 'badge-unlock-overlay';
  overlay.innerHTML = `
    <div class="buo-backdrop"></div>
    <div class="buo-rays"></div>
    <div class="buo-card">
      <div class="buo-label">🏅 Achievement Unlocked</div>
      <div class="buo-icon-wrap" style="--glow:${cfg.glow}; --color:${cfg.color}">
        <div class="buo-ring buo-ring-1"></div>
        <div class="buo-ring buo-ring-2"></div>
        <div class="buo-icon">${cfg.icon}</div>
      </div>
      <div class="buo-badge-name">${badgeName}</div>
      <div class="buo-badge-desc">${desc}</div>
      <button class="buo-dismiss">Awesome! ✨</button>
    </div>
    <div class="buo-particles" id="buoParticles"></div>
  `;

  document.body.appendChild(overlay);

  // Spawn star/sparkle particles around the badge card
  spawnBadgeParticles(overlay.querySelector('#buoParticles'));

  // Dismiss handlers
  const dismiss = () => {
    overlay.classList.add('buo-exit');
    setTimeout(() => overlay.remove(), 600);
  };
  overlay.querySelector('.buo-dismiss').addEventListener('click', dismiss);
  overlay.querySelector('.buo-backdrop').addEventListener('click', dismiss);

  // Auto-dismiss after 6s
  const autoTimer = setTimeout(dismiss, 6000);
  overlay.querySelector('.buo-dismiss').addEventListener('click', () => clearTimeout(autoTimer));
}

function spawnBadgeParticles(container) {
  const symbols = ['✦', '✧', '⋆', '★', '·', '✦', '⬡'];
  const colors  = ['#c9a84c','#4caf78','#a8d8b8','#ffd54f','#ffffff'];
  const count   = 24;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'buo-particle';

    const angle  = (i / count) * 360;
    const dist   = 120 + Math.random() * 100;
    const size   = 10 + Math.random() * 14;
    const delay  = Math.random() * 0.4;
    const dur    = 1.2 + Math.random() * 0.8;
    const sym    = symbols[Math.floor(Math.random() * symbols.length)];
    const color  = colors[Math.floor(Math.random() * colors.length)];

    p.textContent = sym;
    p.style.cssText = `
      position: absolute;
      left: 50%; top: 50%;
      font-size: ${size}px;
      color: ${color};
      transform-origin: 0 0;
      animation: buoParticleAnim ${dur}s ${delay}s cubic-bezier(0.22,1,0.36,1) forwards;
      --tx: ${Math.cos(angle * Math.PI / 180) * dist}px;
      --ty: ${Math.sin(angle * Math.PI / 180) * dist}px;
      pointer-events: none;
    `;
    container.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════════════
   BADGE CARD EARNED ANIMATION (Gamification page)
   Staggered 3-D card flip reveal for earned badges
   ═══════════════════════════════════════════════════════════════ */

function animateEarnedBadgeCard(cardEl, delay = 0) {
  cardEl.style.opacity   = '0';
  cardEl.style.transform = 'rotateY(90deg) scale(0.8)';

  setTimeout(() => {
    cardEl.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    cardEl.style.opacity    = '1';
    cardEl.style.transform  = 'rotateY(0deg) scale(1)';

    // Pulse glow after flip
    setTimeout(() => {
      cardEl.classList.add('badge-earned-glow');
    }, 500);
  }, delay);
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API — called from logActivity.js after successful log
   ═══════════════════════════════════════════════════════════════ */

function playEarnAnimations(result, originEl) {
  const coins = result.coins || 0;
  const badge = result.badge || null;

  if (coins > 0) {
    // Small delay so result card renders first
    setTimeout(() => {
      triggerCoinBurst(originEl, coins);
      triggerCoinFloater(originEl, coins);
    }, 350);
  }

  if (badge) {
    const cfg  = BADGE_CONFIG_ANIM[badge] || BADGE_CONFIG_ANIM.default;
    const desc = BADGE_DESCS[badge] || 'Achievement unlocked!';
    setTimeout(() => {
      triggerBadgeUnlock(badge, desc);
    }, coins > 0 ? 1200 : 400);
  }
}

const BADGE_DESCS = {
  'Green Starter':  'You logged your first activity!',
  'Eco Warrior':    'Low emissions 5 days in a row',
  'Carbon Crusher': 'Reduced your emissions by 50%',
  'Plant Parent':   'Chose vegetarian meals all week',
  'Solar Saver':    'Minimal electricity usage today',
  'Bike Champion':  'Zero car travel for a whole week',
  'Recycler':       'Recycled waste consistently',
  'Eco Master':     'Achieved an eco score above 80',
};
