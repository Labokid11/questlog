import { api } from "./api.js";

const ICONS = {
  added_game: "➕",
  started_game: "▶",
  updated_progress: "📊",
  finished_game: "✓",
  rated_game: "★",
  removed_game: "🗑",
  played_session: "⏱",
};

const LABELS = {
  added_game: "Added a game",
  started_game: "Started playing",
  updated_progress: "Updated progress",
  finished_game: "Finished a game",
  rated_game: "Rated a game",
  removed_game: "Removed a game",
  played_session: "Played a session",
};

export async function renderFeed(main, user) {
  main.innerHTML = `
    <div class="page-head">
      <div><h1>Activity Feed</h1><div class="sub">Your recent Questlog activity.</div></div>
    </div>
    <div id="feedContent"><div class="empty"><div class="icon">✦</div><p>Loading…</p></div></div>`;

  const content = main.querySelector("#feedContent");
  let activities;
  try {
    activities = await api.activities();
  } catch {
    content.innerHTML = `<div class="empty"><div class="icon">⚠</div><h3>Could not load feed</h3></div>`;
    return;
  }
  if (!activities.length) {
    content.innerHTML = `<div class="empty"><div class="icon">✦</div><h3>No activity yet</h3><p>Add or update games to see activity here.</p></div>`;
    return;
  }
  content.innerHTML = `<div class="feed">${activities.map(feedItem).join("")}</div>`;
}

function feedItem(a) {
  const icon = ICONS[a.type] || "•";
  const label = LABELS[a.type] || a.type;
  const text = a.description
    ? `<span>${escapeHtml(a.description)}</span>`
    : `<span>${label}${a.gameTitle ? " — " + escapeHtml(a.gameTitle) : ""}</span>`;
  return `
    <div class="feed-item">
      <div class="feed-icon fi-${a.type}">${icon}</div>
      <div class="feed-body">
        <div class="text"><strong>${label}</strong> ${text}</div>
        <div class="meta">${timeAgo(a.createdAt)}</div>
      </div>
    </div>`;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
