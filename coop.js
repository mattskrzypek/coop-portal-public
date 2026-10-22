// @ts-check
/** @typedef {{id:string,group:string,name:string,title:string,description:string,url:string,action:string,glyph:string,access:string}} App */
/** @type {App[]} */
const apps = [
 {id:"coopadmin",group:"admin",name:"COOP ADMIN",title:"Manage household access",description:"Invite family and manage app access from either computer. Owner sign-in and Tailscale required.",url:"https://admin.fatpigeon.ca/",action:"Open Coop Admin",glyph:"♙",access:"TAILSCALE · OWNER"},
 {id:'watch',group:'household',name:'JELLYFIN',title:'Watch something',description:'Movies, shows, and the one you slept through. Crumbs won’t judge. Much.',url:'https://watch.fatpigeon.ca/',action:'Start watching',glyph:'▣',access:''},
 {id:'request',group:'household',name:'SEERR',title:'Request something',description:'Send the scouts for a movie or show. Delivery by pigeon is not guaranteed.',url:'https://requests.fatpigeon.ca/',action:'Find a movie or show',glyph:'▤',access:''},
 {id:'listen',group:'household',name:'AUDIOBOOKSHELF',title:'Listen to a book',description:'Story time for your bird brain. Give your eyes a well-earned perch break.',url:'https://listen.fatpigeon.ca/',action:'Open the bookshelf',glyph:'♫',access:''},
 {id:'photos',group:'household',name:'IMMICH',title:'Keep your memories',description:'Your photos, your flock. Finally, somewhere for all 400 identical pigeon selfies.',url:'https://photos.fatpigeon.ca/',action:'Open your photo library',glyph:'▧',access:''},
 {id:'homing',group:'tool',name:'HOMINGPIGEON',title:'Inspect an email',description:'Follow an email’s migration trail. Header analysis stays in your browser.',url:'https://homing.fatpigeon.ca/',action:'Open the mailroom',glyph:'✉',access:''},
 {id:'crackers',group:'tool',name:'CRACKERS',title:'Visit the FPV workbench',description:'Parts, builds and a completely reasonable number of propellers. Allegedly.',url:'http://crackers.fatpigeon.ca:3005/',action:'Open the workbench',glyph:'✚',access:'HOME / TAILSCALE'},
 {id:'website',group:'tool',name:'SKRZYPEK.CA',title:'Meet the human',description:'The responsible adult behind this suspiciously feather-heavy operation.',url:'https://skrzypek.ca/',action:'Visit Matt’s website',glyph:'⌂',access:''},
 {id:'unraid',group:'admin',name:'UNRAID',title:'Run the coop',description:'Disks, apps and big red buttons. Keep your beak off anything you don’t recognise.',url:'https://192-168-2-123.200da67cf4d9bbf557bc7b6c1c5df370db72ca46.myunraid.net/',action:'Open server controls',glyph:'▥',access:'PRIVATE'},
 {id:'identity',group:'admin',name:'AUTHENTIK',title:'Manage the flock',description:'People, accounts and access. Bread-based authentication remains unsupported.',url:'https://auth.fatpigeon.ca/if/admin/',action:'Open identity admin',glyph:'♙',access:'PRIVATE'},
 {id:'sonarr',group:'admin',name:'SONARR',title:'Organise your shows',description:'Episode patrol. Someone has to know where season two flew off to.',url:'http://pigeoncoop.lan:8989/',action:'Open Sonarr',glyph:'▣',access:'PRIVATE'},
 {id:'radarr',group:'admin',name:'RADARR',title:'Organise your movies',description:'The movie lookout. Questionable taste in pigeon documentaries.',url:'http://pigeoncoop.lan:7878/',action:'Open Radarr',glyph:'▧',access:'PRIVATE'},
 {id:'prowlarr',group:'admin',name:'PROWLARR',title:'Coordinate the scouts',description:'Manage the search flock. A masterclass in coo-ordination.',url:'http://pigeoncoop.lan:9696/',action:'Open Prowlarr',glyph:'⌕',access:'PRIVATE'},
 {id:'downloads',group:'admin',name:'QBITTORRENT',title:'Check deliveries',description:'The delivery perch. Existing download holds stay exactly where you left them.',url:'http://pigeoncoop.lan:8080/',action:'Open downloads',glyph:'⇣',access:'PRIVATE'},
 {id:'cleanup',group:'admin',name:'CLEANUPARR',title:'Keep the nest tidy',description:'A little housekeeping for the download queue. Even pigeons have standards.',url:'http://pigeoncoop.lan:11011/',action:'Open Cleanuparr',glyph:'✦',access:'PRIVATE'},
 {id:'uptime',group:'admin',name:'UPTIME KUMA',title:'Is everything still cooing?',description:'Service checks, certificate reminders and a heads-up when a perch falls over.',url:'http://pigeoncoop.lan:3006/',action:'Open service monitoring',glyph:'♡',access:'PRIVATE'},
 {id:'beszel',group:'admin',name:'BESZEL',title:'Check wing performance',description:'CPU, memory and disk capacity. The silicon bird’s performance review.',url:'http://pigeoncoop.lan:8090/',action:'Open server monitoring',glyph:'▥',access:'PRIVATE'},
 {id:'scrutiny',group:'admin',name:'SCRUTINY',title:'Inspect the shiny disks',description:'Drive health and SMART history. Peck the dashboard, not the platters.',url:'https://admin.fatpigeon.ca:8085/',action:'Open disk health',glyph:'◎',access:'PRIVATE'},
 {id:'dozzle',group:'admin',name:'DOZZLE',title:'Read coop gossip',description:'Container logs with the dangerous buttons removed. Mostly useful squawking.',url:'https://admin.fatpigeon.ca:9999/',action:'Open read-only logs',glyph:'≡',access:'PRIVATE'},
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
 element('app-count').textContent = `${count} of ${apps.length} perches`; element('no-results').hidden = count !== 0;
});
element('app-count').textContent = `${apps.length} perches`;
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
 element('disk-values').replaceChildren(...disks); element('stats-status').textContent = `Live · updated ${new Date(data.updatedUnix*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
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
 catch(error) { element('stats-status').textContent = 'Stats unavailable'; for(const id of ['cpu','memory','array','uptime']) element(`${id}-value`).textContent = '—'; for(const id of ['cpu','memory','array']) element(`${id}-meter`).hidden = true; element('memory-detail').textContent = 'No current memory measurement.'; element('array-detail').textContent = 'No current storage measurement.'; element('disk-values').textContent = 'Live stats could not be loaded. Ask Matt to check the stats collector.'; console.error('Dashboard stats unavailable',{error}); }
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

