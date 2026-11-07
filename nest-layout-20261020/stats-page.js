// @ts-check
import {fetchSummary,capacityText} from './stats-data.js';
/** @typedef {import('./stats-data.js').Summary} Summary */
/** @param {string} id @returns {HTMLElement} */
function element(id) { const result = document.getElementById(id); if (!result) throw new Error(`Missing dashboard element: ${id}`); return result; }

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
/** @returns {Promise<void>} */
async function refreshStats() {
 try { displaySummary(await fetchSummary()); }
 catch(error) { element('stats-status').textContent = 'Stats aren\'t loading'; for(const id of ['cpu','memory','array','uptime']) element(`${id}-value`).textContent = '—'; for(const id of ['cpu','memory','array']) element(`${id}-meter`).hidden = true; element('memory-detail').textContent = 'No memory reading.'; element('array-detail').textContent = 'No storage reading.'; element('disk-values').textContent = 'Couldn\'t load stats. Ask Matt to check the collector.'; console.error('Dashboard stats unavailable',{error}); }
 setTimeout(refreshStats,15000);
}
refreshStats();
