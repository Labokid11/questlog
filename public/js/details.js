import { api } from "./api.js";

const STATUS_LABELS = {
  backlog: "Backlog",
  playing: "Playing",
  completed: "Completed",
  abandoned: "Abandoned",
};

function fmtHours(min) {
  const h = Math.round((min / 60) * 10) / 10;
  if (h < 1) return `${min} min`;
  return `${h}h`;
}

export async function renderDetails(main, user, gameId, onBack) {
  main.innerHTML = `<div class="empty"><div class="icon">▦</div><p>Loading game…</p></div>`;
  let game;
  try {
    game = await api.getGame(gameId);
  } catch {
    main.innerHTML = `<div class="empty"><div class="icon">⚠</div><h3>Game not found</h3><button class="btn-accent" id="backBtn">Back to library</button></div>`;
    main.querySelector("#backBtn").onclick = onBack;
    return;
  }
  draw(main, user, game, onBack);
}

async function draw(main, user, game, onBack) {
  const poster = game.posterUrl
    ? `<img src="${game.posterUrl}" alt="${esc(game.title)}" onerror="this.style.display='none'" />`
    : `<div class="poster-fallback">🎮</div>`;
  const stars = game.rating ? "★".repeat(game.rating) + "☆".repeat(5 - game.rating) : "Not rated";

  main.innerHTML = `
    <button class="back-btn" id="backBtn">← Back to library</button>
    <div class="details-layout">
      <div class="details-poster">
        <div class="poster">${poster}
          <span class="status-badge status-${game.status}">${STATUS_LABELS[game.status]}</span>
        </div>
      </div>
      <div class="details-info">
        <h1 class="details-title">${esc(game.title)}</h1>
        <div class="details-meta">
          ${game.platform ? `<span class="chip">🎮 ${esc(game.platform)}</span>` : ""}
          ${game.genre ? `<span class="chip">🏷 ${esc(game.genre)}</span>` : ""}
          <span class="chip">⭐ ${stars}</span>
        </div>
        ${game.description ? `<p class="details-desc">${esc(game.description)}</p>` : `<p class="details-desc muted">No description yet — edit this game to add one.</p>`}
        <div class="playtime-box">
          <div class="playtime-num">${fmtHours(game.totalMinutes || 0)}</div>
          <div class="playtime-label">total playtime</div>
        </div>
        <button class="btn-accent" id="addSessionBtn">+ Add session</button>
        <div id="sessionForm"></div>
      </div>
    </div>

    <div class="details-section">
      <h3>Progress</h3>
      <div class="progress-control">
        <input type="range" id="progressSlider" min="0" max="100" value="${game.progress}" />
        <span id="progressVal">${game.progress}%</span>
      </div>
    </div>

    <div class="details-section">
      <h3>Notes</h3>
      <textarea id="notesArea" rows="4" placeholder="Add your thoughts about this game…">${esc(game.notes || "")}</textarea>
      <button class="btn-ghost" id="saveNotesBtn" style="margin-top:10px">Save notes</button>
    </div>

    <div class="details-section">
      <h3>Play sessions</h3>
      <div id="sessionsList"></div>
    </div>`;

  main.querySelector("#backBtn").onclick = onBack;

  // Progress slider
  const slider = main.querySelector("#progressSlider");
  const pval = main.querySelector("#progressVal");
  let saveTimer;
  slider.oninput = () => (pval.textContent = `${slider.value}%`);
  slider.onchange = async () => {
    try {
      await api.updateGameJson(game._id, { progress: Number(slider.value) });
    } catch {}
  };

  // Notes
  main.querySelector("#saveNotesBtn").onclick = async () => {
    const btn = main.querySelector("#saveNotesBtn");
    try {
      await api.updateGameJson(game._id, { notes: main.querySelector("#notesArea").value });
      btn.textContent = "Saved ✓";
      setTimeout(() => (btn.textContent = "Save notes"), 1500);
    } catch {
      btn.textContent = "Error";
    }
  };

  // Add session
  main.querySelector("#addSessionBtn").onclick = () => {
    const form = main.querySelector("#sessionForm");
    form.innerHTML = `
      <div class="session-form">
        <input type="number" id="sessMinutes" min="1" placeholder="Minutes" />
        <input type="date" id="sessDate" value="${new Date().toISOString().slice(0, 10)}" />
        <button class="btn-accent" id="sessSave">Log</button>
        <button class="btn-ghost" id="sessCancel">Cancel</button>
      </div>`;
    form.querySelector("#sessSave").onclick = async () => {
      const mins = Number(form.querySelector("#sessMinutes").value);
      if (!mins || mins < 1) return;
      try {
        await api.addSession(game._id, { minutes: mins, date: form.querySelector("#sessDate").value });
        form.innerHTML = "";
        const updated = await api.getGame(game._id);
        draw(main, user, updated, onBack);
      } catch (e) {
        alert(e.message);
      }
    };
    form.querySelector("#sessCancel").onclick = () => (form.innerHTML = "");
  };

  // Sessions list
  const list = main.querySelector("#sessionsList");
  const sessions = game.sessions || [];
  if (!sessions.length) {
    list.innerHTML = `<p class="muted">No sessions logged yet. Add one to start tracking playtime.</p>`;
  } else {
    list.innerHTML = `<div class="session-list">${sessions
      .map((s) => `<div class="session-item"><span class="sess-date">${new Date(s.date).toLocaleDateString()}</span><span class="sess-mins">${fmtHours(s.minutes)}</span></div>`)
      .join("")}</div>`;
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
