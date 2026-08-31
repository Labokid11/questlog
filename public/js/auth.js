import { api } from "./api.js";

const AVATARS = ["🎮", "🕹️", "👾", "🎯", "🏆", "⚡", "🔥", "🐉"];
const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Retro"];

export function renderAuth(container, onAuth) {
  let mode = "login";
  const draw = () => {
    container.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-card">
          <div class="brand"><span class="brand-mark">Q</span><span>questlog</span></div>
          <h1>${mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p class="sub">${mode === "login" ? "Log in to track your games." : "Start tracking your game life today."}</p>
          <div class="tabs">
            <button data-tab="login" class="${mode === "login" ? "active" : ""}">Log in</button>
            <button data-tab="signup" class="${mode === "signup" ? "active" : ""}">Sign up</button>
          </div>
          <form id="authForm">
            ${mode === "signup" ? `<div class="field"><label>Username</label><input id="username" type="text" autocomplete="username" placeholder="3+ characters" /></div>` : ""}
            <div class="field"><label>Email</label><input id="email" type="email" autocomplete="email" placeholder="you@example.com" /></div>
            <div class="field"><label>Password</label><input id="password" type="password" autocomplete="${mode === "login" ? "current-password" : "new-password"}" placeholder="6+ characters" /></div>
            <div class="form-error" id="authError"></div>
            <button type="submit" class="btn-primary">${mode === "login" ? "Log in" : "Create account"}</button>
          </form>
        </div>
      </div>`;

    container.querySelectorAll(".tabs button").forEach((b) => {
      b.onclick = () => {
        mode = b.dataset.tab;
        draw();
      };
    });

    container.querySelector("#authForm").onsubmit = async (e) => {
      e.preventDefault();
      const errEl = container.querySelector("#authError");
      errEl.textContent = "";
      const btn = container.querySelector('button[type="submit"]');
      btn.disabled = true;
      const email = container.querySelector("#email").value.trim();
      const password = container.querySelector("#password").value;
      try {
        let res;
        if (mode === "login") {
          res = await api.login({ email, password });
        } else {
          const username = container.querySelector("#username").value.trim();
          if (username.length < 3) throw new Error("Username must be at least 3 characters");
          if (password.length < 6) throw new Error("Password must be at least 6 characters");
          res = await api.signup({ email, password, username });
        }
        localStorage.setItem("ql_token", res.token);
        onAuth(res.user);
      } catch (err) {
        errEl.textContent = err.message;
        btn.disabled = false;
      }
    };
  };
  draw();
}

export function renderOnboarding(container, user, onDone) {
  let avatar = user.avatar || AVATARS[0];
  let platform = user.favouritePlatform || PLATFORMS[0];

  const draw = () => {
    container.innerHTML = `
      <div class="onboard-wrap">
        <div class="onboard-card">
          <div class="brand" style="margin-bottom:18px"><span class="brand-mark">Q</span><span>questlog</span></div>
          <h1>Set up your profile</h1>
          <p class="sub">Let's personalize your Questlog experience.</p>
          <div class="field"><label>Username</label><input id="ob-username" type="text" value="${user.username}" /></div>
          <label style="display:block;font-size:13px;font-weight:600;color:var(--text-dim);margin-bottom:10px">Pick your avatar</label>
          <div class="avatar-picker" id="avatarPicker">
            ${AVATARS.map((a) => `<div class="avatar-option ${a === avatar ? "selected" : ""}" data-avatar="${a}">${a}</div>`).join("")}
          </div>
          <label style="display:block;font-size:13px;font-weight:600;color:var(--text-dim);margin-bottom:10px">Favourite platform</label>
          <div class="platform-grid" id="platformPicker">
            ${PLATFORMS.map((p) => `<div class="platform-option ${p === platform ? "selected" : ""}" data-platform="${p}">${p}</div>`).join("")}
          </div>
          <div class="form-error" id="obError"></div>
          <button type="button" class="btn-primary" id="obSubmit">Finish setup</button>
        </div>
      </div>`;

    container.querySelectorAll(".avatar-option").forEach((el) => {
      el.onclick = () => {
        avatar = el.dataset.avatar;
        container.querySelectorAll(".avatar-option").forEach((o) => o.classList.remove("selected"));
        el.classList.add("selected");
      };
    });
    container.querySelectorAll(".platform-option").forEach((el) => {
      el.onclick = () => {
        platform = el.dataset.platform;
        container.querySelectorAll(".platform-option").forEach((o) => o.classList.remove("selected"));
        el.classList.add("selected");
      };
    });

    container.querySelector("#obSubmit").onclick = async () => {
      const errEl = container.querySelector("#obError");
      errEl.textContent = "";
      const username = container.querySelector("#ob-username").value.trim();
      if (username.length < 3) {
        errEl.textContent = "Username must be at least 3 characters";
        return;
      }
      try {
        const res = await api.onboarding({ username, avatar, favouritePlatform: platform });
        onDone(res.user);
      } catch (err) {
        errEl.textContent = err.message;
      }
    };
  };
  draw();
}
