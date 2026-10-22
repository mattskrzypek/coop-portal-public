// @ts-check
/** @typedef {{id:number,permissions:number,identity:string}} BridgeUser */
/** @typedef {{title:Title,user:BridgeUser,expires:number,seasons:number[]}} BridgeReview */
/** @type {Map<string,BridgeReview>} */
const bridgeReviews = new Map();
/** @returns {Promise<BridgeUser>} */
async function bridgeAccount() {
 const me = fields(await getSeerr('/auth/me')); const id = integer(me.id,'account ID');
 const links = items(await getSeerr(`/user/${id}/settings/linked-accounts`)).map(fields).filter(link=>fields(link.provider).slug === 'coop-authentik');
 if(links.length !== 1) throw new Error('This Requests account must have exactly one existing Coop link. Ask Matt to link it; no account or permissions have been changed.');
 return {id,permissions:integer(me.permissions,'permissions'),identity:textValue(links[0].username,'linked Coop identity')};
}
/** @param {BridgeUser} user @param {'movie'|'tv'} type @param {number} id @returns {Promise<{title:Title,seasons:{number:number,episodes:number,status:number}[]}>} */
async function bridgeDetail(user,type,id) {
 const raw = fields(await getSeerr(`/${type}/${id}`));
 const title = parseTitle({...raw,mediaType:type}); if(!title) throw new TypeError('Invalid selected title');
 if(!canRequest(user,type)) throw new Error('Your existing Requests permissions do not allow this type of request.');
 if(title.status === 6 || (type === 'movie' && [2,3,4,5].includes(title.status))) throw new Error(`This title cannot be requested: ${availability(title.status)}.`);
 const prior = raw.mediaInfo == null ? [] : items(fields(raw.mediaInfo).seasons).map(fields);
 const seasons = type === 'movie' ? [] : items(raw.seasons).map(fields).map(season=>{
  const number = integer(season.seasonNumber,'season number'); const existing = prior.find(item=>item.seasonNumber === number);
  return {number,episodes:integer(season.episodeCount,'episode count'),status:existing ? integer(existing.status,'season status') : 1};
 }).filter(season=>season.number > 0 && season.episodes > 0);
 if(type === 'tv' && !seasons.some(season=>![2,3,4,5].includes(season.status))) throw new Error('There are no unrequested seasons available for this show.');
 return {title,seasons};
}
/** @param {string} action @param {{[key:string]:Json}} body @param {BridgeUser} user @returns {Promise<{[key:string]:Json}>} */
async function bridgeAction(action,body,user) {
 if(action === 'search') {
  const query = textValue(body.query,'search title').trim(); if(!query || query.length > 150) throw new Error('Enter a movie or TV title of 1–150 characters.');
  const raw = fields(await getSeerr(`/search?query=${encodeURIComponent(query)}&page=1`));
  return {query,titles:items(raw.results).map(parseTitle).filter(title=>title !== null).slice(0,10)};
 }
 if(action === 'review') {
  const type = body.type; if(type !== 'movie' && type !== 'tv') throw new TypeError('Choose a movie or TV show');
  const detail = await bridgeDetail(user,type,integer(body.id,'title ID'));
  const confirmation = crypto.randomUUID();
  for(const [key,review] of bridgeReviews) if(review.expires < Date.now()) bridgeReviews.delete(key);
  bridgeReviews.set(confirmation,{title:detail.title,user,expires:Date.now()+600000,seasons:detail.seasons.filter(season=>![2,3,4,5].includes(season.status)).map(season=>season.number)});
  return {...detail,confirmation,account:user.identity,message:'Uses your existing Requests account, limits, approval rules and usual quality settings. Review and confirm below.'};
 }
 if(action !== 'confirm') throw new Error('Only title search, review and explicit confirmation are supported.');
 const confirmation = textValue(body.confirmation,'confirmation'); const review = bridgeReviews.get(confirmation);
 if(!review || review.expires < Date.now() || review.user.id !== user.id || review.user.identity !== user.identity) throw new Error('This confirmation has expired, was already used, or belongs to another sign-in. Choose the title again.');
 const seasons = items(body.seasons).map(value=>integer(value,'chosen season'));
 bridgeReviews.delete(confirmation);
 const detail = await bridgeDetail(user,review.title.type,review.title.id);
 const available = detail.seasons.filter(season=>![2,3,4,5].includes(season.status)).map(season=>season.number);
 if(review.title.type === 'movie' && seasons.length) throw new Error('A movie request cannot contain TV seasons.');
 if(review.title.type === 'tv' && (!seasons.length || new Set(seasons).size !== seasons.length || seasons.some(number=>!review.seasons.includes(number) || !available.includes(number)))) throw new Error('Choose at least one available season; availability may have changed.');
 // Consume before the write. A timeout or double-click must never trigger an automatic resend.
 const response = await fetch('/api/v1/request',{method:'POST',credentials:'same-origin',headers:requestHeaders(),body:JSON.stringify({mediaType:review.title.type,mediaId:review.title.id,is4k:false,...(review.title.type === 'tv' ? {seasons} : {})}),signal:AbortSignal.timeout(30000)});
 const result = fields(await response.json());
 if(response.status !== 201) throw new Error(`Requests returned HTTP ${response.status}: ${typeof result.message === 'string' ? result.message : typeof result.error === 'string' ? result.error : 'Request not confirmed'}. Check recent requests before trying again.`);
 if(fields(result.requestedBy).id !== user.id) throw new Error('Requests returned an unexpected account. Ask Matt to check the request; do not resend.');
 return {id:integer(result.id,'request ID'),status:integer(result.status,'request status'),title:review.title.title,account:user.identity,seasons};
}
window.addEventListener('message',async event=>{
 if(event.origin !== 'https://coop.fatpigeon.ca' || event.source !== window.parent || window.parent === window) return;
 /** @type {{[key:string]:Json}} */
 let envelope;
 try { envelope = fields(event.data); } catch(error) { if(!(error instanceof Error)) throw error; console.warn('Invalid request message',{error}); return; }
 if(typeof envelope.id !== 'string' || !/^[a-f0-9-]{36}$/.test(envelope.id)) return;
 try {
  const user = await bridgeAccount();
  if(user.identity !== envelope.identity) throw new Error('Requests is signed in as a different person than Coop. Sign out of Requests, then choose Sign in with Coop using your own account. No request was sent.');
  const result = await bridgeAction(textValue(envelope.action,'action'),fields(envelope.body),user);
  window.parent.postMessage({id:envelope.id,result},'https://coop.fatpigeon.ca');
 } catch(error) {
  if(!(error instanceof Error)) throw error;
  console.warn('Crumbs Requests operation failed',{action:envelope.action,error});
  window.parent.postMessage({id:envelope.id,error:error.message},'https://coop.fatpigeon.ca');
 }
});
if(window.parent !== window) window.parent.postMessage({ready:'crumbs-requests'},'https://coop.fatpigeon.ca');
