// @ts-check
/** @typedef {{id:string,group:string,name:string,title:string,description:string,url:string,action:string,glyph:string,access:string}} App */
/** @param {App} app @returns {HTMLAnchorElement} */
function createCard(app) {
 const card = document.createElement('a'); card.id = `${app.id}-card`; card.className = 'card'; card.href = app.url;
 card.dataset.search = `${app.name} ${app.title} ${app.description}`.toLowerCase();
 const top = document.createElement('div'); top.className = 'card-top';
 const glyph = document.createElement('span'); glyph.className = 'glyph'; glyph.textContent = app.glyph; glyph.setAttribute('aria-hidden','true'); top.append(glyph);
 if(app.access) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = app.access; top.append(badge); }
 const title = document.createElement('h3'); title.textContent = app.title;
 const description = document.createElement('p'); description.textContent = app.description;
 const name = document.createElement('span'); name.className = 'tag'; name.textContent = app.name;
 const action = document.createElement('span'); action.className = 'card-action'; action.textContent = `${app.action} ↗`;
 card.append(top,title,description,name,action); return card;
}
for (const link of document.querySelectorAll('nav a')) if(link instanceof HTMLAnchorElement && link.dataset.nav === document.body.dataset.page) link.setAttribute('aria-current','page');
for (const app of apps) { const group = document.getElementById(`${app.group}-cards`); if(group) group.append(createCard(app)); }
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
