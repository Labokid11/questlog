import { api } from "./api.js";

export async function renderAdmin(main, user, onUserUpdate) {
  main.innerHTML = `
    <div class="page-head">
      <div><h1>Admin Panel</h1><div class="sub">Manage users and view app analytics.</div></div>
      <span class="admin-badge">Admin</span>
    </div>

    <div id="adminAnalytics" class="admin-analytics"><p class="muted">Loading analytics…</p></div>

    <div class="admin-section">
      <h2>User Management</h2>
      <div id="adminUsers"><p class="muted">Loading users…</p></div>
    </div>

    <div class="admin-section">
      <h2>Experimental Features</h2>
      <div class="experimental-grid">
        <div class="exp-card"><div class="exp-icon">🧪</div><h3>Bulk Import</h3><p>Import games from a CSV or IGDB list.</p></div>
        <div class="exp-card"><div class="exp-icon">📨</div><h3>Push Notifications</h3><p>Notify users of new features.</p></div>
        <div class="exp-card"><div class="exp-icon">🏷</div><h3>Tag System</h3><p>Custom tags beyond genre.</p></div>
      </div>
    </div>`;

  await loadAnalytics(main);
  await loadUsers(main, user);
}

async function loadAnalytics(main) {
  const el = main.querySelector("#adminAnalytics");
  try {
    const a = await api.adminAnalytics();
    el.innerHTML = `
      <div class="admin-stat"><div class="as-num">${a.totalUsers}</div><div class="as-label">Total users</div></div>
      <div class="admin-stat"><div class="as-num">${a.proUsers}</div><div class="as-label">Premium users</div></div>
      <div class="admin-stat"><div class="as-num">${a.adminUsers}</div><div class="as-label">Admins</div></div>
      <div class="admin-stat"><div class="as-num">${a.totalGames}</div><div class="as-label">Games tracked</div></div>
      <div class="admin-stat"><div class="as-num">${a.totalSessions}</div><div class="as-label">Sessions logged</div></div>
      <div class="admin-stat"><div class="as-num">${a.totalActivities}</div><div class="as-label">Activities</div></div>`;
  } catch {
    el.innerHTML = `<p class="muted">Could not load analytics.</p>`;
  }
}

async function loadUsers(main, currentUser) {
  const el = main.querySelector("#adminUsers");
  try {
    const users = await api.adminUsers();
    el.innerHTML = `<div class="admin-user-list">${users
      .map(
        (u) => `<div class="admin-user-row" data-id="${u._id}">
          <div class="admin-user-avatar">${u.avatar || "🎮"}</div>
          <div class="admin-user-info">
            <div class="admin-user-name">${esc(u.username)} ${u.role === "admin" ? '<span class="role-tag admin">Admin</span>' : ""} ${u.premiumTier === "pro" ? '<span class="role-tag pro">Pro</span>' : '<span class="role-tag free">Free</span>'}</div>
            <div class="admin-user-meta">${esc(u.email)} · ${u.gameCount} games</div>
          </div>
          <div class="admin-user-actions">
            <button class="btn-ghost admin-premium-btn" data-id="${u._id}">${u.premiumTier === "pro" ? "Remove Premium" : "Grant Premium"}</button>
            <button class="btn-ghost admin-reset-btn" data-id="${u._id}">Reset Data</button>
            ${u._id !== currentUser._id ? `<button class="btn-danger-sm admin-delete-btn" data-id="${u._id}">Remove</button>` : ""}
          </div>
        </div>`
      )
      .join("")}</div>`;

    el.querySelectorAll(".admin-premium-btn").forEach((b) => (b.onclick = async () => {
      try {
        await api.adminTogglePremium(b.dataset.id);
        loadUsers(main, currentUser);
        loadAnalytics(main);
      } catch (e) { alert(e.message); }
    }));
    el.querySelectorAll(".admin-reset-btn").forEach((b) => (b.onclick = async () => {
      if (!confirm("Reset this user's games, sessions, and activities?")) return;
      try {
        await api.adminResetUser(b.dataset.id);
        loadUsers(main, currentUser);
        loadAnalytics(main);
      } catch (e) { alert(e.message); }
    }));
    el.querySelectorAll(".admin-delete-btn").forEach((b) => (b.onclick = async () => {
      if (!confirm("Permanently remove this user and all their data?")) return;
      try {
        await api.adminDeleteUser(b.dataset.id);
        loadUsers(main, currentUser);
        loadAnalytics(main);
      } catch (e) { alert(e.message); }
    }));
  } catch {
    el.innerHTML = `<p class="muted">Could not load users.</p>`;
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
