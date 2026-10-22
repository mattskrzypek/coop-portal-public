// @ts-check
/** @typedef {import('../../coop-redesign-20261020/release/api-types').Json} MediaJson */
/** @param {MediaJson} value @returns {{[key:string]:MediaJson}} */
function mediaFields(value) { if(!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Requests returned an invalid object'); return value; }
/** @param {MediaJson} value @returns {MediaJson[]} */
function mediaItems(value) { if(!Array.isArray(value)) throw new TypeError('Requests returned an invalid list'); return value; }
/** @param {MediaJson} value @returns {string} */
function mediaText(value) { if(typeof value !== 'string') throw new TypeError('Requests returned invalid text'); return value; }
/** @param {MediaJson} value @returns {number} */
function mediaNumber(value) { if(typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new TypeError('Requests returned an invalid number'); return value; }
/** @param {string} id @returns {HTMLElement} */
function mediaElement(id) { const node = document.getElementById(id); if(!node) throw new Error(`Missing Crumbs element: ${id}`); return node; }
/** @param {string} path @param {{[key:string]:MediaJson}} body @returns {Promise<{[key:string]:MediaJson}>} */
async function mediaCall(path,body) {
 const response = await fetch('/crumbs/api/identity',{cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok) throw new Error(`Coop sign-in check returned HTTP ${response.status}; sign in to Coop again.`);
 const identity = mediaText(mediaFields(await response.json()).identity);
 const frame = mediaElement('crumbs-requests-connection'); if(!(frame instanceof HTMLIFrameElement)) throw new TypeError('Requests connection must be a frame');
 await mediaBridgeReady;
 const target = frame.contentWindow; if(!target) throw new Error('Requests connection is unavailable');
 const identifier = crypto.randomUUID();
 return new Promise((resolve,reject)=>{
  const timer = setTimeout(()=>{window.removeEventListener('message',receive); reject(new Error('Requests did not return a confirmed result. Check recent requests before retrying.'));},60000);
  /** @param {MessageEvent<MediaJson>} event @returns {void} */
  function receive(event) {
   if(event.origin !== 'https://requests.fatpigeon.ca' || event.source !== target) return;
   const result = mediaFields(event.data); if(result.id !== identifier) return;
   clearTimeout(timer); window.removeEventListener('message',receive);
   if(result.signInRequired === true) {
    if(mediaElement('conversation').querySelector('.pending')) {reject(new Error('Wait for Crumbs to finish, then search again to connect Requests.')); return;}
    const composer = mediaElement('message'); if(!(composer instanceof HTMLTextAreaElement)) throw new TypeError('Crumbs composer must be a textarea');
    const query = path === 'search' ? mediaText(body.query) : sessionStorage.getItem('crumbs-last-media-query');
    if(!query) {reject(new Error('Search for the title again to connect Requests using your Coop sign-in.')); return;}
    sessionStorage.setItem('crumbs-sso-handoff',JSON.stringify({identity,query,savedAt:Date.now(),messages:conversationMessages(),conversationId:mediaElement('chat-form').dataset.conversationId,draft:composer.value}));
    const destination = new URL('https://requests.fatpigeon.ca/coop/'); destination.searchParams.set('coop_return',location.pathname === '/crumbs/' ? 'chat' : 'home'); destination.searchParams.set('expected',identity);
    location.assign(destination.href); reject(new Error('Connecting Requests using your existing Coop sign-in…')); return;
   }
   if(typeof result.error === 'string') {reject(new Error(result.error)); return;}
   resolve(mediaFields(result.result));
  }
  window.addEventListener('message',receive);
  target.postMessage({id:identifier,action:path,identity,body},'https://requests.fatpigeon.ca');
 });
}
/** @param {number} status @returns {string} */
function mediaAvailability(status) { const labels = ['','Not requested','Waiting for approval','On its way','Some episodes ready','Ready to watch','Unavailable for requests','Removed from library']; return labels[status] ?? `Requests status ${status}`; }
/** @param {string} tag @param {string} text @returns {HTMLElement} */
function mediaNode(tag,text) { const node = document.createElement(tag); node.textContent = text; return node; }
/** @param {string} heading @returns {HTMLElement} */
function mediaCard(heading) {
 const card = document.createElement('article'); card.className = 'media-card'; card.tabIndex = -1;
 card.append(mediaNode('h3',heading)); mediaElement('welcome-note').hidden = true;
 mediaElement('conversation').append(card); card.scrollIntoView({block:'nearest'}); return card;
}
/** @param {HTMLElement} card @param {Error} error @returns {void} */
function mediaFailure(card,error) {
 const text = mediaNode('p',error.message); text.setAttribute('role','alert'); text.className = 'media-error'; card.append(text);
 const signIn = document.createElement('a'); signIn.href = 'https://requests.fatpigeon.ca/coop/'; signIn.target = '_blank'; signIn.rel = 'noopener'; signIn.textContent = 'Open Requests to sign in or check status ↗'; card.append(signIn);
 card.append(mediaNode('p','After signing in to Requests, return here and search again. Your Coop and Requests accounts must be linked to each other.'));
}
/** @param {number} id @param {'movie'|'tv'} type @returns {Promise<void>} */
async function mediaReviewInChat(id,type) {
 const card = mediaCard('Review your request'); card.classList.add('pending-media');
 const status = mediaNode('p','Checking your linked account and the latest availability…'); status.setAttribute('role','status'); card.append(status);
 try {
  const result = await mediaCall('review',{id,type}); const title = mediaFields(result.title); const seasons = mediaItems(result.seasons);
  const name = mediaText(title.title), year = mediaText(title.year); const confirmation = mediaText(result.confirmation);
  status.textContent = `${name}${year ? ` (${year})` : ''} · ${type === 'movie' ? 'Movie' : 'TV show'}`;
  const about = document.createElement('details'); about.append(mediaNode('summary','About this title'),mediaNode('p',mediaText(title.overview)));
  card.append(about,mediaNode('p',`Requests account: ${mediaText(result.account)}. ${mediaText(result.message)}`));
  const options = document.createElement('fieldset');
  if(type === 'tv') {
   options.append(mediaNode('legend','Choose seasons'));
   for(const raw of seasons) {
    const season = mediaFields(raw), number = mediaNumber(season.number), available = mediaNumber(season.status);
    const label = document.createElement('label'), check = document.createElement('input'); check.type = 'checkbox'; check.value = String(number); check.dataset.mediaSeason = String(number); check.disabled = [2,3,4,5].includes(available);
    label.append(check,`Season ${number} · ${mediaNumber(season.episodes)} episodes${check.disabled ? ` · ${mediaAvailability(available)}` : ''}`); options.append(label);
   }
   options.addEventListener('change',()=>{feedback.textContent = '';}); card.append(options);
  }
  const actions = document.createElement('div'); actions.className = 'media-actions';
  const confirm = document.createElement('button'); confirm.type = 'button'; confirm.className = 'primary'; confirm.textContent = 'Confirm request'; confirm.dataset.mediaConfirm = `${type}-${id}`;
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Cancel'; cancel.dataset.mediaCancel = `${type}-${id}`; cancel.addEventListener('click',()=>card.remove());
  const feedback = mediaNode('p',''); feedback.setAttribute('role','status'); feedback.dataset.mediaFeedback = `${type}-${id}`;
  confirm.addEventListener('click',async()=>{
   const chosen = Array.from(options.querySelectorAll('input:checked')).map(node=>{if(!(node instanceof HTMLInputElement)) throw new TypeError('Invalid season control'); return Number(node.value);});
   if(type === 'tv' && !chosen.length) { feedback.textContent = 'Choose at least one season first.'; return; }
   confirm.disabled = true; cancel.disabled = true; card.classList.add('pending-media'); feedback.textContent = 'Sending your confirmed request…';
   try {
    const submitted = await mediaCall('confirm',{confirmation,seasons:chosen}); const requestId = mediaNumber(submitted.id), requestStatus = mediaNumber(submitted.status);
    const requestState = ['','Waiting for approval.','Approved · on its way.','Declined.','Needs attention.','Ready to watch.'][requestStatus];
    feedback.textContent = `Request #${requestId} for ${mediaText(submitted.title)} sent as ${mediaText(submitted.account)}. ${requestState ?? `Seerr status ${requestStatus}.`}`;
    confirm.textContent = 'Request sent'; options.disabled = true;
   } catch(error) { if(!(error instanceof Error)) throw error; feedback.textContent = error.message; confirm.textContent = 'Check status before retrying'; }
   finally { card.classList.remove('pending-media'); cancel.disabled = false; cancel.textContent = 'Close'; }
  });
  actions.append(confirm,cancel); card.append(mediaNode('strong',`Confirm: ${name}${year ? ` (${year})` : ''}`),actions,feedback);
  const history = document.createElement('a'); history.href = 'https://requests.fatpigeon.ca/coop/#history-title'; history.target = '_blank'; history.rel = 'noopener'; history.textContent = 'Check my recent requests ↗'; card.append(history);
 } catch(error) { if(!(error instanceof Error)) throw error; status.textContent = 'This request cannot be confirmed.'; mediaFailure(card,error); }
 finally { card.classList.remove('pending-media'); card.focus(); }
}
/** @param {string} query @returns {Promise<void>} */
async function mediaSearchInChat(query) {
 sessionStorage.setItem('crumbs-last-media-query',query);
 const card = mediaCard(`Movies & TV: ${query}`); card.classList.add('pending-media');
 const status = mediaNode('p','Crumbs is checking the shelves…'); status.setAttribute('role','status'); card.append(status);
 try {
  const result = await mediaCall('search',{query}); const titles = mediaItems(result.titles);
  status.textContent = titles.length ? 'Choose the right title, then review and confirm. Nothing has been requested yet.' : 'No matching movies or shows. Try a different title.';
  for(const raw of titles) {
   const title = mediaFields(raw); const id = mediaNumber(title.id), type = mediaText(title.type), name = mediaText(title.title), year = mediaText(title.year);
   if(type !== 'movie' && type !== 'tv') throw new TypeError('Invalid movie or TV result');
   const row = document.createElement('div'); row.className = 'media-result';
   row.append(mediaNode('strong',`${name}${year ? ` (${year})` : ''}`),mediaNode('p',`${type === 'movie' ? 'Movie' : 'TV show'} · ${mediaAvailability(mediaNumber(title.status))}`));
   const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Choose title'; button.dataset.mediaTitle = `${type}-${id}`; button.addEventListener('click',()=>{void mediaReviewInChat(id,type);}); row.append(button); card.append(row);
  }
 } catch(error) { if(!(error instanceof Error)) throw error; status.textContent = 'Title search could not finish.'; mediaFailure(card,error); }
 finally { card.classList.remove('pending-media'); card.focus(); }
}
/** @param {string} content @returns {string|null} */
function mediaSearchCommand(content) {
 if(!/\b(movie|film|tv show|show|series)\b|^\/search\s/i.test(content) && /\b(app|apps|password|account|help|server|photos|audiobook|books)\b/i.test(content)) return null;
 const match = content.match(/^(?:\/search\s+|(?:please\s+)?(?:find|search for|request)\s+(?:(?:the|a)\s+)?(?:(?:movie|film|tv show|show|series)\s+(?:called\s+)?)?)(.{1,150})$/i);
 return match ? match[1].trim().replace(/^"|"$/g,'') : null;
}
const mediaSearchButton = document.createElement('button'); mediaSearchButton.type = 'button'; mediaSearchButton.id = 'chat-find-media'; mediaSearchButton.textContent = 'Find movie or TV'; mediaSearchButton.className = 'quiet';
mediaSearchButton.addEventListener('click',()=>{
 const composer = mediaElement('message'); if(!(composer instanceof HTMLTextAreaElement)) throw new TypeError('Crumbs composer must be a textarea');
 const query = composer.value.trim(); if(!query || query.length > 150) { composer.focus(); composer.setCustomValidity('Enter a movie or TV title of 1–150 characters, then choose Find movie or TV.'); composer.reportValidity(); composer.addEventListener('input',()=>composer.setCustomValidity(''),{once:true}); return; }
 composer.value = ''; void mediaSearchInChat(query);
});
mediaElement('chat-form').append(mediaSearchButton);
const mediaFrame = document.createElement('iframe'); mediaFrame.id = 'crumbs-requests-connection'; mediaFrame.title = 'Private Requests connection'; mediaFrame.hidden = true;
const mediaBridgeReady = new Promise((resolve,reject)=>{
 const timer = setTimeout(()=>{window.removeEventListener('message',ready); reject(new Error('The Requests connection did not load. Reload the page to reconnect.'));},30000);
 /** @param {MessageEvent<MediaJson>} event @returns {void} */
 function ready(event) {
  if(event.origin !== 'https://requests.fatpigeon.ca' || event.source !== mediaFrame.contentWindow || mediaFields(event.data).ready !== 'crumbs-requests') return;
  clearTimeout(timer); window.removeEventListener('message',ready); resolve(true);
 }
 window.addEventListener('message',ready);
});
// The catch records load failures immediately; searches still receive the rejected readiness promise.
mediaBridgeReady.catch(error=>console.error('Requests connection failed',{error}));
mediaFrame.src = 'https://requests.fatpigeon.ca/coop/chat-bridge.html'; document.body.append(mediaFrame);
window.addEventListener('DOMContentLoaded',async()=>{
 const saved = sessionStorage.getItem('crumbs-sso-handoff'); if(saved === null) return;
 sessionStorage.removeItem('crumbs-sso-handoff');
 try {
  const handoff = mediaFields(JSON.parse(saved));
  const response = await fetch('/crumbs/api/identity',{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok) throw new Error(`Coop identity check returned HTTP ${response.status}`);
  const identity = mediaText(mediaFields(await response.json()).identity);
  if(handoff.identity !== identity || Date.now()-mediaNumber(handoff.savedAt) > 600000) throw new Error('The sign-in handoff expired or the Coop account changed. Start a fresh conversation.');
  const conversationId = mediaText(handoff.conversationId); if(!/^[a-f0-9-]{36}$/.test(conversationId)) throw new Error('The saved conversation identifier is invalid.');
  const messages = mediaItems(handoff.messages).map(raw=>{
   const message = mediaFields(raw); const role = mediaText(message.role), content = mediaText(message.content);
   if((role !== 'user' && role !== 'assistant') || content.length > 12000) throw new Error('The saved conversation contains an invalid message.');
   return {role,content};
  });
  if(messages.length > 24 || messages.reduce((sum,message)=>sum+message.content.length,0)>24000) throw new Error('The saved conversation exceeds the chat limit.');
  mediaElement('chat-form').dataset.conversationId = conversationId;
  for(const message of messages) mediaElement('conversation').append(messageElement(message.role,message.content));
  const composer = mediaElement('message'); if(!(composer instanceof HTMLTextAreaElement)) throw new TypeError('Crumbs composer must be a textarea'); composer.value = mediaText(handoff.draft);
  await mediaSearchInChat(mediaText(handoff.query));
 } catch(error) {if(!(error instanceof Error)) throw error; showError(error.message);}
});
