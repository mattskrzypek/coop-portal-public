// @ts-check
/** @typedef {{id:string,group:string,name:string,title:string,description:string,url:string,action:string,glyph:string,access:string}} App */
/** @param {App} app @returns {HTMLAnchorElement} */
function createCard(app) {
 /** @type {Record<string,{name:string,title:string,description:string,action:string}>} */
 const labels = {
  watch:{name:'WATCH',title:'Movies and TV',description:'The family library. Includes the one you fell asleep during.',action:'Start watching'},
  request:{name:'REQUESTS',title:'Request a title',description:"If it isn't in the library yet, ask for it here.",action:'Make a request'},
  listen:{name:'AUDIOBOOKS',title:'Audiobooks',description:'For the car, or for doing the dishes.',action:'Open books'},
  photos:{name:'PHOTOS',title:'Photos',description:'Family pictures. Yes, the 400 nearly identical ones too.',action:'Open photos'}
 };
 const display = {...app,...labels[app.id]};
 const card = document.createElement('a'); card.id = `${app.id}-card`; card.className = 'card'; card.href = app.url;
 card.dataset.search = `${app.name} ${display.name} ${app.title} ${display.title} ${app.description} ${display.description}`.toLowerCase();
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
