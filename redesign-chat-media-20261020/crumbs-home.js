// @ts-check
/** @param {string} id @returns {HTMLElement} */
function crumbsElement(id) { const value = document.getElementById(id); if(!value) throw new Error(`Missing Crumbs home element: ${id}`); return value; }
/** @param {string} name @returns {void} */
function crumbsTab(name) {
 for(const tabName of ['chat','media','apps','help']) {
  const button = crumbsElement(`crumbs-tab-${tabName}`), panel = crumbsElement(`crumbs-panel-${tabName}`);
  button.setAttribute('aria-selected',String(tabName === name)); button.tabIndex = tabName === name ? 0 : -1; panel.hidden = tabName !== name;
 }
}
/** @param {string} message @returns {void} */
function crumbsDraft(message) {
 crumbsTab('chat'); const input = crumbsElement('message');
 if(!(input instanceof HTMLTextAreaElement)) throw new TypeError('Crumbs message must be a text area');
 if(input.value.trim()) { crumbsElement('crumbs-draft-status').textContent = 'You\'ve still got an unsent message. Send it or clear it first.'; input.focus(); return; }
 crumbsElement('crumbs-draft-status').textContent = '';
 input.value = message; input.focus();
}
/** @returns {void} */
function crumbsFindApps() {
 const input = crumbsElement('crumbs-app-search'); if(!(input instanceof HTMLInputElement)) throw new TypeError('Crumbs app search must be an input');
 /** @type {Record<string,string>} */
 const aliases = {watch:'movies film tv television streaming jellyfin',request:'requests seerr movies tv show',listen:'audiobook audiobooks books listen audio',photos:'pictures memories camera photos immich',homing:'email headers mail',crackers:'fpv drone parts builds',website:'matt website about'};
 const familyApps = apps.filter(app => app.group === 'household' || app.group === 'tool');
 const matches = familyApps.filter(app => `${app.name} ${app.title} ${app.description} ${aliases[app.id] ?? ''}`.toLowerCase().includes(input.value.trim().toLowerCase()));
 const rows = matches.map(app => {
  const link = document.createElement('a'); link.id = `crumbs-app-${app.id}`; link.href = app.url; link.target = '_blank'; link.rel = 'noopener';
  const title = document.createElement('strong'); title.textContent = app.title;
  const name = document.createElement('span'); name.textContent = app.access ? `${app.name} · ${app.access}` : app.name;
  const action = document.createElement('small'); action.textContent = `${app.action} ↗`;
  link.append(title,name,action); return link;
 });
 crumbsElement('crumbs-app-results').replaceChildren(...rows);
 crumbsElement('crumbs-app-count').textContent = `${matches.length} of ${familyApps.length} apps. Opens in a new tab.`;
 crumbsElement('crumbs-app-empty').hidden = matches.length !== 0;
}
for(const [index,name] of ['chat','media','apps','help'].entries()) {
 const tab = crumbsElement(`crumbs-tab-${name}`);
 tab.addEventListener('click',() => crumbsTab(name));
 tab.addEventListener('keydown',event => {
  const keys = ['ArrowRight','ArrowLeft','Home','End']; if(!keys.includes(event.key)) return;
  event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (index + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
  const nextName = ['chat','media','apps','help'][next]; crumbsTab(nextName); crumbsElement(`crumbs-tab-${nextName}`).focus();
 });
}
const crumbsMoviePrompt = 'Help me pick a movie or show. Ask about the mood and who is watching, then suggest a few. You cannot see the Watch library or past requests. If I want to request one, point me at Movies & TV so I can check the title and confirm it myself.';
for(const id of ['crumbs-movie-ideas','crumbs-recommend']) crumbsElement(id).addEventListener('click',() => crumbsDraft(crumbsMoviePrompt));
for(const id of ['crumbs-app-help','crumbs-help-chat']) crumbsElement(id).addEventListener('click',() => crumbsDraft('I need help with the Coop. Ask which app I am in and what I am trying to do, then tell me the next step in plain language.'));
crumbsElement('crumbs-help-request-button').addEventListener('click',() => { crumbsTab('media'); crumbsElement('title-query').focus(); });
crumbsElement('crumbs-app-search').addEventListener('input',crumbsFindApps);
crumbsFindApps();
