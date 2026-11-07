// @ts-check
/** @typedef {{role:'user'|'assistant',content:string}} Message */
/** @param {string} id @returns {HTMLElement} */
function element(id) { const node = document.getElementById(id); if(!node) throw new Error(`Missing Crumbs interface element: ${id}`); return node; }
/** @returns {HTMLButtonElement} */
function chatSendControl() { const control = element('send-message'); if(!(control instanceof HTMLButtonElement)) throw new TypeError('Crumbs send control must be a button'); return control; }
const form = element('chat-form'), input = element('message'), send = chatSendControl();
if(!(form instanceof HTMLFormElement) || !(input instanceof HTMLTextAreaElement) || !(send instanceof HTMLButtonElement)) throw new TypeError('Crumbs composer has invalid element types');
form.dataset.conversationId = crypto.randomUUID();
send.disabled = true;
/** @returns {Message[]} */
function conversationMessages() {
 return Array.from(element('conversation').querySelectorAll('.message')).map(article => {
  const role = article.getAttribute('data-role'), text = article.querySelector('p');
  if((role !== 'user' && role !== 'assistant') || !text) throw new Error('The chat has a message I can\'t read');
  return {role,content:text.textContent || ''};
 });
}
/** @param {string} role @param {string} content @returns {HTMLElement} */
function messageElement(role,content) {
 const article = document.createElement('article'); article.className = `message ${role}`;
 article.dataset.role = role;
 const label = document.createElement('h2'); label.textContent = role === 'user' ? 'YOU' : 'CRUMBS';
 const text = document.createElement('p'); text.textContent = content; article.append(label,text); return article;
}
/** @param {string} message @returns {void} */
function showError(message) { element('chat-error').textContent = message; element('chat-error').hidden = false; }
/** @returns {Promise<void>} */
async function checkConnection() {
 try { const response = await fetch('/crumbs/api/health',{cache:'no-store',signal:AbortSignal.timeout(15000)}); if(!response.ok) throw new Error(`Chat check failed (HTTP ${response.status}). Sign in to the Coop first.`); const result = await response.json(); if(result.ready !== true || result.assistant !== 'Crumbs') throw new Error('Crumbs answered, but not in a way that makes sense. Try reloading.'); element('connection-status').textContent = 'Crumbs is up'; send.disabled = false; }
 catch(error) { element('connection-status').textContent = 'Crumbs isn\'t answering'; send.disabled = true; showError(error instanceof Error ? error.message : 'Couldn\'t reach Crumbs. Reload and sign in.'); }
}
form.addEventListener('submit',async event => {
 event.preventDefault(); if(send.disabled) return; const content = input.value.trim(); if(!content) return;
 const searchQuery = mediaSearchCommand(content);
 if(searchQuery !== null) { input.value = ''; await mediaSearchInChat(searchQuery); return; }
 /** @type {Message[]} */
 const proposed = [...conversationMessages(),{role:'user',content}];
 if(proposed.length > 23 || proposed.reduce((sum,message) => sum + message.content.length,0) > 24000) { showError('This chat is too long. Start a new one before sending more.'); return; }
 send.disabled = true; element('chat-error').hidden = true; element('welcome-note').hidden = true;
 const userArticle = messageElement('user',content), pendingArticle = messageElement('assistant','Crumbs is thinking...'); pendingArticle.classList.add('pending');
 const transcript = element('conversation'); transcript.append(userArticle,pendingArticle); pendingArticle.scrollIntoView({block:'nearest'});
 element('connection-status').textContent = 'Crumbs is thinking...';
 try {
  const response = await fetch('/crumbs/api/chat',{method:'POST',headers:{'Content-Type':'application/json','X-Crumbs-Request':'chat'},body:JSON.stringify({conversationId:form.dataset.conversationId,messages:proposed}),signal:AbortSignal.timeout(130000)});
  const result = await response.json(); if(!response.ok) throw new Error(typeof result.error === 'string' ? result.error : `Chat request failed with HTTP ${response.status}`);
  if(typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('Crumbs sent back an empty reply.');
  pendingArticle.replaceWith(messageElement('assistant',result.reply)); input.value = ''; element('connection-status').textContent = 'Crumbs is up';
  if(typeof result.searchQuery === 'string') await mediaSearchInChat(result.searchQuery);
 } catch(error) {
  pendingArticle.remove(); userArticle.remove(); element('connection-status').textContent = 'Didn\'t send'; showError(error instanceof Error ? error.message : 'That didn\'t go through. Your message is still in the box.');
 } finally { send.disabled = false; input.focus(); }
});
input.addEventListener('keydown',event => { if(event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); form.requestSubmit(); } });
element('new-chat').addEventListener('click',() => {
 if(element('conversation').querySelector('.pending,.pending-media')) { showError('Wait until Crumbs finishes before starting a new chat.'); return; }
 form.dataset.conversationId = crypto.randomUUID(); element('conversation').querySelectorAll('.message,.media-card').forEach(message => message.remove()); element('welcome-note').hidden = false; element('chat-error').hidden = true; input.value = ''; input.focus();
});
const suggestions = [{id:'suggest-explain',text:'How is the server doing? Look at CPU, memory, storage and uptime, and say if you cannot actually check something.'},{id:'suggest-plan',text:'Help me plan a server job for Matt to approve. Ask what I need, then say what would change, the risk, what to check, and how to undo it. Do not run anything.'},{id:'suggest-pigeon',text:'One short useful pigeon fact. Keep it brief.'}];
for(const suggestion of suggestions) element(suggestion.id).addEventListener('click',() => { input.value = suggestion.text; input.focus(); });
checkConnection();

