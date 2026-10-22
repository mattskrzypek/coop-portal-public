// @ts-check
/** @typedef {{id:string,group:string,name:string,title:string,description:string,url:string,action:string,glyph:string,access:string}} App */
/** @param {App} app @returns {HTMLAnchorElement} */
function createCard(app) {
 /** @type {Record<string,{name:string,title:string,description:string,action:string}>} */
 const labels = {
  watch:{name:'WATCH',title:'Watch movies & TV',description:'Kick back and enjoy the flock’s collection.',action:'Start watching'},
  request:{name:'REQUEST',title:'Request something',description:'Can’t find a movie or show? Send a request and Crumbs will track it down.',action:'Make a request'},
  listen:{name:'AUDIOBOOKS',title:'Listen to a book',description:'Great stories for road trips, chill time, or chore time.',action:'Open the bookshelf'},
  photos:{name:'PHOTOS',title:'Keep your memories',description:'Your photos, your flock. A place for all 400 identical pigeon selfies.',action:'Open your photo library'}
 };
 const display = {...app,...labels[app.id]};
 const card = document.createElement('a'); card.id = `${app.id}-card`; card.className = 'card'; card.href = app.url;
 card.dataset.search = `${app.name} ${app.title} ${app.description}`.toLowerCase();
 const top = document.createElement('div'); top.className = 'card-top';
 const glyph = document.createElement('span'); glyph.className = 'glyph'; glyph.textContent = app.glyph; glyph.setAttribute('aria-hidden','true'); top.append(glyph);
 if(app.access) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = app.access; top.append(badge); }
 const title = document.createElement('h3'); title.textContent = display.title;
 const description = document.createElement('p'); description.textContent = display.description;
 const name = document.createElement('span'); name.className = 'tag'; name.textContent = display.name;
 const action = document.createElement('span'); action.className = 'card-action'; action.textContent = display.action;
 const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true'); action.append(arrow);
 card.append(top,name,title,description,action); return card;
}
for (const link of document.querySelectorAll('nav a')) if(link instanceof HTMLAnchorElement && link.dataset.nav === document.body.dataset.page) link.setAttribute('aria-current','page');
for (const app of apps) {
 const group = document.getElementById(document.body.dataset.page === 'home' && app.id === 'photos' ? 'wide-cards' : `${app.group}-cards`);
 if(group) { const card = createCard(app); if(app.id === 'photos' && document.body.dataset.page === 'home') group.prepend(card); else group.append(card); }
}
const appSearch = document.getElementById('app-search');
if(appSearch instanceof HTMLInputElement) {
 const count = document.getElementById('app-count'); const empty = document.getElementById('no-results');
 if(!count || !empty) throw new Error('App directory is missing its count or empty state');
 const visibleApps = apps.filter(app => document.getElementById(`${app.id}-card`));
 count.textContent = `${visibleApps.length} apps`;
 appSearch.addEventListener('input',() => {
  let total = 0;
  for(const app of visibleApps) {
   const card = document.getElementById(`${app.id}-card`); if(!card) throw new Error(`Missing app card: ${app.id}`);
   card.hidden = !(card.dataset.search?.includes(appSearch.value.trim().toLowerCase())); if(!card.hidden) total += 1;
  }
  count.textContent = `${total} of ${visibleApps.length} apps`; empty.hidden = total !== 0;
 });
}
const motionButton = document.getElementById('motion-toggle');
if(motionButton) motionButton.addEventListener('click',() => {
 const paused = document.body.classList.toggle('motion-paused'); motionButton.setAttribute('aria-pressed',String(paused)); motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
});
