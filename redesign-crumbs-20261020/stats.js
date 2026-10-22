// @ts-check
/** @param {string} id @returns {HTMLElement} */
function element(id) { const result = document.getElementById(id); if (!result) throw new Error(`Missing dashboard element: ${id}`); return result; }

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
  try { const response = await fetch('/stats/summary.json',{cache:'no-store',signal:AbortSignal.timeout(5000)}); if(!response.ok) throw new Error(`Server stats request failed: GET stats/summary.json HTTP ${response.status}`); return validateSummary(await response.json()); }
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