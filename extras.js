const games = [
  ['The Outer Worlds', 'Playing · 62%', 'starfield', 'THE OUTER WORLDS'],
  ['Hades II', 'Want to play', 'hades', 'HADES II'],
  ['Baldur’s Gate 3', 'Completed · ★ 9.5', 'zelda', 'BALDUR’S GATE'],
  ['Cyberpunk 2077', 'Want to play', 'cyber', 'CYBERPUNK'],
  ['Hollow Knight', 'Completed · ★ 9.0', 'hades', 'HOLLOW KNIGHT'],
  ['Clair Obscur', 'Want to play', 'zelda', 'EXPEDITION 33']
];
const libraryGrid = document.querySelector('#libraryGrid');
libraryGrid.innerHTML = games.map(game => `<article class="game-tile"><div class="tile-art ${game[2]}">${game[3]}</div><div><strong>${game[0]}</strong><small>${game[1]}</small><span class="status">${game[1].split(' ·')[0].toUpperCase()}</span></div></article>`).join('');
const recommendations = document.querySelector('#recommendations');
recommendations.innerHTML = games.slice(1, 4).map(game => `<article class="game-tile"><div class="tile-art ${game[2]}">${game[3]}</div><div><strong>${game[0]}</strong><small>Recommended for you</small><span class="status">VIEW GAME</span></div></article>`).join('');
const people = [['Maya Chen','M','amber','Valorant','Ranked · 2/5 squad'],['Jordan Lee','J','purple','Baldur’s Gate 3','Act 2 · 16h played'],['Sam Rivera','S','blue','Cyberpunk 2077','PC · 47% complete']];
document.querySelector('#friendsGrid').innerHTML = people.map(p => `<article class="friend-card"><header><span class="avatar ${p[2]}">${p[1]}</span><div><strong>${p[0]}</strong><small><i class="online"></i> Online now</small></div></header><div class="mini-game">Playing <strong>${p[3]}</strong><br><small>${p[4]}</small></div><button class="secondary">View profile</button></article>`).join('');
function showView(id) { document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === id)); document.querySelectorAll('.nav-item').forEach(nav => nav.classList.toggle('active', nav.getAttribute('href') === `#${id}`)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
document.querySelectorAll('.nav-item').forEach(nav => nav.addEventListener('click', event => { event.preventDefault(); showView(nav.getAttribute('href').slice(1)); }));
document.querySelectorAll('.profile-trigger').forEach(button => button.addEventListener('click', () => showView('profile')));
document.querySelectorAll('.add-game-inline').forEach(button => button.addEventListener('click', () => document.querySelector('#gameDialog').showModal()));
document.querySelector('.discover-add').addEventListener('click', event => { event.currentTarget.textContent = 'Added to wishlist ✓'; event.currentTarget.disabled = true; });
document.querySelector('#findFriends').addEventListener('click', event => { event.currentTarget.textContent = 'Invite link copied ✓'; setTimeout(() => event.currentTarget.textContent = 'Find friends', 1600); });
