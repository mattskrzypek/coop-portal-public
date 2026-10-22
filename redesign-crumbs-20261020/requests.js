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
/** @returns {Promise<void>} */
async function signInToRequests() {
 const query = requestElement('title-query'); if(!(query instanceof HTMLInputElement)) throw new TypeError('Title search must be an input');
 sessionStorage.setItem('coop-request-query',query.value.trim());
 requestElement('session-status').textContent = 'Opening Coop sign-in…';
 try {
  const data = fields(await getSeerr('/auth/oidc/login/coop-authentik?returnUrl=https%3A%2F%2Frequests.fatpigeon.ca%2Fcoop%2F'));
  const target = new URL(textValue(data.redirectUrl,'sign-in address'));
  if(target.origin !== 'https://auth.fatpigeon.ca') throw new Error('Requests returned an unexpected sign-in destination. Ask Matt to check the Coop provider.');
  location.assign(target.href);
 } catch(error) { if(!(error instanceof Error)) throw error; requestElement('session-status').textContent = message(error); console.error('Seerr sign-in failed',{error}); }
}
/** @returns {Promise<void>} */
async function completeSignIn() {
 const parameters = new URLSearchParams(location.search);
 if(parameters.has('error')) { history.replaceState(null,'','/coop/'); throw new Error('Coop did not authorize sign-in. Try again or ask Matt for access.'); }
 if(!parameters.has('code')) return;
 requestElement('session-status').textContent = 'Finishing your Coop sign-in…';
 const callbackUrl = location.href;
 const savedQuery = sessionStorage.getItem('coop-request-query');
 const clean = new URL('/coop/',location.origin); if(savedQuery) clean.searchParams.set('q',savedQuery);
 history.replaceState(null,'',clean);
 // Seerr validates the signed state cookie, PKCE verifier and exact callback.
 const response = await fetch('/api/v1/auth/oidc/callback/coop-authentik',{method:'POST',headers:requestHeaders(),credentials:'same-origin',body:JSON.stringify({callbackUrl}),signal:AbortSignal.timeout(30000)});
 if(!response.ok) {
  const result = fields(await response.json());
  const explanation = result.error === 'UNAUTHORIZED' ? 'Use your existing Requests sign-in below. Your account may need to be linked to Coop; ask Matt for help.' : typeof result.error === 'string' ? result.error : typeof result.message === 'string' ? result.message : 'Please start a fresh sign-in.';
  throw new Error(`Requests could not finish Coop sign-in (HTTP ${response.status}): ${explanation}`);
 }
 sessionStorage.removeItem('coop-request-query');
}
/** @param {string} title @param {string} detail @returns {HTMLElement} */
function resultRow(title,detail) { const row = document.createElement('article'); row.className = 'result'; const content = document.createElement('div'); const heading = document.createElement('h3'); heading.textContent = title; const description = document.createElement('p'); description.textContent = detail; content.append(heading,description); row.append(content); return row; }
/** @param {RequestUser} user @returns {Promise<void>} */
async function loadHistory(user) {
 requestElement('history-status').textContent = 'Checking your recent requests…';
 try {
  const data = fields(await getSeerr(`/request?take=8&skip=0&requestedBy=${user.id}&sort=added`));
  const rows = await Promise.all(items(data.results).map(async raw => {
   const request = fields(raw), media = fields(request.media); const type = request.type;
   if(type !== 'movie' && type !== 'tv') throw new TypeError('Seerr returned an invalid request type');
   const id = integer(media.tmdbId,'requested title ID');
   const detail = fields(await getSeerr(`/${type}/${id}`));
   const title = textValue(type === 'movie' ? detail.title : detail.name,'requested title');
   const status = integer(request.status,'request status');
   const labels = ['','Waiting for approval','Approved · on its way','Declined','Needs attention','Ready to watch'];
   const row = resultRow(title,`${type === 'movie' ? 'Movie' : 'TV show'} · ${labels[status] ?? 'Check status in Requests'}`);
   const link = document.createElement('a'); link.className = 'secondary'; link.href = `/${type}/${id}`; link.textContent = 'View details'; row.append(link); return row;
  }));
  requestElement('request-history').replaceChildren(...rows); requestElement('history-status').textContent = rows.length ? 'Your latest requests. Refresh to check for changes.' : 'No requests yet. The pigeon is standing by.';
 } catch(error) { if(!(error instanceof Error)) throw error; requestElement('history-status').textContent = message(error); console.error('Request history failed',{error}); }
}
/** @param {Title} title @param {RequestUser} user @returns {Promise<void>} */
async function selectTitle(title,user) {
 const panel = requestElement('confirmation'); panel.dataset.title = `${title.type}-${title.id}`; panel.hidden = false; panel.focus();
 requestElement('selected-title').textContent = `${title.title}${title.year ? ` (${title.year})` : ''} · ${title.type === 'movie' ? 'Movie' : 'TV show'}`;
 requestElement('selected-description').textContent = title.overview;
 requestElement('confirm-detail').textContent = 'Checking the latest availability…'; requestElement('request-feedback').textContent = '';
 const options = requestElement('season-options'); options.replaceChildren();
 const confirm = requestElement('confirm-request'); if(!(confirm instanceof HTMLButtonElement)) throw new TypeError('Request confirmation must be a button');
 confirm.disabled = true; confirm.onclick = null;
 try {
  const detail = fields(await getSeerr(`/${title.type}/${title.id}`));
  if(panel.dataset.title !== `${title.type}-${title.id}`) return;
  const media = detail.mediaInfo == null ? null : fields(detail.mediaInfo);
  const status = media ? integer(media.status,'availability') : 1;
  if(title.type === 'movie' && status >= 2 && status <= 6) { requestElement('confirm-detail').textContent = availability(status); return; }
  if(status === 6) { requestElement('confirm-detail').textContent = 'This title is unavailable for requests. Ask Matt for help.'; return; }
  if(!canRequest(user,title.type)) { requestElement('confirm-detail').textContent = 'Your account cannot request this type of title. Ask Matt for access.'; return; }
  if(title.type === 'tv') {
   const existing = media && media.seasons != null ? items(media.seasons).map(raw => fields(raw)) : [];
   const seasons = items(detail.seasons).map(raw => fields(raw)).filter(season => integer(season.seasonNumber,'season number') > 0 && integer(season.episodeCount,'episode count') > 0);
   const fieldset = document.createElement('fieldset'); const legend = document.createElement('legend'); legend.textContent = 'Choose the seasons you want'; fieldset.append(legend);
   for(const season of seasons) {
    const number = integer(season.seasonNumber,'season number'); const prior = existing.find(item => item.seasonNumber === number); const priorStatus = prior ? integer(prior.status,'season status') : 1;
    const label = document.createElement('label'); const check = document.createElement('input'); check.type = 'checkbox'; check.name = 'season'; check.value = String(number); check.id = `season-${number}`; check.disabled = priorStatus >= 2 && priorStatus <= 5;
    label.append(check,`Season ${number}${check.disabled ? ` · ${availability(priorStatus)}` : ''}`); fieldset.append(label);
   }
   options.append(fieldset); if(!seasons.length) { requestElement('confirm-detail').textContent = 'No seasons are available to request yet.'; return; }
  }
  requestElement('confirm-detail').textContent = 'This uses your Requests account and its normal limits and approval rules. Your usual library quality settings apply.';
  confirm.disabled = false;
  confirm.onclick = async () => {
   const seasons = Array.from(options.querySelectorAll('input:checked')).map(input => { if(!(input instanceof HTMLInputElement)) throw new TypeError('Season selector must be an input'); return Number(input.value); });
   if(title.type === 'tv' && seasons.length === 0) { requestElement('request-feedback').textContent = 'Choose at least one season first.'; return; }
   confirm.disabled = true; requestElement('request-feedback').textContent = 'Sending your request…';
   try {
    const response = await fetch('/api/v1/request',{method:'POST',credentials:'same-origin',headers:requestHeaders(),body:JSON.stringify({mediaType:title.type,mediaId:title.id,is4k:false,...(title.type === 'tv' ? {seasons} : {})}),signal:AbortSignal.timeout(30000)});
    const result = fields(await response.json());
    if(response.status !== 201) { const explanation = typeof result.message === 'string' ? result.message : typeof result.error === 'string' ? result.error : 'Check your account permissions, request limit, and existing requests.'; throw new Error(`Request was not accepted (HTTP ${response.status}). ${explanation}`); }
    const requestStatus = integer(result.status,'submitted request status'); integer(result.id,'submitted request ID');
    requestElement('request-feedback').textContent = requestStatus === 1 ? 'Request sent! It’s waiting for approval. Crumbs has filed the paperwork.' : requestStatus === 5 ? 'This title is ready to watch!' : 'Request sent and approved. Check its progress below.';
    confirm.textContent = 'Request sent'; await loadHistory(user);
   } catch(error) { if(!(error instanceof Error)) throw error; requestElement('request-feedback').textContent = `${message(error)} Refresh your recent requests before sending again; it may already have arrived.`; console.error('Seerr submission failed',{titleId:title.id,type:title.type,error}); }
  };
 } catch(error) { if(!(error instanceof Error)) throw error; requestElement('confirm-detail').textContent = message(error); console.error('Title selection failed',{titleId:title.id,error}); }
}
/** @param {string} query @param {number} page @param {RequestUser} user @returns {Promise<void>} */
async function searchTitles(query,page,user) {
 const status = requestElement('search-status'); status.dataset.search = `${query}:${page}`; status.textContent = 'Crumbs is checking the shelves…';
 const more = requestElement('more-results'); more.hidden = true;
 try {
  const data = fields(await getSeerr(`/search?query=${encodeURIComponent(query)}&page=${page}`));
  if(status.dataset.search !== `${query}:${page}`) return;
  const titles = items(data.results).map(parseTitle).filter(title => title !== null);
  const rows = titles.map(title => {
   const row = resultRow(`${title.title}${title.year ? ` (${title.year})` : ''}`,`${title.type === 'movie' ? 'Movie' : 'TV show'} · ${availability(title.status)}`);
   const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.dataset.titleId = `${title.type}-${title.id}`; button.textContent = 'Choose title'; button.addEventListener('click',() => { requestElement('confirm-request').textContent = 'Send request'; void selectTitle(title,user); }); row.append(button); return row;
  });
  const results = requestElement('results'); if(page === 1) results.replaceChildren(...rows); else results.append(...rows);
  status.textContent = titles.length ? `Results for “${query}” · page ${page}. Choose a title to review it.` : 'No movies or shows on this page. Try a different title.';
  more.hidden = page >= integer(data.totalPages,'page count'); more.onclick = () => { void searchTitles(query,page + 1,user); };
 } catch(error) { if(!(error instanceof Error)) throw error; status.textContent = message(error); console.error('Title search failed',{query,page,error}); }
}
/** @returns {Promise<void>} */
async function startRequests() {
 const queryInput = requestElement('title-query'); if(!(queryInput instanceof HTMLInputElement)) throw new TypeError('Title search must be an input');
 const query = new URLSearchParams(location.search).get('q'); if(query) queryInput.value = query.slice(0,150);
 const signIn = requestElement('request-signin'); signIn.removeAttribute('target'); signIn.textContent = 'Sign in with Coop'; signIn.addEventListener('click',event => { event.preventDefault(); void signInToRequests(); });
 const hint = requestElement('signin-actions').querySelector('p'); if(!hint) throw new Error('Missing sign-in help'); hint.textContent = 'Already have a Requests account? Sign in with your usual login, then return here and refresh.';
 const existingSignIn = document.createElement('a'); existingSignIn.id = 'existing-request-signin'; existingSignIn.href = '/login'; existingSignIn.target = '_blank'; existingSignIn.rel = 'noopener'; existingSignIn.className = 'secondary'; existingSignIn.textContent = 'Use existing Requests sign-in ↗'; requestElement('signin-actions').insertBefore(existingSignIn,hint);
 requestElement('check-signin').textContent = 'Refresh after sign-in';
 const form = requestElement('title-search'); form.addEventListener('submit',event => event.preventDefault());
 requestElement('cancel-request').addEventListener('click',() => { requestElement('confirmation').hidden = true; queryInput.focus(); });
 requestElement('check-signin').addEventListener('click',() => location.reload());
 try {
  await completeSignIn();
  const returnedQuery = new URLSearchParams(location.search).get('q'); if(returnedQuery) queryInput.value = returnedQuery.slice(0,150);
  const data = fields(await getSeerr('/auth/me')); const user = {id:integer(data.id,'user ID'),permissions:integer(data.permissions,'permissions')};
  requestElement('session-status').textContent = 'You’re signed in. Your account’s permissions and request limits apply.';
  form.addEventListener('submit',() => {
   const value = queryInput.value.trim(); if(!value) return;
   const url = new URL(location.href); url.searchParams.set('q',value); history.replaceState(null,'',url);
   requestElement('confirmation').hidden = true; void searchTitles(value,1,user);
  });
  requestElement('refresh-history').addEventListener('click',() => { void loadHistory(user); });
  await Promise.all([loadHistory(user),...(queryInput.value.trim() ? [searchTitles(queryInput.value.trim(),1,user)] : [])]);
 } catch(error) {
  if(!(error instanceof Error)) throw error;
  requestElement('session-status').textContent = message(error); requestElement('signin-actions').hidden = false;
  requestElement('search-status').textContent = 'Sign in to Requests to search and send a request.';
  requestElement('history-status').textContent = 'Your recent requests appear after you sign in.';
  const refresh = requestElement('refresh-history'); if(refresh instanceof HTMLButtonElement) refresh.disabled = true;
  form.addEventListener('submit',() => { const url = new URL(location.href); url.searchParams.set('q',queryInput.value.trim()); history.replaceState(null,'',url); requestElement('session-status').textContent = 'Please sign in to Requests below, then select “Refresh after sign-in”.'; requestElement('request-signin').focus(); });
 }
}
void startRequests();
