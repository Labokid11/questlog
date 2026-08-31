import { api, getToken } from "./api.js";
import { renderAuth, renderOnboarding } from "./auth.js";
import { renderLibrary } from "./library.js";
import { renderFeed } from "./feed.js";

let user = null;
let currentView = "library";

async function bootstrap() {
  if (getToken()) {
    try {
      user = await api.me();
    } catch {
      localStorage.removeItem("ql_token");
    }
  }
  render();
}

function logout() {
  localStorage.removeItem("ql_token");
  user = null;
  render();
}

function render() {
  const app = document.getElementById("app");
  if (!user) {
    renderAuth(app, (u) => {
      user = u;
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

function renderShell(app) {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">Q</span><span>questlog</span></div>
        <nav>
          <a class="nav-item ${currentView === "library" ? "active" : ""}" data-view="library"><span>▦</span> My library</a>
          <a class="nav-item ${currentView === "feed" ? "active" : ""}" data-view="feed"><span>✦</span> Activity</a>
          <a class="nav-item ${currentView === "profile" ? "active" : ""}" data-view="profile"><span>◉</span> Profile</a>
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
      currentView = el.dataset.view;
      render();
    };
  });

  const main = app.querySelector("#mainView");
  if (currentView === "library") renderLibrary(main, user, () => (currentView = "feed"));
  else if (currentView === "feed") renderFeed(main, user);
  else renderProfile(main, user);
}

async function renderProfile(main, user) {
  let games = [];
  try {
    games = await api.games();
  } catch {}
  const completed = games.filter((g) => g.status === "completed").length;
  const playing = games.filter((g) => g.status === "playing").length;
  main.innerHTML = `
    <div class="page-head"><div><h1>Profile</h1><div class="sub">Your Questlog identity.</div></div></div>
    <div class="profile-card">
      <div class="profile-head">
        <div class="profile-avatar">${user.avatar || "🎮"}</div>
        <div>
          <h2>${escapeHtml(user.username)}</h2>
          <div class="email">${escapeHtml(user.email)}</div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat"><div class="num">${games.length}</div><div class="label">Games</div></div>
        <div class="stat"><div class="num">${playing}</div><div class="label">Playing</div></div>
        <div class="stat"><div class="num">${completed}</div><div class="label">Completed</div></div>
      </div>
      <div class="profile-detail">Favourite platform: <span>${user.favouritePlatform || "—"}</span></div>
      <div class="profile-detail">Member since: <span>${new Date().toLocaleDateString()}</span></div>
    </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

bootstrap();
