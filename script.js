// Funkcja do renderowania elementów menu
function renderMenuItems(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  items.forEach(item => {
    const dishElement = document.createElement('div');
    dishElement.className = 'dish';
    
    const hasPromo = item.promo !== null;
    if (hasPromo) {
      dishElement.classList.add('has-promo');
    }
    
    dishElement.innerHTML = `
      <div>
        <span class="name">${item.name}</span>
        <span class="meta">${item.meta}</span>
        ${hasPromo ? `<span class="promo">${item.promo}</span>` : ''}
      </div>
      <div class="price">${item.price}</div>
    `;
    
    container.appendChild(dishElement);
  });
  
  // Observe new elements for animation
  container.querySelectorAll('.dish').forEach(d => obs.observe(d));
}

// Initialize menus
function initializeMenus() {
  renderMenuItems('beer-menu', menuData.beer);
  renderMenuItems('cocktails-menu', menuData.cocktails);
  renderMenuItems('snacks-menu', menuData.snacks);
}

// Mobile nav toggle
function toggleMenu(){
  const nav = document.getElementById('main-nav');
  const btn = document.querySelector('.menu-toggle');
  if(nav.classList.contains('mobile-show')){
    nav.classList.remove('mobile-show');
    btn.setAttribute('aria-expanded','false');
  } else {
    nav.classList.add('mobile-show');
    btn.setAttribute('aria-expanded','true');
  }
}

// card animation on scroll using IntersectionObserver
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, {threshold: 0.12});

// 18+ modal: appears every load, blocks until confirmed/redirect
const ageModal = document.getElementById('age-modal');
const im18 = document.getElementById('im-18');
const not18 = document.getElementById('not-18');

// block scrolling behind modal
document.body.style.overflow = 'hidden';

im18.addEventListener('click', () => {
  ageModal.style.display = 'none';
  document.body.style.overflow = '';
});

not18.addEventListener('click', () => {
  ageModal.querySelector('.modal').innerHTML = '<h3>Dostęp ograniczony</h3><p>Nie możesz wejść na tę stronę jeśli nie masz 18 lat.</p><div style="margin-top:16px"><button class="btn-ghost" id="back-btn">OK</button></div>';
  const backBtn = document.getElementById('back-btn');
  backBtn.addEventListener('click', () => {
    window.location.href = 'about:blank';
  });
});

// focus confirm for keyboard users
document.getElementById('im-18').focus();

// ---- Voting logic (persisted in localStorage) ----
// Storage keys
const STORE_KEY = 'atl_voting_counts_v1';
const VOTED_KEY = 'atl_voted_v1';

// default counts if none
function readCounts(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return {left:0,right:0};
    return JSON.parse(raw);
  }catch(e){ return {left:0,right:0}; }
}
function writeCounts(c){
  localStorage.setItem(STORE_KEY, JSON.stringify(c));
}
function hasVoted(){
  return !!localStorage.getItem(VOTED_KEY);
}
function setVoted(choice){
  // choice: 'left' or 'right'
  localStorage.setItem(VOTED_KEY, choice);
}

// UI elements
const btnLeft = document.getElementById('vote-left');
const btnRight = document.getElementById('vote-right');
const feedback = document.getElementById('vote-feedback');
const resultsWrap = document.getElementById('vote-results');
const barLeft = document.getElementById('bar-left');
const barRight = document.getElementById('bar-right');
const countLeft = document.getElementById('count-left');
const countRight = document.getElementById('count-right');

// initialize UI from storage
function renderResults(){
  const counts = readCounts();
  const total = counts.left + counts.right;
  // show counts and bars
  countLeft.textContent = counts.left;
  countRight.textContent = counts.right;
  const leftPct = total ? Math.round((counts.left/total)*100) : 0;
  const rightPct = total ? 100 - leftPct : 0;
  barLeft.style.width = leftPct + '%';
  barRight.style.width = rightPct + '%';
  resultsWrap.style.display = 'block';
}

function disableVotingUI(){
  btnLeft.disabled = true;
  btnRight.disabled = true;
}

function enableVotingUI(){
  btnLeft.disabled = false;
  btnRight.disabled = false;
}

// handle a vote
function castVote(side){
  if(hasVoted()){
    feedback.textContent = 'Już głosowałeś — dziękujemy!';
    return;
  }
  const counts = readCounts();
  if(side === 'left') counts.left += 1;
  else counts.right += 1;
  writeCounts(counts);
  setVoted(side);
  feedback.textContent = 'Dziękujemy za głos!';
  disableVotingUI();
  renderResults();
}

// set initial state
if(hasVoted()){
  disableVotingUI();
  feedback.textContent = 'Już głosowałeś — wynik poniżej.';
} else {
  feedback.textContent = '';
}
renderResults();

btnLeft.addEventListener('click', () => castVote('left'));
btnRight.addEventListener('click', () => castVote('right'));

// Accessibility: keyboard support for votes
[btnLeft, btnRight].forEach(b => b.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); }
}));

// ensure emoji reduce opacity on small screens
function adjustEmojiOpacity(){
  if(window.innerWidth < 640){
    document.querySelectorAll('.emoji').forEach(el => el.style.opacity = '0.03');
  } else {
    document.querySelectorAll('.emoji').forEach(el => el.style.opacity = '');
  }
}
adjustEmojiOpacity();
window.addEventListener('resize', adjustEmojiOpacity);

// Initialize the menus when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMenus);