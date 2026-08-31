import { api } from "./api.js";

let friendsCache = [];

export async function renderFriends(main, user) {
  main.innerHTML = `
    <div class="page-head">
      <div><h1>Friends</h1><div class="sub">Follow other players and compare progress.</div></div>
    </div>
    <div class="friends-add">
      <input type="text" id="friendSearch" placeholder="Search by username…" autocomplete="off" />
      <div id="searchResults" class="search-results"></div>
    </div>
    <div id="friendsList"><div class="empty"><div class="icon">♧</div><p>Loading…</p></div></div>
    <div id="friendDetail"></div>`;

  setupSearch(main);
  await loadFriends(main);
}

async function loadFriends(main) {
  const list = main.querySelector("#friendsList");
  try {
    friendsCache = await api.friends();
  } catch {
    list.innerHTML = `<div class="empty"><div class="icon">⚠</div><h3>Could not load friends</h3></div>`;
    return;
  }
  if (!friendsCache.length) {
    list.innerHTML = `<div class="empty"><div class="icon">♧</div><h3>No friends yet</h3><p>Search above to add your first friend.</p></div>`;
    return;
  }
  list.innerHTML = `<div class="friends-grid">${friendsCache
    .map(
      (f) => `<div class="friend-card" data-id="${f._id}">
        <div class="friend-avatar">${f.avatar || "🎮"}</div>
        <div class="friend-info"><h3>${esc(f.username)}</h3><div class="friend-meta">${f.gameCount} games · ${f.completed} completed</div></div>
        <div class="friend-actions">
          <button class="btn-ghost view-btn" data-id="${f._id}">View</button>
          <button class="btn-danger-sm unfollow-btn" data-id="${f._id}">Unfollow</button>
        </div>
      </div>`
    )
    .join("")}</div>`;

  list.querySelectorAll(".view-btn").forEach((b) => (b.onclick = () => openFriend(main, b.dataset.id)));
  list.querySelectorAll(".unfollow-btn").forEach((b) =>
    (b.onclick = async () => {
      await api.unfollow(b.dataset.id);
      loadFriends(main);
    })
  );
}

function setupSearch(main) {
  const input = main.querySelector("#friendSearch");
  const results = main.querySelector("#searchResults");
  let timer;
  input.oninput = () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) {
      results.innerHTML = "";
      return;
    }
    timer = setTimeout(async () => {
      try {
        const users = await api.searchUsers(q);
        if (!users.length) {
          results.innerHTML = `<div class="search-empty">No users found.</div>`;
          return;
        }
        results.innerHTML = users
          .map(
            (u) => `<div class="search-item"><span class="search-avatar">${u.avatar || "🎮"}</span><span class="search-name">${esc(u.username)}</span><button class="btn-accent add-friend-btn" data-id="${u._id}">Add</button></div>`
          )
          .join("");
        results.querySelectorAll(".add-friend-btn").forEach((b) =>
          (b.onclick = async () => {
            try {
              await api.follow(b.dataset.id);
              b.textContent = "Added ✓";
              b.disabled = true;
              loadFriends(main);
            } catch (e) {
              alert(e.message);
            }
          })
        );
      } catch {}
    }, 300);
  };
}

async function openFriend(main, friendId) {
  const detail = main.querySelector("#friendDetail");
  const friend = friendsCache.find((f) => f._id === friendId);
  detail.innerHTML = `<div class="modal-overlay" id="friendOverlay"><div class="modal friend-modal"><div class="friend-modal-head"><div class="friend-avatar lg">${friend?.avatar || "🎮"}</div><h2>${esc(friend?.username || "Friend")}</h2><button class="btn-ghost" id="closeFriend">Close</button></div><div id="friendTabs" class="friend-tabs"><button class="ftab active" data-tab="library">Library</button><button class="ftab" data-tab="activity">Activity</button><button class="ftab" data-tab="compare">Compare</button></div><div id="friendContent"><p class="muted">Loading…</p></div></div></div>`;
  document.body.appendChild(detail.querySelector("#friendOverlay"));
  // Actually render into the overlay properly:
  const overlay = detail.querySelector("#friendOverlay");
  overlay.querySelector("#closeFriend").onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  let tab = "library";
  const loadTab = async () => {
    const content = overlay.querySelector("#friendContent");
    content.innerHTML = `<p class="muted">Loading…</p>`;
    try {
      if (tab === "library") {
        const games = await api.friendLibrary(friendId);
        content.innerHTML = games.length
          ? `<div class="friend-game-grid">${games.map((g) => `<div class="friend-game"><div class="fg-poster">${g.posterUrl ? `<img src="${g.posterUrl}" onerror="this.style.display='none'"/>` : "🎮"}<span class="status-badge status-${g.status}">${g.status}</span></div><div class="fg-title">${esc(g.title)}</div><div class="fg-meta">${g.platform || "—"}${g.progress > 0 ? " · " + g.progress + "%" : ""}</div></div>`).join("")}</div>`
          : `<p class="muted">No games in library yet.</p>`;
      } else if (tab === "activity") {
        const acts = await api.friendActivity(friendId);
        content.innerHTML = acts.length
          ? `<div class="feed">${acts.map((a) => `<div class="feed-item"><div class="feed-icon fi-${a.type}">${IC[a.type] || "•"}</div><div class="feed-body"><div class="text">${esc(a.description || a.type)}</div><div class="meta">${timeAgo(a.createdAt)}</div></div></div>`).join("")}</div>`
          : `<p class="muted">No activity yet.</p>`;
      } else {
        const cmp = await api.friendCompare(friendId);
        content.innerHTML = `
          <div class="compare-grid">
            <div class="compare-col"><h4>You</h4><div class="compare-stat"><span>${cmp.myStats.total}</span> games</div><div class="compare-stat"><span>${cmp.myStats.completed}</span> completed</div><div class="compare-stat"><span>${cmp.myStats.hours}h</span> played</div></div>
            <div class="compare-col"><h4>${esc(cmp.friend.username)}</h4><div class="compare-stat"><span>${cmp.theirStats.total}</span> games</div><div class="compare-stat"><span>${cmp.theirStats.completed}</span> completed</div><div class="compare-stat"><span>${cmp.theirStats.hours}h</span> played</div></div>
          </div>
          <h4 class="compare-shared-title">Shared games</h4>
          ${cmp.shared.length ? `<div class="compare-shared">${cmp.shared.map((s) => `<div class="compare-game"><span class="cg-title">${esc(s.title)}</span><div class="cg-bars"><div class="cg-side"><span>You</span><div class="bar-track"><div class="bar-track-fill" style="width:${s.myProgress}%"></div></div><span>${s.myProgress}%</span></div><div class="cg-side"><span>${esc(cmp.friend.username)}</span><div class="bar-track"><div class="bar-track-fill" style="width:${s.theirProgress}%"></div></div><span>${s.theirProgress}%</span></div></div></div>`).join("")}</div>` : `<p class="muted">No shared games yet.</p>`}`;
      }
    } catch (e) {
      content.innerHTML = `<p class="muted">Could not load.</p>`;
    }
  };
  overlay.querySelectorAll(".ftab").forEach((t) => (t.onclick = () => {
    tab = t.dataset.tab;
    overlay.querySelectorAll(".ftab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    loadTab();
  }));
  loadTab();
}

const IC = { added_game: "➕", started_game: "▶", updated_progress: "📊", finished_game: "✓", rated_game: "★", removed_game: "🗑", played_session: "⏱" };

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

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
