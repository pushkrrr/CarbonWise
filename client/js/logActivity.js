// logActivity.js — Fixed: reads actual form inputs instead of hardcoded values

document.getElementById("activityForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const resultEl  = document.getElementById("logResult");

  // Read actual form values
  const data = {
    travel: {
      carKm:  parseFloat(document.getElementById("carKm")?.value)  || 0,
      busKm:  parseFloat(document.getElementById("busKm")?.value)  || 0,
      flight: document.getElementById("flight")?.checked            || false,
    },
    electricity: {
      units:   parseFloat(document.getElementById("units")?.value)   || 0,
      acHours: parseFloat(document.getElementById("acHours")?.value) || 0,
    },
    food: {
      vegMeals:    parseInt(document.getElementById("vegMeals")?.value)    || 0,
      nonVegMeals: parseInt(document.getElementById("nonVegMeals")?.value) || 0,
    },
    lifestyle: {
      plasticUsage: parseInt(document.getElementById("plasticUsage")?.value) || 0,
      recycled:     document.getElementById("recycled")?.checked              || false,
    }
  };

  // Loading state
  submitBtn.disabled = true;
  submitBtn.textContent = "Calculating…";

  try {
    const result = await logActivity(data);

    // Show success result
    if (resultEl) {
      const emissionClass = result.totalEmission > 20 ? 'emission-high' :
                            result.totalEmission > 10 ? 'emission-mid'  : 'emission-low';

      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="card" style="border-color: rgba(76,175,120,0.3); animation: fadeUp 0.4s ease;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
            <span style="font-size:32px;">🌿</span>
            <div>
              <div class="font-serif" style="font-size:20px; font-weight:700; color:var(--forest);">Activity Logged!</div>
              <div class="text-sm text-muted">Here are your results</div>
            </div>
          </div>
          <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
            <div>
              <div class="text-muted text-sm">CO₂ Emissions</div>
              <div class="font-serif" style="font-size:26px; font-weight:700; color:var(--forest); margin-top:4px;">
                <span class="emission-pill ${emissionClass}">${result.totalEmission} kg</span>
              </div>
            </div>
            <div>
              <div class="text-muted text-sm">Eco Score</div>
              <div class="font-serif" style="font-size:26px; font-weight:700; color:var(--forest); margin-top:4px;">${result.ecoScore || '—'}</div>
            </div>
            <div>
              <div class="text-muted text-sm">Coins Earned</div>
              <div class="font-serif" style="font-size:26px; font-weight:700; color:var(--earth); margin-top:4px;">🪙 ${result.coins || 0}</div>
            </div>
            ${result.badge ? `
            <div>
              <div class="text-muted text-sm">Badge Earned</div>
              <div style="font-size:20px; margin-top:6px;">${result.badge}</div>
            </div>
            ` : ''}
          </div>
          <div class="divider"></div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" style="font-size:13px; padding:10px 20px;" onclick="navigateTo('dashboard')">
              View Dashboard
            </button>
            <button class="btn btn-ghost" style="font-size:13px; padding:10px 20px; border-color:rgba(45,122,79,0.3); color:var(--text-mid);" onclick="document.getElementById('activityForm').reset(); document.getElementById('logResult').style.display='none';">
              Log Another
            </button>
          </div>
        </div>
      `;
    }

    showToast("Activity logged successfully! 🌿", "success");

    // Reload dashboard data in background
    if (window._dashboardLoaded) {
      loadDashboardData();
    }

  } catch (err) {
    console.error("Log activity error:", err);

    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="card" style="border-color: rgba(192,57,43,0.3);">
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <span>Failed to log activity. Please ensure the server is running at <strong>localhost:5000</strong>.</span>
          </div>
        </div>
      `;
    }

    showToast("Failed to log activity. Check server connection.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Calculate & Log 🌿";
  }
});

// Reset button
document.getElementById("resetBtn")?.addEventListener("click", () => {
  document.getElementById("activityForm")?.reset();
  const resultEl = document.getElementById("logResult");
  if (resultEl) resultEl.style.display = 'none';
});
