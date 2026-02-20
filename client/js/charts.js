// charts.js — Chart rendering utilities

let emissionTrendChartInstance = null;
let analyticsBarChartInstance = null;
let breakdownDonutChartInstance = null;
let ecoScoreTrendChartInstance = null;

const CHART_COLORS = {
  primary:    'rgba(45,122,79,1)',
  primaryFade:'rgba(45,122,79,0.15)',
  moss:       'rgba(76,175,120,1)',
  mossFade:   'rgba(76,175,120,0.12)',
  gold:       'rgba(201,168,76,1)',
  goldFade:   'rgba(201,168,76,0.15)',
  earth:      'rgba(139,111,71,1)',
  danger:     'rgba(192,57,43,0.7)',
  mist:       'rgba(168,216,184,0.6)',
};

const CHART_DEFAULTS = {
  font: { family: "'DM Sans', system-ui, sans-serif", size: 12 },
  color: '#6b8c76',
  borderColor: 'rgba(45,122,79,0.1)',
  gridColor: 'rgba(45,122,79,0.06)',
};

Chart.defaults.font.family = CHART_DEFAULTS.font.family;
Chart.defaults.font.size   = CHART_DEFAULTS.font.size;
Chart.defaults.color       = CHART_DEFAULTS.color;

function destroyChart(instance) {
  if (instance) { instance.destroy(); }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Dashboard: mini emission trend line
 */
function renderEmissionTrendChart(activities) {
  destroyChart(emissionTrendChartInstance);
  const canvas = document.getElementById('emissionTrendChart');
  if (!canvas) return;

  const recent = [...activities].slice(-10);
  const labels = recent.map(a => formatDate(a.createdAt || a.date));
  const values = recent.map(a => a.totalEmission || 0);

  emissionTrendChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'CO₂ (kg)',
        data: values,
        borderColor: CHART_COLORS.primary,
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(45,122,79,0.25)');
          gradient.addColorStop(1, 'rgba(45,122,79,0)');
          return gradient;
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d2b1a',
          titleColor: '#a8d8b8',
          bodyColor: '#f4f1e8',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: ctx => `${ctx.parsed.y.toFixed(2)} kg CO₂`
          }
        }
      },
      scales: {
        x: {
          grid: { color: CHART_DEFAULTS.gridColor },
          ticks: { maxTicksLimit: 6 }
        },
        y: {
          grid: { color: CHART_DEFAULTS.gridColor },
          ticks: { callback: v => v + ' kg' }
        }
      }
    }
  });
}

/**
 * Analytics: bar chart of emissions
 */
function renderAnalyticsBarChart(activities) {
  destroyChart(analyticsBarChartInstance);
  const canvas = document.getElementById('analyticsBarChart');
  if (!canvas) return;

  const recent = [...activities].slice(-14);
  const labels = recent.map(a => formatDate(a.createdAt || a.date));
  const values = recent.map(a => a.totalEmission || 0);

  analyticsBarChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'CO₂ (kg)',
        data: values,
        backgroundColor: values.map(v =>
          v > 20 ? 'rgba(192,57,43,0.65)' :
          v > 10 ? 'rgba(201,168,76,0.65)' :
                   'rgba(45,122,79,0.65)'
        ),
        borderColor: values.map(v =>
          v > 20 ? CHART_COLORS.danger :
          v > 10 ? CHART_COLORS.gold :
                   CHART_COLORS.primary
        ),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d2b1a',
          titleColor: '#a8d8b8',
          bodyColor: '#f4f1e8',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: ctx => `${ctx.parsed.y.toFixed(2)} kg CO₂`
          }
        }
      },
      scales: {
        x: { grid: { color: CHART_DEFAULTS.gridColor } },
        y: {
          grid: { color: CHART_DEFAULTS.gridColor },
          beginAtZero: true,
          ticks: { callback: v => v + ' kg' }
        }
      }
    }
  });
}

/**
 * Analytics: breakdown donut by category (latest entry)
 */
function renderBreakdownDonut(activity) {
  destroyChart(breakdownDonutChartInstance);
  const canvas = document.getElementById('breakdownDonutChart');
  if (!canvas) return;

  if (!activity) {
    canvas.parentElement.innerHTML = '<div class="no-data"><span class="no-data-icon">🍩</span>No activity data yet</div>';
    return;
  }

  const travel      = ((activity.travel?.carKm || 0) * 0.12) + ((activity.travel?.busKm || 0) * 0.04) + (activity.travel?.flight ? 90 : 0);
  const electricity = (activity.electricity?.units || 0) * 0.82;
  const food        = ((activity.food?.vegMeals || 0) * 1.5) + ((activity.food?.nonVegMeals || 0) * 6);
  const lifestyle   = (activity.lifestyle?.plasticUsage || 0) * 0.5;

  breakdownDonutChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Travel', 'Electricity', 'Food', 'Lifestyle'],
      datasets: [{
        data: [travel, electricity, food, lifestyle].map(v => +v.toFixed(2)),
        backgroundColor: [
          'rgba(45,122,79,0.8)',
          'rgba(201,168,76,0.8)',
          'rgba(76,175,120,0.8)',
          'rgba(139,111,71,0.8)',
        ],
        borderColor: '#f4f1e8',
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
          }
        },
        tooltip: {
          backgroundColor: '#0d2b1a',
          titleColor: '#a8d8b8',
          bodyColor: '#f4f1e8',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(2)} kg CO₂`
          }
        }
      }
    }
  });
}

/**
 * Analytics: eco score trend line
 */
function renderEcoScoreTrendChart(activities) {
  destroyChart(ecoScoreTrendChartInstance);
  const canvas = document.getElementById('ecoScoreTrendChart');
  if (!canvas) return;

  const recent = [...activities].slice(-10);
  const labels = recent.map(a => formatDate(a.createdAt || a.date));
  const scores = recent.map(a => a.ecoScore || 0);

  ecoScoreTrendChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Eco Score',
        data: scores,
        borderColor: CHART_COLORS.gold,
        backgroundColor: 'rgba(201,168,76,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.gold,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d2b1a',
          titleColor: '#a8d8b8',
          bodyColor: '#f4f1e8',
          padding: 12,
          cornerRadius: 10,
        }
      },
      scales: {
        x: { grid: { color: CHART_DEFAULTS.gridColor } },
        y: {
          grid: { color: CHART_DEFAULTS.gridColor },
          min: 0, max: 100,
        }
      }
    }
  });
}

/**
 * Animate eco score ring
 */
function animateEcoRing(score) {
  const ring = document.getElementById('ecoRingFill');
  const valueEl = document.getElementById('ecoRingValue');
  const labelEl = document.getElementById('ecoRingLabel');
  if (!ring) return;

  const clamped = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 60; // r=60 → ~377
  const offset = circumference - (clamped / 100) * circumference;

  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
    if (clamped >= 70) {
      ring.style.stroke = 'var(--moss)';
    } else if (clamped >= 40) {
      ring.style.stroke = 'var(--gold)';
    } else {
      ring.style.stroke = '#c0392b';
    }
  }, 200);

  if (valueEl) valueEl.textContent = Math.round(clamped);
  if (labelEl) {
    labelEl.textContent = clamped >= 70 ? '🌿 Excellent' :
                          clamped >= 40 ? '⚡ Good' : '⚠️ Needs Work';
  }
}
