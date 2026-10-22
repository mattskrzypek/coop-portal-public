// @ts-check
/** @typedef {import('./api-types').Json} Json */
/** @typedef {{id:number,permissions:number}} RequestUser */
/** @typedef {{id:number,type:'movie'|'tv',title:string,year:string,overview:string,status:number}} Title */
/** @param {string} id @returns {HTMLElement} */
function requestElement(id) { const value = document.getElementById(id); if(!value) throw new Error(`Missing Requests element: ${id}`); return value; }
/** @param {Json} value @returns {{[key:string]:Json}} */
function fields(value) { if(!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Seerr returned an invalid object'); return value; }
/** @param {Json} value @param {string} name @returns {number} */
function integer(value,name) { if(typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new TypeError(`Seerr returned an invalid ${name}`); return value; }
/** @param {Json} value @param {string} name @returns {string} */
function textValue(value,name) { if(typeof value !== 'string') throw new TypeError(`Seerr returned an invalid ${name}`); return value; }
/** @param {Json} value @returns {Json[]} */
function items(value) { if(!Array.isArray(value)) throw new TypeError('Seerr returned an invalid results list'); return value; }
/** @param {object} error @returns {string} */
function message(error) { return error instanceof Error ? error.message : 'The request failed. Please refresh and try again.'; }
/** @param {string} path @returns {Promise<Json>} */
async function getSeerr(path) {
 for(let attempt = 1; attempt <= 3; attempt += 1) {
  try {
   const response = await fetch(`/api/v1${path}`,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});
   if(response.status === 401 || response.status === 403) throw new Error('Sign in to Requests with an account that has access.');
   if(!response.ok) throw new Error(`Requests could not load ${path} (HTTP ${response.status}). Try again shortly.`);
   return response.json();
  } catch(error) {
   if(!(error instanceof Error)) throw error;
   if(error.message.startsWith('Sign in') || attempt === 3) throw error;
   console.warn('Seerr read failed',{path,attempt,error}); await new Promise(resolve => setTimeout(resolve,500 * attempt));
  }
 }
 throw new Error('Requests could not complete its read attempts.');
}
/** @param {Json} value @returns {Title|null} */
function parseTitle(value) {
 const data = fields(value); if(data.mediaType !== 'movie' && data.mediaType !== 'tv') return null;
 const date = data.mediaType === 'movie' ? data.releaseDate : data.firstAirDate;
 const media = data.mediaInfo == null ? null : fields(data.mediaInfo);
 return {id:integer(data.id,'title ID'),type:data.mediaType,title:textValue(data.mediaType === 'movie' ? data.title : data.name,'title'),year:date == null ? '' : textValue(date,'release date').slice(0,4),overview:textValue(data.overview,'description'),status:media ? integer(media.status,'availability') : 1};
}
/** @param {number} status @returns {string} */
function availability(status) { const labels = ['','Not requested','Waiting for approval','On its way','Some episodes ready','Ready to watch','Unavailable for requests','Removed from library']; return labels[status] ?? 'Check status in Requests'; }
/** @param {RequestUser} user @param {'movie'|'tv'} type @returns {boolean} */
function canRequest(user,type) { return (user.permissions & (2 | 32 | (type === 'movie' ? 262144 : 524288))) !== 0; }
/** @returns {Record<string,string>} */
function requestHeaders() {
 const csrf = document.cookie.split('; ').find(cookie => cookie.startsWith('XSRF-TOKEN='));
 /** @type {Record<string,string>} */ const headers = {'Content-Type':'application/json'};
 if(csrf) headers['X-XSRF-TOKEN'] = decodeURIComponent(csrf.slice('XSRF-TOKEN='.length));
 return headers;
}
