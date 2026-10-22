// @ts-check
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
export function capacityText(value) { return `${size(value.usedBytes)} of ${size(value.totalBytes)} used`; }
/** @returns {Promise<Summary>} */
export async function fetchSummary() {
 for(let attempt = 1; attempt <= 3; attempt += 1) {
  try { const response = await fetch('/stats/summary.json',{cache:'no-store',signal:AbortSignal.timeout(5000)}); if(!response.ok) throw new Error(`Server stats request failed: GET /stats/summary.json HTTP ${response.status}: ${await response.text()}`); return validateSummary(await response.json()); }
  catch(error) { console.warn('Server stats request failed',{attempt,error}); if(attempt === 3) throw error; await new Promise(resolve => setTimeout(resolve,1000)); }
 }
 throw new Error('Server stats retry limit reached');
}

