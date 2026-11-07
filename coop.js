// @ts-check
/** @typedef {{id:string,group:string,name:string,title:string,description:string,url:string,action:string,glyph:string,access:string}} App */
/** @type {App[]} */
const apps = [
 {id:"coopadmin",group:"admin",name:"COOP ADMIN",title:"Household access",description:"Invite people and set which apps they can use. Owner login and Tailscale.",url:"https://admin.fatpigeon.ca/",action:"Open Coop Admin",glyph:"♙",access:"TAILSCALE · OWNER"},
 {id:'watch',group:'household',name:'JELLYFIN',title:'Movies and TV',description:'The family library. Includes the one you fell asleep during.',url:'https://watch.fatpigeon.ca/',action:'Start watching',glyph:'▣',access:''},
 {id:'request',group:'household',name:'SEERR',title:'Request a title',description:'If it isn\'t in the library yet, ask for it here.',url:'https://requests.fatpigeon.ca/',action:'Make a request',glyph:'▤',access:''},
 {id:'listen',group:'household',name:'AUDIOBOOKSHELF',title:'Audiobooks',description:'For the car, or for doing the dishes.',url:'https://listen.fatpigeon.ca/',action:'Open books',glyph:'♫',access:''},
 {id:'photos',group:'household',name:'IMMICH',title:'Photos',description:'Family pictures. Yes, the 400 nearly identical ones too.',url:'https://photos.fatpigeon.ca/',action:'Open photos',glyph:'▧',access:''},
 {id:'homing',group:'tool',name:'HOMINGPIGEON',title:'Check an email',description:'Paste a header and see where the mail came from. Stays in your browser.',url:'https://homing.fatpigeon.ca/',action:'Open Homing Pigeon',glyph:'✉',access:''},
 {id:'crackers',group:'tool',name:'CRACKERS',title:'FPV workbench',description:'Drone parts and builds. Home network or Tailscale.',url:'http://crackers.fatpigeon.ca:3005/',action:'Open Crackers',glyph:'✚',access:'HOME / TAILSCALE'},
 {id:'website',group:'tool',name:'SKRZYPEK.CA',title:'Matt\'s site',description:'The regular website. Fewer pigeons.',url:'https://skrzypek.ca/',action:'Open skrzypek.ca',glyph:'⌂',access:''},
 {id:'unraid',group:'admin',name:'UNRAID',title:'The server',description:'Disks, containers, and the buttons you shouldn\'t press.',url:'https://192-168-2-123.200da67cf4d9bbf557bc7b6c1c5df370db72ca46.myunraid.net/',action:'Open Unraid',glyph:'▥',access:'PRIVATE'},
 {id:'identity',group:'admin',name:'AUTHENTIK',title:'Accounts',description:'Who can sign in, and to what.',url:'https://auth.fatpigeon.ca/if/admin/',action:'Open Authentik',glyph:'♙',access:'PRIVATE'},
 {id:'sonarr',group:'admin',name:'SONARR',title:'TV shows',description:'What to download, and which episodes are missing.',url:'http://pigeoncoop.lan:8989/',action:'Open Sonarr',glyph:'▣',access:'PRIVATE'},
 {id:'radarr',group:'admin',name:'RADARR',title:'Movies',description:'Same idea as Sonarr, for movies.',url:'http://pigeoncoop.lan:7878/',action:'Open Radarr',glyph:'▧',access:'PRIVATE'},
 {id:'prowlarr',group:'admin',name:'PROWLARR',title:'Search indexes',description:'Where Sonarr and Radarr go looking for files.',url:'http://pigeoncoop.lan:9696/',action:'Open Prowlarr',glyph:'⌕',access:'PRIVATE'},
 {id:'downloads',group:'admin',name:'QBITTORRENT',title:'Downloads',description:'The queue. Leave the paused ones alone.',url:'http://pigeoncoop.lan:8080/',action:'Open qBittorrent',glyph:'⇣',access:'PRIVATE'},
 {id:'cleanup',group:'admin',name:'CLEANUPARR',title:'Queue cleanup',description:'Tidies up the download queue.',url:'http://pigeoncoop.lan:11011/',action:'Open Cleanuparr',glyph:'✦',access:'PRIVATE'},
 {id:'uptime',group:'admin',name:'UPTIME KUMA',title:'Are things up?',description:'Checks the services and notices when one falls over.',url:'http://pigeoncoop.lan:3006/',action:'Open Uptime Kuma',glyph:'♡',access:'PRIVATE'},
 {id:'beszel',group:'admin',name:'BESZEL',title:'Server graphs',description:'CPU, memory, and disk over time.',url:'http://pigeoncoop.lan:8090/',action:'Open Beszel',glyph:'▥',access:'PRIVATE'},
 {id:'scrutiny',group:'admin',name:'SCRUTINY',title:'Drive health',description:'SMART data. Are the disks dying.',url:'https://admin.fatpigeon.ca:8085/',action:'Open Scrutiny',glyph:'◎',access:'PRIVATE'},
 {id:'dozzle',group:'admin',name:'DOZZLE',title:'Container logs',description:'Read only. The dangerous buttons are gone.',url:'https://admin.fatpigeon.ca:9999/',action:'Open Dozzle',glyph:'≡',access:'PRIVATE'},
];
/** @param {string} id @returns {HTMLElement} */
function element(id) { const result = document.getElementById(id); if (!result) throw new Error(`Missing dashboard element: ${id}`); return result; }
/** @param {App} app @returns {HTMLAnchorElement} */
function createCard(app) {
 const card = document.createElement('a'); card.id = `${app.id}-card`; card.className = 'card'; card.href = app.url;
 card.dataset.search = `${app.name} ${app.title} ${app.description} ${app.access}`.toLowerCase();
 const top = document.createElement('div'); top.className = 'card-top';
 const glyph = document.createElement('span'); glyph.className = 'glyph'; glyph.textContent = app.glyph; glyph.setAttribute('aria-hidden','true'); top.append(glyph);
 if(app.access) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = app.access; top.append(badge); }
 const name = document.createElement('span'); name.className = 'tag'; name.textContent = app.name;
 const title = document.createElement('h3'); title.textContent = app.title;
 const description = document.createElement('p'); description.textContent = app.description;
 const action = document.createElement('span'); action.className = 'card-action'; action.textContent = app.action;
 const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true'); action.append(arrow);
 card.append(top,name,title,description,action); return card;
}
for (const app of apps) element(`${app.group}-cards`).append(createCard(app));
const search = element('app-search'); if (!(search instanceof HTMLInputElement)) throw new TypeError('App search must be an input');
search.addEventListener('input',() => {
 const query = search.value.trim().toLowerCase(); let count = 0;
 for (const app of apps) { const card = element(`${app.id}-card`); card.hidden = !(card.dataset.search || '').includes(query); if(!card.hidden) count += 1; }
 const privatePerch = element('private-perch'); if(!(privatePerch instanceof HTMLDetailsElement)) throw new TypeError('Private perch must be a disclosure');
 const hasAdmin = apps.some(app => app.group === 'admin' && !element(`${app.id}-card`).hidden);
 privatePerch.hidden = !hasAdmin;
 if(query && hasAdmin) privatePerch.open = true;
 element('tools').hidden = !apps.some(app => app.group === 'tool' && !element(`${app.id}-card`).hidden);
 const householdHeading = element('services-title').parentElement;
 if(!householdHeading) throw new Error('Household app heading has no section wrapper');
 householdHeading.hidden = !apps.some(app => app.group === 'household' && !element(`${app.id}-card`).hidden);
 element('app-count').textContent = `${count} of ${apps.length} apps`; element('no-results').hidden = count !== 0;
});
element('app-count').textContent = `${apps.length} apps`;
/** @typedef {{usedBytes:number,totalBytes:number,percent:number}} Capacity */
/** @typedef {{label:string,usedBytes:number,totalBytes:number,percent:number}} Disk */
/** @typedef {{schema:number,updatedUnix:number,cpuPercent:number,memory:Capacity,array:Capacity,uptimeSeconds:number,disks:Disk[]}} Summary */
/** @param {number} value @returns {boolean} */
function percent(value) { return Number.isFinite(value) && value >= 0 && value <= 100; }
/** @param {Capacity} value @returns {boolean} */
function capacity(value) { return value !== null && typeof value === 'object' && Number.isFinite(value.usedBytes) && Number.isFinite(value.totalBytes) && value.usedBytes >= 0 && value.totalBytes > 0 && value.usedBytes <= value.totalBytes && percent(value.percent); }
/** @param {Summary} value @returns {Summary} */
function validateSummary(value) {
 if(!value || value.schema !== 1 || !Number.isFinite(value.updatedUnix) || !percent(value.cpuPercent) || !capacity(value.memory) || !capacity(value.array) || !Number.isFinite(value.uptimeSeconds) || value.uptimeSeconds < 0 || !Array.isArray(value.disks) || value.disks.length !== 5 || !value.disks.every(disk => capacity(disk) && /^(Disk [1-4]|Cache)$/.test(disk.label)) || new Set(value.disks.map(disk => disk.label)).size !== 5) throw new TypeError('Server stats contain invalid or incomplete measurements');
 const age = Date.now()/1000 - value.updatedUnix; if(age > 60 || age < -5) throw new Error('Server stats are stale or have an invalid timestamp'); return value;
}
/** @param {number} bytes @returns {string} */
function size(bytes) { const unit = bytes >= 2 ** 40 ? 2 ** 40 : 2 ** 30; return `${(bytes/unit).toFixed(1)} ${unit === 2 ** 40 ? 'TiB' : 'GiB'}`; }
/** @param {Capacity} value @returns {string} */
function capacityText(value) { return `${size(value.usedBytes)} of ${size(value.totalBytes)} used`; }
/** @param {string} id @param {number} value @returns {void} */
function updateMeter(id,value) { const meter = element(id); if(!(meter instanceof HTMLMeterElement)) throw new TypeError(`Stats meter has the wrong element type: ${id}`); meter.value = value; meter.hidden = false; }
/** @param {Summary} data @returns {void} */
function displaySummary(data) {
 element('cpu-value').textContent = `${Math.round(data.cpuPercent)}%`; updateMeter('cpu-meter',data.cpuPercent);
 element('memory-value').textContent = `${Math.round(data.memory.percent)}%`; element('memory-detail').textContent = capacityText(data.memory); updateMeter('memory-meter',data.memory.percent);
 element('array-value').textContent = `${Math.round(data.array.percent)}%`; element('array-detail').textContent = capacityText(data.array); updateMeter('array-meter',data.array.percent);
 const days = Math.floor(data.uptimeSeconds/86400), hours = Math.floor(data.uptimeSeconds%86400/3600); element('uptime-value').textContent = `${days}d ${hours}h`;
 const disks = data.disks.map(disk => { const item = document.createElement('p'); item.textContent = `${disk.label} · ${Math.round(disk.percent)}%`; const detail = document.createElement('strong'); detail.textContent = capacityText(disk); item.append(detail); return item; });
 element('disk-values').replaceChildren(...disks); element('stats-status').textContent = `Updated ${new Date(data.updatedUnix*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
}
/** @returns {Promise<Summary>} */
async function fetchSummary() {
 for(let attempt = 1; attempt <= 3; attempt += 1) {
  try { const response = await fetch('stats/summary.json',{cache:'no-store',signal:AbortSignal.timeout(5000)}); if(!response.ok) throw new Error(`Server stats request failed: GET stats/summary.json HTTP ${response.status}`); return validateSummary(await response.json()); }
  catch(error) { console.warn('Server stats request failed',{attempt,error}); if(attempt === 3) throw error; await new Promise(resolve => setTimeout(resolve,1000)); }
 }
 throw new Error('Server stats retry limit reached');
}
/** @returns {Promise<void>} */
async function refreshStats() {
 try { displaySummary(await fetchSummary()); }
 catch(error) { element('stats-status').textContent = 'Stats aren\'t loading'; for(const id of ['cpu','memory','array','uptime']) element(`${id}-value`).textContent = '—'; for(const id of ['cpu','memory','array']) element(`${id}-meter`).hidden = true; element('memory-detail').textContent = 'No memory reading.'; element('array-detail').textContent = 'No storage reading.'; element('disk-values').textContent = 'Couldn\'t load stats. Ask Matt to check the collector.'; console.error('Dashboard stats unavailable',{error}); }
 setTimeout(refreshStats,15000);
}
refreshStats();
const motionToggle = element('motion-toggle');
motionToggle.addEventListener('click', () => {
 const paused = document.body.classList.toggle('motion-paused');
 motionToggle.setAttribute('aria-pressed', String(paused));
 motionToggle.setAttribute('aria-label', paused ? 'Resume page animations' : 'Pause page animations');
 motionToggle.textContent = paused ? 'Resume motion' : 'Pause motion';
});

