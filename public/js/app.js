import { api, getToken } from "./api.js";
import { renderAuth, renderOnboarding } from "./auth.js";
import { renderLibrary } from "./library.js";
import { renderFeed } from "./feed.js";
import { renderDetails } from "./details.js";
import { renderStats } from "./stats.js";
import { renderFriends } from "./friends.js";
import { renderSettings } from "./settings.js";
import { renderAdmin } from "./admin.js";
import { applyTheme } from "./themes.js";

let user = null;
let view = { name: "library", gameId: null };

async function bootstrap() {
  if (getToken()) {
    try {
      user = await api.me();
    } catch {
      localStorage.removeItem("ql_token");
    }
  }
  // Secret unlock link: /?unlock=CODE
  const unlockCode = new URLSearchParams(window.location.search).get("unlock");
  if (unlockCode && user) {
    try {
      const res = await api.unlockPremium(unlockCode);
      user = res.user;
    } catch {}
    window.history.replaceState({}, "", "/");
  }
  if (user) applyTheme(user.theme || "default");
  render();
}

function logout() {
  localStorage.removeItem("ql_token");
  user = null;
  applyTheme("default");
  render();
}

function go(name, gameId = null) {
  view = { name, gameId };
  render();
}

function updateUser(u) {
  user = u;
  applyTheme(user.theme || "default");
  render();
}

function render() {
  const app = document.getElementById("app");
  if (!user) {
    renderAuth(app, (u) => {
      user = u;
      applyTheme(user.theme || "default");
      render();
    });
    return;
  }
  if (!user.onboarded) {
    renderOnboarding(app, user, (u) => {
      user = u;
      render();
    });
    return;
  }
  renderShell(app);
}

const NAV = [
  { name: "library", icon: "▦", label: "My library" },
  { name: "feed", icon: "✦", label: "Activity" },
  { name: "stats", icon: "▣", label: "Stats" },
  { name: "friends", icon: "♧", label: "Friends" },
  { name: "profile", icon: "◉", label: "Profile" },
  { name: "settings", icon: "⚙", label: "Settings" },
];

function renderShell(app) {
  const navItems = [...NAV];
  if (user.role === "admin") navItems.push({ name: "admin", icon: "🛡", label: "Admin" });
  const activeNav = view.name === "details" ? "library" : view.name;
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">Q</span><span>questlog</span></div>
        <nav>
          ${navItems.map((n) => `<a class="nav-item ${activeNav === n.name ? "active" : ""}" data-view="${n.name}"><span>${n.icon}</span> ${n.label}</a>`).join("")}
        </nav>
        <div class="sidebar-spacer"></div>
        <button class="logout-btn" id="logoutBtn">⏻ Log out</button>
      </aside>
      <main class="main" id="mainView"></main>
    </div>`;

  app.querySelector("#logoutBtn").onclick = logout;
  app.querySelectorAll(".nav-item").forEach((el) => {
    el.onclick = (e) => {
      e.preventDefault();
      go(el.dataset.view);
    };
  });

  const main = app.querySelector("#mainView");
  if (view.name === "library") renderLibrary(main, user, (gid) => go("details", gid));
  else if (view.name === "details") renderDetails(main, user, view.gameId, () => go("library"));
  else if (view.name === "feed") renderFeed(main, user);
  else if (view.name === "stats") renderStats(main, user);
  else if (view.name === "friends") renderFriends(main, user);
  else if (view.name === "settings") renderSettings(main, user, updateUser);
  else if (view.name === "admin" && user.role === "admin") renderAdmin(main, user, updateUser);
  else renderProfile(main, user);
}

async function renderProfile(main, user) {
  let games = [];
  try {
    games = await api.games();
  } catch {}
  const completed = games.filter((g) => g.status === "completed").length;
  const playing = games.filter((g) => g.status === "playing").length;
  const isPro = user.premiumTier === "pro" || user.role === "admin";
  main.innerHTML = `
    <div class="page-head"><div><h1>Profile</h1><div class="sub">Your Questlog identity.</div></div></div>
    <div class="profile-card">
      <div class="profile-head">
        <div class="profile-avatar">${user.avatar || "🎮"}</div>
        <div>
          <h2>${escapeHtml(user.username)}</h2>
          <div class="email">${escapeHtml(user.email)}</div>
          <div class="profile-badges">
            ${isPro ? '<span class="badge badge-premium">★ Premium</span>' : '<span class="badge badge-free">Free</span>'}
            ${user.role === "admin" ? '<span class="badge badge-admin">🛡 Admin</span>' : ""}
          </div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat"><div class="num">${games.length}</div><div class="label">Games</div></div>
        <div class="stat"><div class="num">${playing}</div><div class="label">Playing</div></div>
        <div class="stat"><div class="num">${completed}</div><div class="label">Completed</div></div>
      </div>
      <div class="profile-detail">Favourite platform: <span>${user.favouritePlatform || "—"}</span></div>
      <div class="profile-detail">Plan: <span>${isPro ? "Premium" : "Free"}</span></div>
      <div class="profile-detail">Member since: <span>${new Date().toLocaleDateString()}</span></div>
    </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

bootstrap();
