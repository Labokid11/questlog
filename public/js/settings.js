import { api } from "./api.js";
import { THEMES, applyTheme, getTheme } from "./themes.js";

export async function renderSettings(main, user, onUserUpdate) {
  const isPro = user.premiumTier === "pro" || user.role === "admin";
  main.innerHTML = `
    <div class="page-head"><div><h1>Settings</h1><div class="sub">Manage your Premium, themes, and developer options.</div></div></div>

    <div class="settings-section">
      <h2>Questlog Premium</h2>
      <div class="premium-status ${isPro ? "is-pro" : "is-free"}">
        <div class="premium-status-icon">${isPro ? "★" : "🔒"}</div>
        <div>
          <div class="premium-status-title">${isPro ? "Premium Active" : "Free Tier"}</div>
          <div class="premium-status-sub">${isPro ? "You have access to all premium features." : "Unlock advanced stats, custom themes, unlimited friends and more."}</div>
        </div>
      </div>

      <div class="premium-features">
        <div class="premium-feature"><span class="pf-icon">📊</span> Advanced Stats <span class="pf-tag">Heatmaps, genre breakdown, streaks</span></div>
        <div class="premium-feature"><span class="pf-icon">🎨</span> Custom Themes <span class="pf-tag">Neon, Cyberpunk, Midnight, Sunset, Pixel</span></div>
        <div class="premium-feature"><span class="pf-icon">👥</span> Unlimited Friends <span class="pf-tag">Free tier limited to 5</span></div>
        <div class="premium-feature"><span class="pf-icon">🖼</span> Custom Game Covers <span class="pf-tag">Upload your own cover art</span></div>
        <div class="premium-feature"><span class="pf-icon">⚡</span> Early Access <span class="pf-tag">New features before everyone else</span></div>
      </div>

      <div class="field" style="margin-top:20px">
        <label>Enter a Premium Code</label>
        <div class="premium-code-row">
          <input type="text" id="premiumCode" placeholder="e.g. QUESTLOG-PRO" autocomplete="off" />
          <button class="btn-accent" id="unlockBtn">Unlock</button>
        </div>
        <div class="form-error" id="premiumMsg"></div>
      </div>

      <div class="dev-toggle">
        <div>
          <div class="dev-toggle-title">Developer Mode</div>
          <div class="dev-toggle-sub">Toggle Premium for testing (developer use).</div>
        </div>
        <label class="switch">
          <input type="checkbox" id="devToggle" ${isPro ? "checked" : ""} />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h2>Themes</h2>
      <div class="theme-grid" id="themeGrid"></div>
    </div>

    <div class="settings-section">
      <h2>Early Access Features</h2>
      <div class="early-access">
        <div class="ea-item ${isPro ? "" : "locked"}">
          <div class="ea-icon">🔮</div>
          <div><div class="ea-title">AI Game Recommendations</div><div class="ea-sub">Get personalized picks based on your library.</div></div>
          ${isPro ? "" : '<span class="lock-badge">🔒 Premium</span>'}
        </div>
        <div class="ea-item ${isPro ? "" : "locked"}">
          <div class="ea-icon">📈</div>
          <div><div class="ea-title">Yearly Wrapped</div><div class="ea-sub">Your gaming year in review.</div></div>
          ${isPro ? "" : '<span class="lock-badge">🔒 Premium</span>'}
        </div>
        <div class="ea-item ${isPro ? "" : "locked"}">
          <div class="ea-icon">🌐</div>
          <div><div class="ea-title">Social Leaderboards</div><div class="ea-sub">Compete with friends on playtime and completion.</div></div>
          ${isPro ? "" : '<span class="lock-badge">🔒 Premium</span>'}
        </div>
      </div>
    </div>`;

  // Unlock button
  main.querySelector("#unlockBtn").onclick = async () => {
    const msg = main.querySelector("#premiumMsg");
    msg.textContent = "";
    const code = main.querySelector("#premiumCode").value.trim();
    if (!code) {
      msg.textContent = "Please enter a code.";
      return;
    }
    try {
      const res = await api.unlockPremium(code);
      msg.style.color = "var(--green)";
      msg.textContent = res.message || "Premium unlocked!";
      onUserUpdate(res.user);
      setTimeout(() => renderSettings(main, res.user, onUserUpdate), 800);
    } catch (e) {
      msg.style.color = "var(--red)";
      msg.textContent = e.message;
    }
  };

  // Developer toggle
  main.querySelector("#devToggle").onchange = async (e) => {
    try {
      const res = await api.togglePremium();
      onUserUpdate(res.user);
      renderSettings(main, res.user, onUserUpdate);
    } catch (err) {
      alert(err.message);
      e.target.checked = !e.target.checked;
    }
  };

  // Theme grid
  const grid = main.querySelector("#themeGrid");
  grid.innerHTML = THEMES.map((t) => {
    const locked = t.premium && !isPro;
    const swatch = themeSwatch(t);
    return `<div class="theme-card ${locked ? "locked" : ""} ${user.theme === t.id ? "active" : ""}" data-theme="${t.id}">
      <div class="theme-swatch">${swatch}</div>
      <div class="theme-name">${t.name}${locked ? ' <span class="lock-mini">🔒</span>' : ""}${t.premium ? ' <span class="pro-tag">PRO</span>' : ""}</div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".theme-card").forEach((card) => {
    card.onclick = async () => {
      const id = card.dataset.theme;
      const theme = getTheme(id);
      if (theme.premium && !isPro) {
        alert("This is a Premium theme. Unlock Premium to use it.");
        return;
      }
      applyTheme(id);
      try {
        const res = await api.saveTheme(id);
        onUserUpdate(res.user);
      } catch {}
      grid.querySelectorAll(".theme-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    };
  });
}

function themeSwatch(theme) {
  const v = theme.vars;
  const bg = v["--bg"] || "#0e0f1a";
  const card = v["--bg-card"] || "#1c1f33";
  const accent = v["--accent"] || "#7c5cff";
  const accent2 = v["--accent-2"] || "#4cc9f0";
  return `<div class="swatch-preview" style="background:${bg}">
    <div class="swatch-card" style="background:${card};border-color:${v["--border"] || "#2c3050"}"></div>
    <div class="swatch-dot" style="background:${accent}"></div>
    <div class="swatch-dot" style="background:${accent2}"></div>
  </div>`;
}
