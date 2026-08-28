const activities = [
  { name: 'Maya Chen', initials: 'M', color: 'amber', verb: 'started playing', game: 'Cyberpunk 2077', detail: 'PC · 2h played', time: '18m ago', art: 'cyber', likes: 12 },
  { name: 'Jordan Lee', initials: 'J', color: 'purple', verb: 'completed', game: 'Hades II', detail: 'Rated ★ 9.0 · “One more run became twenty.”', time: '2h ago', art: 'hades', likes: 28 },
  { name: 'Sam Rivera', initials: 'S', color: 'blue', verb: 'added to their wishlist', game: 'The Legend of Zelda: Echoes of Wisdom', detail: 'Nintendo Switch', time: '5h ago', art: 'zelda', likes: 7 }
];
const feed = document.querySelector('#activityFeed');
function renderFeed() {
  feed.innerHTML = activities.map((item, index) => `<article class="activity"><span class="avatar ${item.color}">${item.initials}</span><div class="activity-body"><div class="activity-top"><strong>${item.name}</strong> ${item.verb} <span class="activity-time">${item.time}</span></div><div class="activity-content"><span class="activity-art ${item.art}"></span><div><p class="activity-game"><strong>${item.game}</strong></p><p class="activity-detail">${item.detail}</p></div><div class="activity-actions"><button class="like" data-index="${index}">♡ <span>${item.likes}</span></button><span>◌</span></div></div></div></article>`).join('');
}
renderFeed();
feed.addEventListener('click', event => { const button = event.target.closest('.like'); if (!button) return; const item = activities[button.dataset.index]; item.likes += button.classList.toggle('liked') ? 1 : -1; renderFeed(); });
const dialog = document.querySelector('#gameDialog');
document.querySelector('#addGame').addEventListener('click', () => dialog.showModal());
document.querySelector('#saveGame').addEventListener('click', event => { const title = document.querySelector('#gameTitle').value.trim(); if (!title) { event.preventDefault(); document.querySelector('#gameTitle').focus(); return; } const status = document.querySelector('#gameStatus').value; activities.unshift({name:'Preet', initials:'P', color:'me', verb:`added ${status.toLowerCase()}`, game:title, detail:'Just now', time:'now', art:'cyber', likes:0}); renderFeed(); });
let progress = 62; document.querySelector('#advanceGame').addEventListener('click', () => { progress = Math.min(100, progress + 5); document.querySelector('.progress span').style.width = `${progress}%`; document.querySelector('.progress-row strong').textContent = `${progress}%`; });
document.querySelector('#logSession').addEventListener('click', event => { const button = event.currentTarget; button.textContent = 'Session logged ✓'; setTimeout(() => button.textContent = 'Log a session', 1600); });
