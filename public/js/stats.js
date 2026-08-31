import { api } from "./api.js";

function fmtHours(min) {
  return `${Math.round((min / 60) * 10) / 10}h`;
}

export async function renderStats(main, user) {
  main.innerHTML = `<div class="empty"><div class="icon">▣</div><p>Loading stats…</p></div>`;
  let stats;
  try {
    stats = await api.stats();
  } catch {
    main.innerHTML = `<div class="empty"><div class="icon">⚠</div><h3>Could not load stats</h3></div>`;
    return;
  }
  draw(main, stats);
}

function draw(main, s) {
  const maxPlatform = Math.max(1, ...s.platforms.map((p) => p.minutes));
  const maxGenre = Math.max(1, ...s.genres.map((g) => g.minutes));
  const maxDaily = Math.max(1, ...s.dailySeries.map((d) => d.minutes));
  const statusTotal = Math.max(1, Object.values(s.statusBreakdown).reduce((a, b) => a + b, 0));

  main.innerHTML = `
    <div class="page-head"><div><h1>Stats & Analytics</h1><div class="sub">Your gaming habits at a glance.</div></div></div>

    <div class="stat-cards">
      <div class="stat-card"><div class="stat-icon">⏱</div><div class="stat-num">${s.totalHours}h</div><div class="stat-label">Hours played</div></div>
      <div class="stat-card"><div class="stat-icon">✓</div><div class="stat-num">${s.completed}</div><div class="stat-label">Games completed</div></div>
      <div class="stat-card"><div class="stat-icon">🎮</div><div class="stat-num">${s.platformsUsed}</div><div class="stat-label">Platforms used</div></div>
      <div class="stat-card"><div class="stat-icon">🏷</div><div class="stat-num">${s.genresPlayed}</div><div class="stat-label">Genres played</div></div>
      <div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-num">${s.currentStreak}</div><div class="stat-label">Day streak</div></div>
      <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-num">${s.longestStreak}</div><div class="stat-label">Best streak</div></div>
    </div>

    <div class="stats-grid">
      <div class="chart-card">
        <h3>Playtime last 14 days</h3>
        <div class="bar-chart daily-chart">
          ${s.dailySeries
            .map((d) => {
              const h = (d.minutes / maxDaily) * 100;
              const label = new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
              return `<div class="bar-col"><div class="bar-fill" style="height:${Math.max(h, 2)}%" title="${d.minutes} min"></div><span class="bar-label">${label}</span></div>`;
            })
            .join("")}
        </div>
      </div>

      <div class="chart-card">
        <h3>Hours by platform</h3>
        ${s.platforms.length ? s.platforms.map((p) => barRow(p.name, p.minutes, maxPlatform)).join("") : `<p class="muted">No data yet.</p>`}
      </div>

      <div class="chart-card">
        <h3>Hours by genre</h3>
        ${s.genres.length ? s.genres.map((g) => barRow(g.name, g.minutes, maxGenre)).join("") : `<p class="muted">No data yet.</p>`}
      </div>

      <div class="chart-card">
        <h3>Games by status</h3>
        ${Object.entries(s.statusBreakdown)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => {
            const pct = (v / statusTotal) * 100;
            return `<div class="bar-row"><span class="bar-row-label">${cap(k)}</span><div class="bar-track"><div class="bar-track-fill status-fill-${k}" style="width:${pct}%"></div></div><span class="bar-row-val">${v}</span></div>`;
          })
          .join("") || `<p class="muted">No games yet.</p>`}
      </div>
    </div>`;
}

function barRow(label, minutes, max) {
  const pct = (minutes / max) * 100;
  return `<div class="bar-row"><span class="bar-row-label">${esc(label)}</span><div class="bar-track"><div class="bar-track-fill" style="width:${pct}%"></div></div><span class="bar-row-val">${fmtHours(minutes)}</span></div>`;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
