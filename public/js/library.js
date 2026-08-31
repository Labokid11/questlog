import { api } from "./api.js";

const STATUS_LABELS = {
  backlog: "Backlog",
  playing: "Playing",
  completed: "Completed",
  abandoned: "Abandoned",
};

let gamesCache = [];

export async function renderLibrary(main, user, onOpenGame) {
  main.innerHTML = `
    <div class="page-head">
      <div><h1>My Library</h1><div class="sub">Track every game you play.</div></div>
      <button class="btn-accent" id="addGameBtn">+ Add game</button>
    </div>
    <div id="libraryContent"><div class="empty"><div class="icon">▦</div><p>Loading…</p></div></div>`;

  await loadGames(main, user, onOpenGame);

  main.querySelector("#addGameBtn").onclick = () => openGameModal(main, user, null, () => loadGames(main, user, onOpenGame));
}

async function loadGames(main, user, onOpenGame) {
  const content = main.querySelector("#libraryContent");
  try {
    gamesCache = await api.games();
  } catch {
    content.innerHTML = `<div class="empty"><div class="icon">⚠</div><h3>Could not load library</h3><p>Try again in a moment.</p></div>`;
    return;
  }
  if (!gamesCache.length) {
    content.innerHTML = `
      <div class="empty">
        <div class="icon">🎮</div>
        <h3>Your library is empty</h3>
        <p>Add your first game to get started.</p>
        <button class="btn-accent" id="emptyAdd">+ Add game</button>
      </div>`;
    content.querySelector("#emptyAdd").onclick = () => openGameModal(main, user, null, () => loadGames(main, user, onOpenGame));
    return;
  }
  content.innerHTML = `<div class="game-grid">${gamesCache.map((g) => gameCard(g)).join("")}</div>`;
  content.querySelectorAll(".game-card").forEach((card) => {
    const id = card.dataset.id;
    card.querySelector(".edit-btn").onclick = (e) => { e.stopPropagation(); openGameModal(main, user, id, () => loadGames(main, user, onOpenGame)); };
    card.querySelector(".del-btn").onclick = (e) => { e.stopPropagation(); deleteGame(main, id, () => loadGames(main, user, onOpenGame)); };
    card.onclick = () => onOpenGame(id);
    card.style.cursor = "pointer";
  });
}

function gameCard(g) {
  const poster = g.posterUrl
    ? `<img src="${g.posterUrl}" alt="${escapeHtml(g.title)}" onerror="this.parentNode.innerHTML='<div class=\\'poster-fallback\\'>🎮</div>'" />`
    : `<div class="poster-fallback">🎮</div>`;
  const stars = g.rating ? "★".repeat(g.rating) + "☆".repeat(5 - g.rating) : "";
  return `
    <div class="game-card" data-id="${g._id}">
      <div class="poster">
        ${poster}
        <span class="status-badge status-${g.status}">${STATUS_LABELS[g.status]}</span>
        <div class="card-actions">
          <button class="edit-btn" title="Edit">✎</button>
          <button class="del-btn" title="Remove">🗑</button>
        </div>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(g.title)}</h3>
        <div class="platform">${g.platform ? escapeHtml(g.platform) : "—"}</div>
        ${g.progress > 0 ? `<div class="progress-row"><div class="progress-bar"><div style="width:${g.progress}%"></div></div><span>${g.progress}%</span></div>` : ""}
        ${stars ? `<div class="stars">${stars}</div>` : ""}
      </div>
    </div>`;
}

function openGameModal(main, user, id, onSaved) {
  const editing = id ? gamesCache.find((g) => g._id === id) : null;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h2>${editing ? "Edit game" : "Add game"}</h2>
      <form id="gameForm">
        <div class="field"><label>Title</label><input id="g-title" type="text" required value="${editing ? escapeHtml(editing.title) : ""}" /></div>
        <div class="row">
          <div class="field"><label>Platform</label><input id="g-platform" type="text" value="${editing ? escapeHtml(editing.platform) : ""}" placeholder="e.g. PC, PS5" /></div>
          <div class="field">
            <label>Status</label>
            <select id="g-status">
              ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${editing && editing.status === k ? "selected" : ""}>${v}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="row">
          <div class="field"><label>Progress %</label><input id="g-progress" type="number" min="0" max="100" value="${editing ? editing.progress : 0}" /></div>
          <div class="field"><label>Rating (0-5)</label><input id="g-rating" type="number" min="0" max="5" value="${editing ? editing.rating : 0}" /></div>
        </div>
        <div class="field"><label>Poster image URL (optional)</label><input id="g-posterurl" type="url" value="${editing && editing.posterUrl && !editing.posterUrl.startsWith("/uploads/") ? escapeHtml(editing.posterUrl) : ""}" placeholder="https://…" /></div>
        <div class="field"><label>Or upload a poster</label><input id="g-posterfile" type="file" accept="image/*" /></div>
        <div class="row">
          <div class="field"><label>Genre</label><input id="g-genre" type="text" value="${editing ? escapeHtml(editing.genre || "") : ""}" placeholder="e.g. RPG, Action" /></div>
          <div class="field"><label>Notes</label><input id="g-notes" type="text" value="${editing ? escapeHtml(editing.notes) : ""}" placeholder="Optional" /></div>
        </div>
        <div class="field"><label>Description</label><textarea id="g-description" rows="3" placeholder="What is this game about?">${editing ? escapeHtml(editing.description || "") : ""}</textarea></div>
        <div class="form-error" id="gError"></div>
        <div class="modal-footer">
          <button type="button" class="btn-ghost" id="gCancel">Cancel</button>
          <button type="submit" class="btn-accent">${editing ? "Save changes" : "Add game"}</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector("#gCancel").onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  overlay.querySelector("#gameForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = overlay.querySelector("#gError");
    errEl.textContent = "";
    const form = new FormData();
    form.append("title", overlay.querySelector("#g-title").value.trim());
    form.append("platform", overlay.querySelector("#g-platform").value.trim());
    form.append("status", overlay.querySelector("#g-status").value);
    form.append("progress", overlay.querySelector("#g-progress").value || 0);
    form.append("rating", overlay.querySelector("#g-rating").value || 0);
    form.append("notes", overlay.querySelector("#g-notes").value.trim());
    form.append("genre", overlay.querySelector("#g-genre").value.trim());
    form.append("description", overlay.querySelector("#g-description").value.trim());
    const file = overlay.querySelector("#g-posterfile").files[0];
    if (file) form.append("poster", file);
    else form.append("posterUrl", overlay.querySelector("#g-posterurl").value.trim());
    try {
      if (editing) await api.updateGame(editing._id, form);
      else await api.addGame(form);
      close();
      onSaved();
    } catch (err) {
      errEl.textContent = err.message;
    }
  };
}

async function deleteGame(main, id, onDone) {
  if (!confirm("Remove this game from your library?")) return;
  try {
    await api.deleteGame(id);
    onDone();
  } catch {
    alert("Could not delete game");
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
