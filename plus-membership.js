const currentUser = { name: 'Preet', plus: true, plan: 'Questlog Plus', price: '£3.99 / month' };
document.body.dataset.plusMember = String(currentUser.plus);
const plusModalCopy = document.querySelector('.plus-dialog .muted');
if (plusModalCopy) plusModalCopy.textContent = `Unlock premium visual themes and future Plus features for ${currentUser.price}.`;
const profileTitle = document.querySelector('#profile h1');
if (currentUser.plus && profileTitle) profileTitle.insertAdjacentHTML('beforeend', ' <em class="plus-tag profile-plus">PLUS</em>');
const profileLead = document.querySelector('#profile .profile-hero .eyebrow');
if (currentUser.plus && profileLead) profileLead.textContent = 'EXECUTIVE ACCOUNT · QUESTLOG PLUS';
const accountTools = document.querySelector('.account-tools');
if (currentUser.plus && accountTools) { const plusPanel = document.createElement('div'); plusPanel.className = 'plus-membership-panel'; plusPanel.innerHTML = `<p class="eyebrow">YOUR MEMBERSHIP</p><h2>Questlog Plus <span class="plus-tag">ACTIVE</span></h2><p class="muted">${currentUser.price} · Your membership is active.</p><div class="plus-feature-grid"><div class="plus-feature"><b>Premium themes</b><small>Aurora & Velvet unlocked</small></div><div class="plus-feature"><b>Profile flair</b><small>Plus tag and custom status</small></div><div class="plus-feature"><b>Deep stats</b><small>Yearly wrap and play trends</small></div><div class="plus-feature"><b>Priority imports</b><small>Faster library syncs</small></div></div><span class="plus-status"><i></i> Plus is active</span>`; accountTools.prepend(plusPanel); }
const jordan = [...document.querySelectorAll('.friend strong')].find(element => element.textContent.includes('Jordan Lee'));
if (jordan) jordan.insertAdjacentHTML('beforeend', ' <em class="plus-tag">PLUS</em>');
const friendsView = document.querySelector('#friends');
if (friendsView) { const ad = document.createElement('aside'); ad.className = 'free-plus-ad'; ad.innerHTML = `<p class="eyebrow">FOR FREE MEMBERS</p><h3>Play your way with Questlog Plus</h3><p>Premium themes, deeper gaming insights, profile flair, and priority imports for ${currentUser.price}.</p><button type="button">Explore Questlog Plus</button>`; friendsView.append(ad); ad.querySelector('button').addEventListener('click', () => document.querySelector('.plus-card button')?.click()); }
