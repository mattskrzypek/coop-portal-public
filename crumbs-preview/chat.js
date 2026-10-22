// @ts-check
/** @typedef {{role:'user'|'assistant',content:string}} Message */
/** @param {string} id @returns {HTMLElement} */
function element(id) { const node = document.getElementById(id); if(!node) throw new Error(`Missing Crumbs interface element: ${id}`); return node; }
const form = element('chat-form'), input = element('message'), send = element('send-message');
if(!(form instanceof HTMLFormElement) || !(input instanceof HTMLTextAreaElement) || !(send instanceof HTMLButtonElement)) throw new TypeError('Crumbs composer has invalid element types');
/** @type {Message[]} */
let messages = [];
let conversationId = crypto.randomUUID();
let sending = false;
/** @param {string} role @param {string} content @returns {HTMLElement} */
function messageElement(role,content) {
 const article = document.createElement('article'); article.className = `message ${role}`;
 const label = document.createElement('h2'); label.textContent = role === 'user' ? 'YOU' : 'CRUMBS';
 const text = document.createElement('p'); text.textContent = content; article.append(label,text); return article;
}
/** @param {string} message @returns {void} */
function showError(message) { element('chat-error').textContent = message; element('chat-error').hidden = false; }
/** @returns {Promise<void>} */
async function checkConnection() {
 try { const response = await fetch('/api/health',{cache:'no-store',signal:AbortSignal.timeout(10000)}); if(!response.ok) throw new Error(`Private chat access check returned HTTP ${response.status}. Connect using your approved Tailscale account.`); const result = await response.json(); if(result.ready !== true || result.assistant !== 'Crumbs') throw new Error('The private chat service returned an invalid readiness response'); element('connection-status').textContent = 'Private chat · your perch is ready'; }
 catch(error) { element('connection-status').textContent = 'Private chat · connection unavailable'; send.disabled = true; showError(error instanceof Error ? error.message : 'Private chat readiness failed. Reload after connecting to Tailscale.'); }
}
form.addEventListener('submit',async event => {
 event.preventDefault(); if(sending) return; const content = input.value.trim(); if(!content) return;
 const proposed = [...messages,{role:'user',content}];
 if(proposed.length > 23 || proposed.reduce((sum,message) => sum + message.content.length,0) > 24000) { showError('This conversation has reached its context limit. Start a new conversation before sending more.'); return; }
 sending = true; send.disabled = true; element('chat-error').hidden = true; element('welcome-note').hidden = true;
 const userArticle = messageElement('user',content), pendingArticle = messageElement('assistant','Crumbs is gathering a few thoughts. Please refrain from scattering bread.'); pendingArticle.classList.add('pending');
 const transcript = element('conversation'); transcript.append(userArticle,pendingArticle); pendingArticle.scrollIntoView({block:'nearest'});
 element('connection-status').textContent = 'Crumbs is thinking…';
 try {
  const response = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json','X-Crumbs-Request':'chat'},body:JSON.stringify({conversationId,messages:proposed}),signal:AbortSignal.timeout(130000)});
  const result = await response.json(); if(!response.ok) throw new Error(typeof result.error === 'string' ? result.error : `Chat request failed with HTTP ${response.status}`);
  if(typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('Crumbs returned an incomplete reply');
  pendingArticle.replaceWith(messageElement('assistant',result.reply)); messages = [...messages,{role:'user',content},{role:'assistant',content:result.reply}]; input.value = ''; element('connection-status').textContent = 'Private chat · your perch is ready';
 } catch(error) {
  pendingArticle.remove(); userArticle.remove(); element('connection-status').textContent = 'Message not completed'; showError(error instanceof Error ? error.message : 'The request failed before a complete reply was received. Your message remains in the composer.');
 } finally { sending = false; send.disabled = false; input.focus(); }
});
input.addEventListener('keydown',event => { if(event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); form.requestSubmit(); } });
element('new-chat').addEventListener('click',() => {
 if(sending) { showError('Wait for Crumbs to finish before starting a new conversation.'); return; }
 messages = []; conversationId = crypto.randomUUID(); element('conversation').querySelectorAll('.message').forEach(message => message.remove()); element('welcome-note').hidden = false; element('chat-error').hidden = true; input.value = ''; input.focus();
});
const suggestions = [{id:'suggest-explain',text:'Explain how a reverse proxy and single sign-on work together, using a pigeon coop analogy.'},{id:'suggest-plan',text:'Help me plan a small project. Ask me what I want to make and suggest a simple first step.'},{id:'suggest-pigeon',text:'Give me one short piece of useful pigeon wisdom, in your Crumbs voice.'}];
for(const suggestion of suggestions) element(suggestion.id).addEventListener('click',() => { input.value = suggestion.text; input.focus(); });
checkConnection();
