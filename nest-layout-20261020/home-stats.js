// @ts-check
import {fetchSummary,capacityText} from './stats-data.js';
/** @typedef {import('./stats-data.js').Summary} Summary */
/** @param {string} id @returns {HTMLElement} */
function element(id) { const result = document.getElementById(id); if(!result) throw new Error(`Missing welcome stats element: ${id}`); return result; }
/** @param {string} id @param {number} value @returns {void} */
function showReading(id,value) {
 element(`home-${id}`).textContent = `${Math.round(value)}%`;
 const meter = element(`home-${id}-meter`);
 if(!(meter instanceof HTMLMeterElement)) throw new TypeError(`Welcome stats meter has the wrong element type: ${id}`);
 meter.value = value; meter.hidden = false;
}
/** @param {Summary} data @returns {void} */
function displaySummary(data) {
 showReading('cpu',data.cpuPercent); showReading('memory',data.memory.percent); showReading('array',data.array.percent);
 element('home-memory').title = capacityText(data.memory); element('home-array').title = capacityText(data.array);
 const days = Math.floor(data.uptimeSeconds/86400), hours = Math.floor(data.uptimeSeconds%86400/3600);
 element('home-uptime').textContent = `${days}d ${hours}h`;
 element('home-stats-status').textContent = `Updated ${new Date(data.updatedUnix*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
}
/** @returns {Promise<void>} */
async function refreshStats() {
 try { displaySummary(await fetchSummary()); }
 catch(error) {
  element('home-stats-status').textContent = 'Can\'t get the numbers. Ask Matt.';
  for(const id of ['cpu','memory','array','uptime']) { const reading = element(`home-${id}`); reading.textContent = '—'; reading.removeAttribute('title'); }
  for(const id of ['cpu','memory','array']) element(`home-${id}-meter`).hidden = true;
  console.error('Welcome stats unavailable',{error});
 }
 setTimeout(refreshStats,15000);
}
refreshStats();

